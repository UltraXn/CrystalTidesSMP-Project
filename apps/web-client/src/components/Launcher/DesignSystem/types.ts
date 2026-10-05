export interface ColorItem {
  name: string;
  hex: string;
  role: string;
  tag: string;
}

export const COLOR_PALETTE: readonly ColorItem[] = [
  {
    name: 'Beyond Black',
    hex: '#060305',
    role: 'Fondo Principal / Canvas Canvas',
    tag: 'Background',
  },
  {
    name: 'Obsidian Deep',
    hex: '#0D0714',
    role: 'Superficie de Tarjetas & Paneles',
    tag: 'Surface',
  },
  {
    name: 'Electric Teal',
    hex: '#2DD4BF',
    role: 'Acento Primario / Glow de Acción',
    tag: 'Brand Primary',
  },
  {
    name: 'Void Violet',
    hex: '#A051A2',
    role: 'Acento Secundario & Gradientes',
    tag: 'Brand Secondary',
  },
  {
    name: 'Luminescent Sky',
    hex: '#38BDF8',
    role: 'Indicadores de Estado & Rich Presence',
    tag: 'Info',
  },
  {
    name: 'Danger Crimson',
    hex: '#EF4444',
    role: 'Crash Diagnostics & Cierres',
    tag: 'Danger',
  },
];
