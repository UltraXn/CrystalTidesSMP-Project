import type { Meta, StoryObj } from '@storybook/react';
import WikiBoss3DCard from '../../components/Wiki/WikiBoss3DCard';

const meta: Meta<typeof WikiBoss3DCard> = {
  title: 'Wiki/WikiBoss3DCard',
  component: WikiBoss3DCard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WikiBoss3DCard>;

export const AbyssalWitherBoss: Story = {
  args: {
    bossName: 'Toro Wither del Abismo',
    category: 'BOSS MITOLÓGICO',
    subtitle: 'Señor del Vacío y Destrucción de Reinos',
    hp: '1,500 🖤',
    damage: '45 ⚔️',
    armor: '20 🛡️',
    speed: 'Rápido',
    location: 'Dimension del Abismo (x: 0, z: 0)',
    spawnMethod: 'Invocar con 4 Bloques de Calaveras de Cristal y 3 Estrellas del Vacío.',
    description: 'El **Toro Wither del Abismo** lanza proyectiles explosivos que corroen las armaduras de diamantina. Al llegar al 50% de HP entra en Fase 2.',
    cardTheme: 'red',
    kcReward: 500,
    drops: ['1x Corazón del Abismo', '50x Cristales de Experiencia', '1x Llave Legendaria'],
    phase1Attacks: [
      { name: 'Carga Abisal', type: 'Físico', damage: '30 HP', description: 'Se abalanza en línea recta destruyendo bloques.' },
      { name: 'Ráfaga de Calaveras', type: 'Mágico', damage: '45 HP', description: 'Dispara 3 calaveras guiadas que provocan Marchitez V.' },
    ],
  },
};
