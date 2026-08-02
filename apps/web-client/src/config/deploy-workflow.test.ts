import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKFLOW_PATH = resolve(__dirname, '../../../../.github/workflows/deploy.yml');

let workflowContent: string;

beforeAll(() => {
  workflowContent = readFileSync(WORKFLOW_PATH, 'utf-8');
});

describe('deploy.yml - workflow structure', () => {
  it('should define the three deployment jobs', () => {
    expect(workflowContent).toContain('deploy-backend:');
    expect(workflowContent).toContain('deploy-frontend:');
    expect(workflowContent).toContain('deploy-bot:');
  });

  it('should trigger on push to main branch', () => {
    expect(workflowContent).toContain('branches:');
    expect(workflowContent).toContain('- main');
    expect(workflowContent).toContain('workflow_dispatch:');
  });

  it('should define the expected global env vars', () => {
    expect(workflowContent).toContain('PROJECT_ID: crystaltides-prod');
    expect(workflowContent).toContain('REGION: us-central1');
    expect(workflowContent).toContain('ARTIFACT_REPO: crystaltides-repo');
  });
});

describe('deploy.yml - deploy-backend job (PR changes)', () => {
  it('should NOT use an intermediate IMAGE_NAME shell variable in the build step', () => {
    // PR removed the IMAGE_NAME variable assignment to simplify the script
    expect(workflowContent).not.toContain('IMAGE_NAME=');
  });

  it('should NOT include the untagged image cleanup command', () => {
    // PR removed the gcloud cleanup step to keep the workflow simpler
    expect(workflowContent).not.toContain('gcloud artifacts docker images delete');
    expect(workflowContent).not.toContain('NOT tags:*');
  });

  it('should NOT include BOT_API_URL in backend env_vars', () => {
    // PR removed BOT_API_URL from the backend deployment
    expect(workflowContent).not.toContain('BOT_API_URL');
  });

  it('should NOT include BOT_API_KEY in backend env_vars', () => {
    // PR removed BOT_API_KEY from the backend deployment
    expect(workflowContent).not.toContain('BOT_API_KEY');
  });

  it('should NOT include resource constraint flags on the backend Cloud Run service', () => {
    // PR removed --memory=256Mi --cpu=0.5 --max-instances=5 --concurrency=1 --port=3001
    expect(workflowContent).not.toContain('--memory=256Mi');
    expect(workflowContent).not.toContain('--max-instances=5');
    expect(workflowContent).not.toContain('--concurrency=1');
    expect(workflowContent).not.toContain('--cpu=0.5');
  });

  it('should inline the backend image URI directly in the docker build and push commands', () => {
    // PR simplified to inline image tag instead of using IMAGE_NAME variable
    expect(workflowContent).toContain(
      'docker build -t ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.ARTIFACT_REPO }}/backend:latest'
    );
    expect(workflowContent).toContain(
      'docker push ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.ARTIFACT_REPO }}/backend:latest'
    );
  });

  it('should deploy the backend service to crystaltides-backend', () => {
    expect(workflowContent).toContain('service: crystaltides-backend');
  });

  it('should include required backend env vars', () => {
    expect(workflowContent).toContain('NODE_ENV=production');
    expect(workflowContent).toContain('KOFI_VERIFICATION_TOKEN');
    expect(workflowContent).toContain('SUPABASE_URL');
  });
});

describe('deploy.yml - deploy-frontend job', () => {
  it('should deploy the frontend service to crystaltides-web', () => {
    expect(workflowContent).toContain('service: crystaltides-web');
  });

  it('should pass Supabase build args to the frontend docker build', () => {
    expect(workflowContent).toContain('--build-arg VITE_SUPABASE_URL=');
    expect(workflowContent).toContain('--build-arg VITE_SUPABASE_ANON_KEY=');
    expect(workflowContent).toContain('--build-arg VITE_API_URL=');
  });

  it('should use the frontend Dockerfile', () => {
    expect(workflowContent).toContain('-f apps/web-client/Dockerfile');
  });
});

describe('deploy.yml - deploy-bot job', () => {
  it('should deploy the bot to the OCI VM IP address', () => {
    expect(workflowContent).toContain('150.136.151.234');
  });

  it('should package and copy bot source and compose configuration to OCI VM', () => {
    expect(workflowContent).toContain('bot-src.tar.gz');
    expect(workflowContent).toContain('compose.yml');
    expect(workflowContent).toContain('frps.toml');
    expect(workflowContent).toContain('Caddyfile');
    expect(workflowContent).toContain('scp-action');
  });

  it('should build the discord-bot Dockerfile on the OCI VM', () => {
    expect(workflowContent).toContain('-f crystaltides/apps/discord-bot/Dockerfile');
  });
});

describe('deploy.yml - security and auth', () => {
  it('should authenticate with GCP using credentials_json in Cloud Run jobs', () => {
    const credentialMatches = (workflowContent.match(/credentials_json/g) || []).length;
    // Backend and frontend jobs should use GCP credentials (2 jobs)
    expect(credentialMatches).toBeGreaterThanOrEqual(2);
  });

  it('should checkout with submodules in every job', () => {
    const submoduleMatches = (workflowContent.match(/submodules: recursive/g) || []).length;
    expect(submoduleMatches).toBeGreaterThanOrEqual(3);
  });

  it('should NOT contain git merge conflict markers', () => {
    expect(workflowContent).not.toContain('<<<<<<<');
    expect(workflowContent).not.toContain('=======');
    expect(workflowContent).not.toContain('>>>>>>>');
  });
});