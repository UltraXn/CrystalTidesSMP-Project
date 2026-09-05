import type { Meta, StoryObj } from '@storybook/react';
import ImageUploader from '../../components/UI/ImageUploader';

const meta: Meta<typeof ImageUploader> = {
  title: 'UI/ImageUploader',
  component: ImageUploader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ImageUploader>;

export const DefaultEmptyUploader: Story = {
  args: {
    onImageUploaded: (url) => console.log('Uploaded image URL:', url),
  },
};

export const WithExistingAvatarPreview: Story = {
  args: {
    currentImage: '/images/ui/logo.webp',
    onImageUploaded: (url) => console.log('Uploaded image URL:', url),
  },
};
