export interface VersionCardData {
  major: string;
  subVersions: string[];
  selectedSub: string;
  name: string;
  loader: 'Fabric' | 'Forge' | 'NeoForge' | 'Vanilla';
  bgGradient: string;
  tag?: string;
  isInstalled?: boolean;
}

export const DEFAULT_VERSIONS: VersionCardData[] = [
  {
    major: '26.1',
    subVersions: ['26.1.1', '26.1.0-snap'],
    selectedSub: '26.1.1',
    name: 'Future Snapshot',
    loader: 'Fabric',
    bgGradient: 'linear-gradient(135deg, rgba(88, 28, 135, 0.4) 0%, rgba(15, 23, 42, 0.9) 100%)',
    tag: 'NUEVO',
    isInstalled: true,
  },
  {
    major: '1.21',
    subVersions: ['1.21.7', '1.21.4', '1.21.3', '1.21.1'],
    selectedSub: '1.21.3',
    name: 'CrystalTides Oficial',
    loader: 'Fabric',
    bgGradient: 'linear-gradient(135deg, rgba(13, 148, 136, 0.4) 0%, rgba(15, 23, 42, 0.9) 100%)',
    tag: 'RECOMENDADO',
    isInstalled: true,
  },
  {
    major: '1.20',
    subVersions: ['1.20.4', '1.20.2', '1.20.1'],
    selectedSub: '1.20.4',
    name: 'Trails & Tales',
    loader: 'Fabric',
    bgGradient: 'linear-gradient(135deg, rgba(180, 83, 9, 0.3) 0%, rgba(15, 23, 42, 0.9) 100%)',
    isInstalled: true,
  },
  {
    major: '1.19',
    subVersions: ['1.19.4', '1.19.2'],
    selectedSub: '1.19.4',
    name: 'The Wild Update',
    loader: 'Fabric',
    bgGradient: 'linear-gradient(135deg, rgba(21, 128, 61, 0.3) 0%, rgba(15, 23, 42, 0.9) 100%)',
    isInstalled: false,
  },
  {
    major: '1.16',
    subVersions: ['1.16.5', '1.16.4'],
    selectedSub: '1.16.5',
    name: 'Nether Update',
    loader: 'Forge',
    bgGradient: 'linear-gradient(135deg, rgba(185, 28, 28, 0.3) 0%, rgba(15, 23, 42, 0.9) 100%)',
    isInstalled: true,
  },
  {
    major: '1.8',
    subVersions: ['1.8.9'],
    selectedSub: '1.8.9',
    name: 'Legacy PvP / Bedwars',
    loader: 'Forge',
    bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(15, 23, 42, 0.9) 100%)',
    isInstalled: true,
  },
];
