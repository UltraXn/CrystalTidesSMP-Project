import type { Meta, StoryObj } from '@storybook/react';
import WikiArticleList from '../../../components/Admin/Wiki/WikiArticleList';

const meta: Meta<typeof WikiArticleList> = {
  title: 'Admin/Wiki/WikiArticleList',
  component: WikiArticleList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WikiArticleList>;

export const PopulatedData: Story = {
  args: {
    articles: [],
    loading: false,
    onEdit: () => console.log('onEdit clicked'),
    onDelete: () => console.log('onDelete clicked'),
  },
};

export const LoadingTable: Story = {
  args: {
    
    
},
};
