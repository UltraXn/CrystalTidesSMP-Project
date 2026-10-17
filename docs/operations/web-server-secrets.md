# Secretos del web-server

Vault es la fuente de verdad de los secretos del backend. Así el servidor no depende
de un proveedor concreto: en Cloud Run, en una VM o en otro PaaS solo cambia cómo
recibe el **token de Vault**. Todo lo demás lo lee de Vault al arrancar.

```
GitHub Actions ──(WIF, sin claves)──▶ GCP: build + deploy
Cloud Run ──(Secret Manager: vault-token)──▶ VAULT_TOKEN
web-server ──(token periódico, solo lectura)──▶ Vault: secret/data/crystaltides
```

| Dónde                                 | Qué                                                                     |
| :------------------------------------ | :---------------------------------------------------------------------- |
| Vault `secret/data/crystaltides`      | Todos los secretos: Supabase, JWT, `COOKIE_SECRET`, webhooks, API keys…  |
| Secret Manager `vault-token`          | Solo el token de Vault del backend.                                     |
| GitHub secret `ENV_FILE`              | Solo configuración **no secreta** (Cloud Run la muestra en claro).       |
| GitHub vars `GCP_WORKLOAD_IDENTITY_*` | Identidad del despliegue (no son secretos).                              |

Si el backend se muda fuera de GCP, basta con entregar `VAULT_ADDR` y `VAULT_TOKEN` por
el mecanismo de secretos del nuevo host. El código no cambia.

## Migración (una vez)

Los pasos 1 a 4 se hacen **antes** de mergear a `main` el cambio de `deploy.yml`. Si no,
el despliegue falla porque el secreto `vault-token` todavía no existe.

### 1. Token de Vault con política mínima

```bash
vault policy write crystaltides-web-server deploy/vault/web-server.hcl

# Periódico: no caduca mientras se renueve. El servidor lo renueva en cada arranque.
vault token create -orphan -policy=crystaltides-web-server -period=720h \
  -display-name=web-server-cloudrun -field=token
```

Comprueba que lee y no escribe:

```bash
VAULT_TOKEN=<nuevo> vault kv get secret/crystaltides          # OK
VAULT_TOKEN=<nuevo> vault kv put secret/crystaltides x=1      # permission denied
```

### 2. Mover los secretos de `ENV_FILE` a Vault

Pasa a `secret/crystaltides` todo lo que sea secreto, incluidas las variables nuevas de la
fase 1: `COOKIE_SECRET`, `BRIDGE_WS_TOKEN`, `TOTP_ENCRYPTION_KEY` y `ADMIN_JWT_SECRET`
(con 32 caracteres o más). En `ENV_FILE` deja solo la configuración (puertos, URLs
públicas, `TRUST_PROXY_HOPS`…). El workflow falla si `ENV_FILE` contiene `VAULT_TOKEN`.

### 3. Guardar el token en Secret Manager

```bash
printf '%s' '<nuevo token>' | gcloud secrets create vault-token \
  --project=crystaltides-prod --replication-policy=automatic --data-file=-

# Cuenta de servicio con la que corre el backend (vacío = la de Compute por defecto,
# <PROJECT_NUMBER>-compute@developer.gserviceaccount.com)
gcloud run services describe crystaltides-backend --region=us-central1 \
  --format='value(spec.template.spec.serviceAccountName)'

gcloud secrets add-iam-policy-binding vault-token --project=crystaltides-prod \
  --member='serviceAccount:<RUNTIME_SA>' --role='roles/secretmanager.secretAccessor'
```

### 4. Workload Identity Federation para GitHub Actions

```bash
PROJECT=crystaltides-prod
PROJECT_NUMBER=$(gcloud projects describe $PROJECT --format='value(projectNumber)')
REPO=UltraXn/CrystalTidesSMP-Project

gcloud iam workload-identity-pools create github --project=$PROJECT --location=global
gcloud iam workload-identity-pools providers create-oidc github --project=$PROJECT \
  --location=global --workload-identity-pool=github \
  --issuer-uri=https://token.actions.githubusercontent.com \
  --attribute-mapping='google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref' \
  --attribute-condition="assertion.repository=='$REPO' && assertion.ref=='refs/heads/main'"

gcloud iam service-accounts create github-deployer --project=$PROJECT
DEPLOYER=github-deployer@$PROJECT.iam.gserviceaccount.com
for ROLE in roles/run.admin roles/artifactregistry.writer; do
  gcloud projects add-iam-policy-binding $PROJECT --member=serviceAccount:$DEPLOYER --role=$ROLE
done
# Desplegar "como" la cuenta de runtime del backend
gcloud iam service-accounts add-iam-policy-binding <RUNTIME_SA> \
  --member=serviceAccount:$DEPLOYER --role=roles/iam.serviceAccountUser
# Solo los workflows de este repo, en main, pueden usar github-deployer
gcloud iam service-accounts add-iam-policy-binding $DEPLOYER \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/attribute.repository/$REPO"
```

En GitHub → Settings → Secrets and variables → Actions → **Variables**:

- `GCP_WORKLOAD_IDENTITY_PROVIDER` = `projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github/providers/github`
- `GCP_DEPLOY_SERVICE_ACCOUNT` = `github-deployer@crystaltides-prod.iam.gserviceaccount.com`

Mientras esas variables no existan, el workflow sigue usando `GCP_CREDENTIALS`.

### 5. Primer despliegue

Si `gcloud` se queja de que `VAULT_TOKEN` ya existe con otro tipo (antes era una variable
en claro), quítala y relanza el workflow enseguida:

```bash
gcloud run services update crystaltides-backend --region=us-central1 --remove-env-vars=VAULT_TOKEN
```

Comprueba en los logs `✅ [Vault] Loaded N secrets` y que `/api/system/health` responde 200.

### 6. Limpieza (solo con el despliegue nuevo funcionando)

- Revoca el token anterior: `vault token revoke <token anterior>`. Si era el **root**,
  revócalo igualmente; se puede regenerar con `vault operator generate-root` y las claves
  de unseal.
- Borra los secretos de GitHub `VAULT_TOKEN` y `GCP_CREDENTIALS`.
- Borra en GCP la clave JSON que usaba `GCP_CREDENTIALS`
  (`gcloud iam service-accounts keys list/delete`). Después hay que quitar del workflow
  el paso "Google Auth (legacy JSON key)".
- Claves en disco (`apps/web-server/service-account.json`, `crystaltides-prod-key.json`):
  identifica cada una (`client_email` y `private_key_id` dentro del JSON), desactívala o
  bórrala en GCP y después borra el archivo.

## Rotación

- **Token de Vault:** crea uno nuevo (paso 1) y añádelo como versión nueva:
  `printf '%s' '<token>' | gcloud secrets versions add vault-token --data-file=-`. Despliega
  o reinicia el servicio, comprueba que arranca y revoca el anterior.
- **Secretos de la app:** cámbialos en Vault y reinicia el servicio. Si un secreto falta o
  es débil, el backend no arranca (`config/env.ts`).
