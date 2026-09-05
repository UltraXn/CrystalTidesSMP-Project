import type { Meta, StoryObj } from '@storybook/react';
import StaffWorkspace from '../../../components/Admin/StaffHub/StaffWorkspace';

const meta: Meta<typeof StaffWorkspace> = {
  title: 'Admin/StaffHub/StaffWorkspace',
  component: StaffWorkspace,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StaffWorkspace>;

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
