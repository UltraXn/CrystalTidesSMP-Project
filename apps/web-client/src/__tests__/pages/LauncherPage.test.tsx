import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import '@/i18n';
import LauncherPage from '@/pages/LauncherPage';
import { renderWithProviders } from '@/utils/test-utils';
import globalEs from '@/locales/es/global.json';
import globalEn from '@/locales/en/global.json';

const keysOf = (value: unknown, prefix = ''): string[] =>
  value && typeof value === 'object'
    ? Object.entries(value).flatMap(([key, child]) => keysOf(child, `${prefix}${key}.`))
    : [prefix.slice(0, -1)];

describe('LauncherPage', () => {
  it('links the Windows download to the latest Launcher Lite release', () => {
    renderWithProviders(<LauncherPage />);

    // hero, Windows download card and closing CTA
    const links = screen.getAllByRole('link', {
      name: /^Descargar( para Windows)?$/i,
    });
    expect(links).toHaveLength(3);
    for (const link of links) {
      expect(link).toHaveAttribute(
        'href',
        expect.stringContaining(
          'crystaltides-launcher-lite/releases/latest/download/CrystalTides-Setup.exe',
        ),
      );
    }
  });

  it('keeps macOS and Linux downloads disabled until they are built', () => {
    renderWithProviders(<LauncherPage />);

    const soon = screen.getAllByRole('button', { name: /Disponible pronto/i });
    expect(soon).toHaveLength(2);
    for (const button of soon) expect(button).toBeDisabled();
  });

  it('opens the first FAQ by default and toggles the others', () => {
    renderWithProviders(<LauncherPage />);

    const first = screen.getByRole('button', {
      name: /¿Es seguro\? ¿Me pide mi contraseña de Microsoft\?/i,
    });
    expect(first).toHaveAttribute('aria-expanded', 'true');

    const java = screen.getByRole('button', {
      name: /¿Necesito tener Java instalado\?/i,
    });
    fireEvent.click(java);
    expect(java).toHaveAttribute('aria-expanded', 'true');
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText(/Java 21/)).toBeInTheDocument();
  });

  it('has the same launcher_page keys in Spanish and English', () => {
    expect(keysOf(globalEn.launcher_page).sort()).toEqual(keysOf(globalEs.launcher_page).sort());
  });
});
