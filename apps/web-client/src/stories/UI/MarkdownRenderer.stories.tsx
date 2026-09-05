import type { Meta, StoryObj } from '@storybook/react';
import MarkdownRenderer from '../../components/UI/MarkdownRenderer';

const meta: Meta<typeof MarkdownRenderer> = {
  title: 'UI/MarkdownRenderer',
  component: MarkdownRenderer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MarkdownRenderer>;

export const ServerAnnouncementPost: Story = {
  args: {
    content: `**¡Gran Actualización de la Dimensión Abisal!**

Hemos añadido **3 nuevos bosses mitológicos** y recompensas exclusivas.
Revisa las reglas en el [Foro Oficial](/forum) o consulta la guía con la imagen a continuación:

![CrystalTides Banner](/images/ui/logo.webp)

*Recuerda unirte a nuestro Discord para participar en los sorteos diarios.*`,
  },
};
