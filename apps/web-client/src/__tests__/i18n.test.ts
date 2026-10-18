import { describe, it, expect } from 'vitest';
import i18n from '../i18n';

describe('i18n dynamic loading', () => {
  it('loads Spanish synchronously as default language', () => {
    expect(i18n.language).toBe('es');
    expect(i18n.t('about.roles.radar.builder')).toBe('Constructor');
  });

  it('loads English on-demand via backend module when language changes', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.language).toBe('en');
    expect(i18n.t('about.roles.radar.builder')).toBe('Builder');

    // Switch back to Spanish for other test suites
    await i18n.changeLanguage('es');
    expect(i18n.language).toBe('es');
    expect(i18n.t('about.roles.radar.builder')).toBe('Constructor');
  });
});
