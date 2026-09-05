import type { Meta, StoryObj } from '@storybook/react';
import LazyWrapper from '../../components/Utils/LazyWrapper';

const meta: Meta<typeof LazyWrapper> = {
  title: 'Utils/LazyWrapper',
  component: LazyWrapper,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LazyWrapper>;

export const LoadedLazyContent: Story = {
  args: {
    minHeight: '150px',
    children: (
      <div style={{ background: '#1e2235', padding: '2rem', borderRadius: '12px', border: '1px solid #38bdf840' }}>
        <h4 style={{ color: '#38bdf8', margin: '0 0 0.5rem 0' }}>⚡ Contenido Renderizado con Lazy Loading</h4>
        <p style={{ color: '#cbd5e1', margin: 0 }}>Este bloque se carga bajo demanda mediante IntersectionObserver.</p>
      </div>
    )
  }
};

export const CustomSkeletonFallback: Story = {
  args: {
    minHeight: '150px',
    fallback: (
      <div style={{ background: '#12141c', height: '120px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        Cargando componente pesado...
      </div>
    ),
    children: (
      <div style={{ background: '#10b98120', border: '1px solid #10b981', padding: '2rem', borderRadius: '12px', color: '#10b981' }}>
        Contenido cargado con éxito.
      </div>
    )
  }
};
