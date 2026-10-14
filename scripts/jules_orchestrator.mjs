#!/usr/bin/env node
/**
 * Jules Orchestrator — CrystalTides SMP Multi-Agent Deployment
 * 
 * Despliega y coordina 10 agentes especializados de Google Jules por repositorio
 * para auditoría continua de Bugs, Código Muerto y Fallos de Seguridad.
 */

import fs from 'node:fs';

const API_BASE = 'https://jules.googleapis.com/v1alpha';

// Recuperar API Key desde entorno o fallback a mcp_config.json
function resolveApiKey() {
  if (process.env.JULES_API_KEY) {
    return process.env.JULES_API_KEY;
  }
  try {
    const configPath = 'C:\\Users\\nacho\\.gemini\\config\\mcp_config.json';
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const key = config?.mcpServers?.['google-jules']?.env?.JULES_API_KEY;
      if (key) return key;
    }
  } catch {
    // Silently continue
  }
  return null;
}

const API_KEY = resolveApiKey();

if (!API_KEY) {
  console.error('\x1b[31m[ERROR] No se encontró JULES_API_KEY en variables de entorno ni en mcp_config.json.\x1b[0m');
  process.exit(1);
}

// Las 10 Directivas Quirúrgicas de Auditoría
export const JULES_10_AGENT_SPECS = [
  {
    id: 'SEC-01',
    category: 'Robustez & Acceso',
    title: 'Hardening de Autenticación, JWT y Control de Sesión',
    prompt: `Actúa como un Ingeniero de Confiabilidad de Software y Arquitectura Defensiva.
Tu objetivo es fortalecer el flujo de autenticación y control de acceso del proyecto:
1. Inspecciona la validación de tokens JWT: asegura que se declaren algoritmos de verificación explícitos (como HS256 o RS256) siguiendo las especificaciones RFC.
2. Verifica el control de acceso en las consultas: asegura que ninguna consulta de datos de usuario se realice sin verificar que pertenezca al usuario de la sesión activa (principio de menor privilegio).
3. Revisa la integridad de las sesiones en middlewares y handlers de autenticación.
Proporciona mejoras limpias y aplica los parches de código necesarios para reforzar la arquitectura defensiva.`
  },
  {
    id: 'SEC-02',
    category: 'Validación de Entradas',
    title: 'Robustez de Consultas, Parámetros y Sanitización de Datos',
    prompt: `Actúa como un Especialista en Calidad de Código y Validación de Entradas.
Tu objetivo es asegurar la robustez y tratamiento seguro de los datos de entrada y salida:
1. Consultas de base de datos: verifica que todas las consultas a SQLite/Postgres utilicen consultas parametrizadas (?) o query builders tipados en lugar de concatenación directa de strings.
2. Renderizado de texto y vistas: verifica que la inserción de contenido dinámico use sanitización estricta (DOMPurify) o los enlaces seguros nativos del framework.
3. Validación de URLs externas: asegura que cualquier petición HTTP saliente hacia URLs provistas por el usuario valide el dominio y protocolo permitido.
4. Manejo de rutas y archivos: asegura que las operaciones de sistema de archivos normalicen las rutas de entrada.
Genera el parche de código con las mejoras de robustez.`
  },
  {
    id: 'SEC-03',
    category: 'Configuración & Entorno',
    title: 'Higiene de Variables de Entorno y Separación de Configuración',
    prompt: `Actúa como un Ingeniero de Configuración y Gestión de Entornos.
Tu objetivo es auditar la separación entre código y variables de entorno:
1. Verifica que claves privadas, tokens y credenciales de servicios externos se obtengan exclusivamente de variables de entorno seguras (process.env) o bóvedas locales (Secure Vault).
2. Asegura que los bundles públicos de frontend (Vite/Tauri) no incluyan variables de configuración privadas ni valores confidenciales en código fuente.
3. Revisa que los archivos de configuración local (.env, certificados) estén debidamente protegidos y no commiteados.
Aplica los cambios necesarios para modularizar la configuración.`
  },
  {
    id: 'DEAD-01',
    category: 'Código Muerto',
    title: 'Higiene de Dependencias y Poda de Exports Huérfanos (Knip)',
    prompt: `Actúa como un Especialista en Arquitectura y Optimización de Código Muerto (Knip Standard).
Tu objetivo exclusivo es eliminar código no utilizado y dependencias huérfanas:
1. Identifica exports en funciones, tipos, interfaces y componentes que no tengan ninguna referencia o importación en el proyecto.
2. Identifica dependencias en package.json (o Cargo.toml) que no sean importadas en ninguna parte del código base.
3. Identifica dependencias no declaradas que se estén importando de forma fantasma.
Poda limpiamente los exports muertos y dependencias sin uso preservando intacta la funcionalidad activa.`
  },
  {
    id: 'DEAD-02',
    category: 'Código Muerto',
    title: 'Eliminación de Funciones Zombie, Archivos Obsoletos y Ramas Muertas',
    prompt: `Actúa como un Ingeniero de Refactorización y Limpieza de Deuda Técnica.
Tu objetivo exclusivo es erradicar código zombie:
1. Archivos .ts, .tsx, .rs o .java que estén completamente desconectados del árbol de imports o del bundle de compilación.
2. Ramas de ejecución inalcanzables (unreachable code en condicionales 'if (false)', switches con casos muertos o early returns que bloquean código posterior).
3. Variables y parámetros declarados pero nunca leídos.
4. Helpers y utilidades duplicadas que puedan consolidarse en una única función pura.
Elimina los archivos y bloques muertos garantizando que los tests y compilación pasen sin errores.`
  },
  {
    id: 'BUG-01',
    category: 'Bugs & Concurrencia',
    title: 'Auditoría de Concurrencia, Race Conditions y Bloqueos de Base de Datos',
    prompt: `Actúa como un Especialista en Sistemas Concurrentes y Bases de Datos de Alto Rendimiento.
Tu objetivo exclusivo es encontrar y corregir condiciones de carrera (race conditions):
1. SQLite Concurrency: asegurar que conexiones SQLite concurrentes tengan 'timeout >= 30.0s' y modo WAL habilitado con checkpoints adecuados para prevenir 'database is locked'.
2. Locks en Rust/C++: auditar Mutex y RwLock para prevenir deadlocks o liberación prematura de guardias (MutexGuard) mientras hilos en segundo plano observan el estado de procesos.
3. Mutaciones asíncronas en frontend: auditar hooks de React y Zustand donde múltiples llamadas concurrentes o clics rápidos puedan desincronizar el estado del cliente.
Implementa mecanismos de bloqueo atómico, transacciones protegidas o mutex adecuados.`
  },
  {
    id: 'BUG-02',
    category: 'Bugs & Concurrencia',
    title: 'Detección de Fugas de Memoria, Sockets Huérfanos y Ciclo de Vida de Recursos',
    prompt: `Actúa como un Diagnosticador de Fugas de Memoria (Memory Leak Specialist).
Tu objetivo exclusivo es auditar la retención indebida de recursos:
1. Event listeners agregados al DOM o proceso que carezcan de su correspondiente 'removeEventListener' en funciones de cleanup de useEffect.
2. Timers e intervalos ('setInterval', 'setTimeout') que no se cancelen al desmontar componentes o detener procesos.
3. Conexiones WebSocket, sockets TCP o handles de archivos que permanezcan abiertos tras errores o cierres inesperados.
4. Descriptores de procesos hijos huérfanos sin llamada a .wait() / .try_wait().
Aplica los parches de cleanup correspondientes en cada ciclo de vida.`
  },
  {
    id: 'BUG-03',
    category: 'Bugs & Concurrencia',
    title: 'Tratamiento de Excepciones Silenciadas, Unwraps Inseguros y Resiliencia UI',
    prompt: `Actúa como un Ingeniero de Resiliencia de Software y Manejo de Errores.
Tu objetivo exclusivo es erradicar fallos no controlados:
1. Rust: busca .unwrap() o .expect() en caminos de ejecución normales donde una entrada inválida pueda provocar un 'panic!'. Reemplázalos con manejo idiomático '?' o 'match' devolviendo errores estructurados.
2. TypeScript: busca bloques 'catch (e) {}' vacíos que silencien fallos críticos sin logging ni recuperación.
3. UI: asegura que componentes propensos a fallos o renderizado dinámico estén envueltos en ErrorBoundaries funcionales para prevenir pantallas blancas de la muerte.
4. Promise Rejections: detecta promesas asíncronas sin '.catch()' o bloque try/catch en funciones 'async'.
Implementa logging contextual y recuperación elegante en cada caso.`
  },
  {
    id: 'BUG-04',
    category: 'Bugs & Concurrencia',
    title: 'Robustez de Tipado, Esquemas Zod y Deserialización Insegura',
    prompt: `Actúa como un Arquitecto de Tipado Estricto y Validación de Datos.
Tu objetivo exclusivo es auditar las fronteras de deserialización:
1. Detección y eliminación de tipos 'any' o conversiones forzadas 'as unknown as T' que oculten incompatibilidades de tipos.
2. Validación de esquemas en endpoints API: todo payload recibido debe validarse estrictamente con Zod schemas (safeParse) antes de ser consumido por la lógica de negocio.
3. Deserialización JSON / NBT: en el backend Rust o TypeScript, asegurar que deserializaciones no fallen con panic si faltan campos opcionales o vienen con tipos inesperados.
Añade esquemas robustos y tipado exhaustivo.`
  },
  {
    id: 'QUAL-01',
    category: 'Calidad & Smells',
    title: 'Refactorización de Complejidad Cognitiva (>15) y Reglas SonarQube',
    prompt: `Actúa como un Arquitecto de Calidad de Código y Estándares SonarQube / Oxlint.
Tu objetivo exclusivo es desmantelar monolitos y deuda técnica:
1. Complejidad Cognitiva > 15 (Regla SonarQube S3776): detecta funciones monolíticas y extráelas en funciones puras, Feature Hooks o lookup tables desacopladas con early returns.
2. Cero Strings Duplicados (Regla S1192): extrae cadenas repetidas >= 3 veces a constantes o enums semánticos.
3. Keys estables en listas (React S6479): elimina 'key={index}' en listas mutables y asigna identificadores únicos estables.
4. Pureza de Hooks: verificar que funciones sin estado o ciclo de vida no sean emuladas como hooks falsos y vivan como utilidades puras.
Refactoriza el código reduciendo la complejidad a <= 15 manteniendo el comportamiento 100% idéntico.`
  }
];

// Helper para llamadas a la API de Jules
async function julesFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'x-goog-api-key': API_KEY,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Jules API Error (${res.status} ${res.statusText}): ${errorText}`);
  }

  return res.json();
}

// Obtener las fuentes de repositorios de CrystalTides
async function getCrystalTidesSources() {
  const data = await julesFetch('/sources');
  const sources = data.sources || [];
  return sources.filter(s => {
    const name = s.id || s.name || '';
    return (
      name.toLowerCase().includes('crystaltides') ||
      name.toLowerCase().includes('crystal')
    );
  });
}

// Listar sesiones activas
async function listSessions() {
  const data = await julesFetch('/sessions');
  return data.sessions || [];
}

// Despachar un agente de Jules
async function dispatchAgent(source, branch, spec, requirePlanApproval = true) {
  const payload = {
    title: `[${spec.id}] ${spec.title}`,
    prompt: spec.prompt,
    sourceContext: {
      source: source.name,
      githubRepoContext: {
        startingBranch: branch
      }
    },
    requirePlanApproval: requirePlanApproval
  };

  return await julesFetch('/sessions', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// Función principal de la CLI
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isStatus = args.includes('--status');
  const isDispatch = args.includes('--dispatch');
  const noApproval = args.includes('--no-approval');
  
  const repoFilterIdx = args.indexOf('--repo');
  const repoFilter = repoFilterIdx !== -1 ? args[repoFilterIdx + 1]?.toLowerCase() : null;

  const agentFilterIdx = args.indexOf('--agent');
  const agentFilter = agentFilterIdx !== -1 ? args[agentFilterIdx + 1]?.toUpperCase() : null;

  const limitIdx = args.indexOf('--limit');
  const limitCount = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : null;

  console.log('\x1b[36m============================================================\x1b[0m');
  console.log('\x1b[1m\x1b[34m🌊 JULES ORCHESTRATOR — CRYSTALTIDES SMP MULTI-AGENT SWARM\x1b[0m');
  console.log('\x1b[36m============================================================\x1b[0m\n');

  if (isStatus) {
    console.log('Consultando estado de sesiones en Google Jules...\n');
    try {
      const sessions = await listSessions();
      if (sessions.length === 0) {
        console.log('No hay sesiones activas en este momento.');
        return;
      }
      console.log(`Encontradas ${sessions.length} sesiones:\n`);
      for (const s of sessions) {
        const stateColor = s.state === 'COMPLETED' ? '\x1b[32m' : s.state === 'FAILED' ? '\x1b[31m' : '\x1b[33m';
        console.log(`• [${stateColor}${s.state || 'UNKNOWN'}\x1b[0m] ${s.title || s.name}`);
        console.log(`  ID: ${s.id || s.name} | Creado: ${s.createTime || 'N/A'}`);
        if (s.url) console.log(`  Link: ${s.url}`);
        console.log('');
      }
    } catch (err) {
      console.error('\x1b[31mError al consultar sesiones:\x1b[0m', err.message);
    }
    return;
  }

  const allSources = await getCrystalTidesSources();
  let targetSources = allSources;

  if (repoFilter) {
    targetSources = allSources.filter(s => (s.id || s.name).toLowerCase().includes(repoFilter));
  }

  if (targetSources.length === 0) {
    console.log('\x1b[33mNo se encontraron repositorios que coincidan con el filtro.\x1b[0m');
    console.log('Repositorios disponibles:');
    allSources.forEach(s => console.log(`  - ${s.id || s.name}`));
    return;
  }

  console.log(`Repositorios objetivo identificados (${targetSources.length}):`);
  targetSources.forEach(s => {
    const branch = s.githubRepo?.defaultBranch?.displayName || 'main';
    console.log(`  📁 \x1b[1m${s.id || s.name}\x1b[0m (branch: ${branch})`);
  });
  console.log('');

  let specsToRun = JULES_10_AGENT_SPECS;
  if (agentFilter) {
    specsToRun = specsToRun.filter(s => s.id === agentFilter || s.id.includes(agentFilter));
  }
  if (limitCount && !isNaN(limitCount)) {
    specsToRun = specsToRun.slice(0, limitCount);
  }

  console.log(`Matriz de agentes: \x1b[1m${specsToRun.length} Agente(s) por repositorio\x1b[0m`);
  console.log(`Total de tareas a coordinar: \x1b[1m${targetSources.length * specsToRun.length} sesiones de análisis\x1b[0m\n`);

  if (!isDispatch && !isDryRun) {
    console.log('\x1b[33m[MODO SEGURO / INFORMACIÓN]\x1b[0m');
    console.log('Para ver los prompts y la matriz sin lanzar llamadas API ejecuta:');
    console.log('  \x1b[36mpnpm jules:dry-run\x1b[0m o \x1b[36mnode scripts/jules_orchestrator.mjs --dry-run\x1b[0m\n');
    console.log('Para DESPACHAR los agentes a Google Jules ejecuta:');
    console.log('  \x1b[32mnode scripts/jules_orchestrator.mjs --dispatch\x1b[0m');
    console.log('  (Opcional: \x1b[36m--repo <nombre>\x1b[0m, \x1b[36m--agent <id>\x1b[0m, \x1b[36m--limit 1\x1b[0m)\n');
    return;
  }

  if (isDryRun) {
    console.log('\x1b[33m--- SIMULACIÓN DE DESPACHO (--dry-run) ---\x1b[0m\n');
    for (const source of targetSources) {
      const repoName = source.id || source.name;
      const branch = source.githubRepo?.defaultBranch?.displayName || 'main';
      console.log(`\x1b[1m\x1b[35m=== Repositorio: ${repoName} (Branch: ${branch}) ===\x1b[0m`);
      for (const spec of specsToRun) {
        console.log(`  🤖 [${spec.id}] [${spec.category}] ${spec.title}`);
      }
      console.log('');
    }
    console.log('\x1b[32mSimulación completada. Los agentes están listos para ser despachados.\x1b[0m');
    return;
  }

  if (isDispatch) {
    console.log('\x1b[32mIniciando despacho de sesiones en Google Jules...\x1b[0m');
    console.log(`Aprobación de plan requerida: \x1b[1m${!noApproval}\x1b[0m\n`);

    for (const source of targetSources) {
      const repoName = source.id || source.name;
      const branch = source.githubRepo?.defaultBranch?.displayName || 'main';
      console.log(`\x1b[1m\x1b[34m>> Despachando ${specsToRun.length} agente(s) hacia ${repoName}...\x1b[0m`);

      for (const spec of specsToRun) {
        process.stdout.write(`   → Despachando [${spec.id}] ${spec.title.slice(0, 45)}... `);
        try {
          const session = await dispatchAgent(source, branch, spec, !noApproval);
          console.log(`\x1b[32mOK\x1b[0m (Session: ${session.id || session.name})`);
          if (session.url) console.log(`     Link: ${session.url}`);
        } catch (err) {
          console.log(`\x1b[31mFALLÓ\x1b[0m (${err.message})`);
        }
        // Pacing de 1.5s entre despachos para respetar rate limits de Google API
        await new Promise(r => setTimeout(r, 1500));
      }
      console.log('');
    }

    console.log('\x1b[32m✔ Despacho finalizado. Puedes monitorear el progreso con: node scripts/jules_orchestrator.mjs --status\x1b[0m');
  }
}

main().catch(err => {
  console.error('\x1b[31m[ERROR FATAL]:\x1b[0m', err);
  process.exit(1);
});
