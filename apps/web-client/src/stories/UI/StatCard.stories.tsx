// eslint-disable-next-line
import type { Meta, StoryObj } from '@storybook/react'
import StatCard from '../../components/UI/StatCard'
import { Server, User, Ticket, Banknote } from 'lucide-react'

const meta: Meta<typeof StatCard> = {
  title: 'UI/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
    backgrounds: {
        default: 'dark',
    }
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
        control: false
    }
  }
}

export default meta
type Story = StoryObj<typeof StatCard>

export const ServerStatus: Story = {
  args: {
    title: 'Server Status',
    value: 'ONLINE',
    percent: 'Running Smoothly',
    color: '#4ade80',
    icon: <Server />
  }
}

export const Players: Story = {
  args: {
    title: 'Players Online',
    value: '1,234',
    percent: 'Capacity: 2000',
    color: '#3b82f6',
    icon: <User />
  }
}

export const Tickets: Story = {
  args: {
    title: 'Pending Tickets',
    value: '5',
    percent: '2 High Priority',
    color: '#facc15',
    icon: <Ticket />
  }
}

export const Revenue: Story = {
  args: {
    title: 'Monthly Revenue',
    value: '$4,320.50',
    percent: '+12% vs Prev Month',
    color: '#c084fc',
    icon: <Banknote />
  }
}
