import React from 'react';
import { ButtonsSection } from './ButtonsSection';
import { TogglesSection } from './TogglesSection';
import { RamAllocationSection } from './RamAllocationSection';

export const ComponentsShowcaseSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-6 duration-300 animate-in fade-in md:grid-cols-2">
      <ButtonsSection />
      <TogglesSection />
      <RamAllocationSection />
    </div>
  );
};
