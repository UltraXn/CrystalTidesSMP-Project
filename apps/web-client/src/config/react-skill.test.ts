import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_PATH = resolve(__dirname, '../../../../.agent/skills/react/SKILL.md');

let skillContent: string;

beforeAll(() => {
  skillContent = readFileSync(SKILL_PATH, 'utf-8');
});

describe('react SKILL.md - frontmatter metadata (PR change: react-doctor → react-vercel)', () => {
  it('should have the skill name set to react-vercel', () => {
    expect(skillContent).toContain('name: react-vercel');
  });

  it('should NOT retain the old react-doctor skill name', () => {
    expect(skillContent).not.toContain('name: react-doctor');
  });

  it('should have a description referencing Vercel', () => {
    expect(skillContent).toContain('description:');
    expect(skillContent.toLowerCase()).toContain('vercel');
  });

  it('should NOT contain a version field (removed in this PR)', () => {
    // The react-doctor skill had version: 1.0.0; the new react-vercel skill omits it
    expect(skillContent).not.toContain('version: 1.0.0');
  });
});

describe('react SKILL.md - content (PR change: dropped react-doctor, added react-vercel)', () => {
  it('should NOT contain react-doctor CLI command', () => {
    expect(skillContent).not.toContain('npx -y react-doctor');
    expect(skillContent).not.toContain('react-doctor@latest');
  });

  it('should NOT contain the diagnostic scoring system', () => {
    // react-doctor had a 0-100 score with thresholds
    expect(skillContent).not.toContain('75+');
    expect(skillContent).not.toContain('50-74');
    expect(skillContent).not.toContain('0-49');
  });

  it('should NOT reference the "47+ rules" diagnostic list', () => {
    expect(skillContent).not.toContain('Rules (47+)');
  });

  it('should contain the Next.js 15+ App Router principle', () => {
    expect(skillContent).toContain('Next.js 15+');
    expect(skillContent).toContain('App Router');
  });

  it('should contain the Modular Behaviors section', () => {
    expect(skillContent).toContain('## Modular Behaviors');
  });

  it('should contain the Core Principles section', () => {
    expect(skillContent).toContain('## Core Principles');
  });

  it('should reference Edge Runtime for Vercel deployment', () => {
    expect(skillContent).toContain('Edge Runtime');
  });

  it('should recommend async components over useEffect for data fetching', () => {
    expect(skillContent).toContain('useEffect');
    expect(skillContent.toLowerCase()).toContain('never');
  });

  it('should reference NextAuth.js for auth', () => {
    expect(skillContent).toContain('NextAuth.js');
  });

  it('should recommend Vercel Speed Insights for performance monitoring', () => {
    expect(skillContent).toContain('Speed Insights');
  });

  it('should reference Next.js Image component for image handling', () => {
    expect(skillContent).toContain('<Image>');
  });

  it('should recommend Vercel Blob for user uploads', () => {
    expect(skillContent).toContain('Vercel Blob');
  });
});

describe('react SKILL.md - valid YAML frontmatter structure', () => {
  it('should open with YAML front matter delimiter', () => {
    expect(skillContent.trimStart()).toMatch(/^---\n/);
  });

  it('should close the frontmatter block before the markdown body', () => {
    const lines = skillContent.split('\n');
    const firstDelimiter = lines.indexOf('---');
    // There must be a closing --- after the opening one
    const secondDelimiter = lines.indexOf('---', firstDelimiter + 1);
    expect(secondDelimiter).toBeGreaterThan(firstDelimiter);
  });

  it('should NOT contain git merge conflict markers', () => {
    expect(skillContent).not.toContain('<<<<<<<');
    expect(skillContent).not.toContain('=======');
    expect(skillContent).not.toContain('>>>>>>>');
  });
});