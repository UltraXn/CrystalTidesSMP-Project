import type { Meta, StoryObj } from '@storybook/react';
import DashboardOverview from '../../components/Admin/DashboardOverview';

const meta: Meta<any> = {
  title: 'Admin/DashboardOverview',
  component: DashboardOverview,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<any>;

export const ActiveTasksBoard: Story = {
  args: {
    
    "tasks": [
        {
            "id": 1,
            
            "priority": "High"
        }
    ]
},
};

export const CompletedTasksBoard: Story = {
  args: {
    
    "tasks": [
        {
            "id": 2,
            
            "priority": "Medium"
        }
    ]
},
};
