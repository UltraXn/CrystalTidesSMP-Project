import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKFLOW_PATH = resolve(__dirname, '../../../../../.github/workflows/deploy.yml');

let workflowContent: string;

beforeAll(() => {
  workflowContent = readFileSync(WORKFLOW_PATH, 'utf-8');
});

describe('deploy.yml - workflow structure', () => {
  it('should define the deployment jobs', () => {
    expect(workflowContent).toContain('deploy-backend:');
    expect(workflowContent).toContain('deploy-frontend:');
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

describe('deploy.yml - deploy-backend job', () => {
  it('should NOT use an intermediate IMAGE_NAME shell variable in the build step', () => {
    expect(workflowContent).not.toContain('IMAGE_NAME=');
  });

  it('should NOT include the untagged image cleanup command', () => {
    expect(workflowContent).not.toContain('gcloud artifacts docker images delete');
    expect(workflowContent).not.toContain('NOT tags:*');
  });

  it('should NOT include BOT_API_URL in backend env_vars', () => {
    expect(workflowContent).not.toContain('BOT_API_URL');
  });

  it('should NOT include BOT_API_KEY in backend env_vars', () => {
    expect(workflowContent).not.toContain('BOT_API_KEY');
  });

  it('should NOT include resource constraint flags on the backend Cloud Run service', () => {
    expect(workflowContent).not.toContain('--memory=256Mi');
    expect(workflowContent).not.toContain('--max-instances=5');
    expect(workflowContent).not.toContain('--concurrency=1');
    expect(workflowContent).not.toContain('--cpu=0.5');
  });

  it('should configure backend build and push tags', () => {
    expect(workflowContent).toContain(
      '${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.ARTIFACT_REPO }}/backend:latest'
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
    expect(workflowContent).toContain('VITE_SUPABASE_URL=${{ secrets.VITE_SUPABASE_URL }}');
    expect(workflowContent).toContain('VITE_SUPABASE_ANON_KEY=${{ secrets.VITE_SUPABASE_ANON_KEY }}');
    expect(workflowContent).toContain('VITE_API_URL=https://api.crystaltidessmp.net/api');
  });

  it('should use the frontend Dockerfile', () => {
    expect(workflowContent).toContain('file: apps/web-client/Dockerfile');
  });
});

describe('deploy.yml - security and auth', () => {
  it('should authenticate with GCP using credentials_json in Cloud Run jobs', () => {
    const credentialMatches = (workflowContent.match(/credentials_json/g) || []).length;
    expect(credentialMatches).toBeGreaterThanOrEqual(2);
  });

  it('should checkout with submodules in deployment jobs', () => {
    const submoduleMatches = (workflowContent.match(/submodules: recursive/g) || []).length;
    expect(submoduleMatches).toBeGreaterThanOrEqual(2);
  });

  it('should NOT contain git merge conflict markers', () => {
    expect(workflowContent).not.toContain('<'.repeat(7));
    expect(workflowContent).not.toContain('='.repeat(7));
    expect(workflowContent).not.toContain('>'.repeat(7));
  });
});
