import type { Meta, StoryObj } from '@storybook/react';
import { useState, useRef } from 'react';
import { GachaHeader } from '../../pages/Gacha/GachaHeader';
import { GachaTier } from '../../pages/Gacha/types';

const mockTiers: GachaTier[] = [
  { id: 'standard', name: 'Cofre Básico', color: '#3b82f6', icon: '📦', cost: 100, rewards: [] },
  { id: 'epic', name: 'Cofre Épico', color: '#8b5cf6', icon: '🔮', cost: 500, rewards: [] },
  { id: 'ultra', name: 'Cofre Calamity', color: '#f59e0b', icon: '👑', cost: 1500, rewards: [] }
];

const meta: Meta<typeof GachaHeader> = {
  title: 'Pages/Gacha/GachaHeader',
  component: GachaHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GachaHeader>;

function GachaHeaderStoryComponent() {
  const [selectedTier, setSelectedTier] = useState<GachaTier>(mockTiers[1]);
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  const [testForceResult, setTestForceResult] = useState<'random' | 'win' | 'loss'>('random');
  const [forceDeduction, setForceDeduction] = useState<boolean>(true);
  const devBarRef = useRef<HTMLDivElement | null>(null);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', background: '#0e1017', padding: '1.5rem', borderRadius: '16px' }}>
      <GachaHeader
        canAccessDev={true}
        isDevMode={isDevMode}
        setIsDevMode={setIsDevMode}
        testForceResult={testForceResult}
        setTestForceResult={setTestForceResult}
        forceDeduction={forceDeduction}
        setForceDeduction={setForceDeduction}
        addFunds={(amount) => console.log('Add funds:', amount)}
        devBarRef={devBarRef}
        GACHA_TIERS={mockTiers}
        selectedTier={selectedTier}
        setSelectedTier={setSelectedTier}
        isOpening={false}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <GachaHeaderStoryComponent />
};
