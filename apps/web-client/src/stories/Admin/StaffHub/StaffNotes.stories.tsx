import type { Meta, StoryObj } from '@storybook/react';
import StaffNotes from '../../../components/Admin/StaffHub/StaffNotes';

const meta: Meta<typeof StaffNotes> = {
  title: 'Admin/StaffHub/StaffNotes',
  component: StaffNotes,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StaffNotes>;

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
