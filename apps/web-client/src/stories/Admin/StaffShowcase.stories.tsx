import type { Meta, StoryObj } from '@storybook/react-vite';
import StaffShowcase from '../../components/Home/StaffShowcase';
import React, { useEffect } from 'react';

// Mock Data
const mockStaffData = [
    {
        id: 1,
        name: 'Neroferno',
        mc_nickname: 'Neroferno',
        role: 'Neroferno',
        description: 'Creador y Owner de CrystalTides.',
        image: '',
        color: '#8b5cf6',
        socials: { twitter: 'neroferno', discord: 'neroferno', youtube: '', twitch: 'neroferno' }
    },
    {
        id: 2,
        name: 'Killuwu',
        mc_nickname: 'Killuwu',
        role: 'Killuwu',
        description: 'Administradora y Co-Owner.',
        image: '',
        color: '#0ea5e9',
        socials: { twitter: '', discord: 'killuwu', youtube: '', twitch: '' }
    },
    {
        id: 3,
        name: 'Steve',
        mc_nickname: 'Steve',
        role: 'Usuario',
        description: 'Un usuario normal del servidor.',
        image: '',
        color: '#db7700',
        socials: { twitter: '', discord: '', youtube: '', twitch: '' }
    }
];

const mockOnlineStatus = [
    { username: 'Neroferno', mc_status: 'online', discord_status: 'online' },
    { username: 'Killuwu', mc_status: 'offline', discord_status: 'dnd' },
    { username: 'Steve', mc_status: 'online', discord_status: 'offline' }
];

const meta = {
  title: 'Admin/StaffShowcase',
  component: StaffShowcase,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => {
        useEffect(() => {
            const originalFetch = window.fetch;
            window.fetch = async (input, init) => {
                const url = typeof input === 'string' ? input : input.toString();
                
                if (url.includes('/settings')) {
                    return new Response(JSON.stringify({
                        staff_cards: mockStaffData,
                        recruitment_status: 'true',
                        recruitment_link: 'https://google.com'
                    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
                }
                
                if (url.includes('/server/staff')) {
                    return new Response(JSON.stringify(mockOnlineStatus), { 
                        status: 200, 
                        headers: { 'Content-Type': 'application/json' } 
                    });
                }
                
                return originalFetch(input, init);
            };

            return () => {
                window.fetch = originalFetch;
            };
        }, []);

        return <Story />;
    }
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof StaffShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
    decorators: [
        (Story) => {
            useEffect(() => {
                const originalFetch = window.fetch;
                window.fetch = async () => new Promise(() => {}); // Never resolves
                return () => { window.fetch = originalFetch; };
            }, []);
            return <Story />;
        }
    ]
};

export const NoData: Story = {
    decorators: [
        (Story) => {
            useEffect(() => {
                const originalFetch = window.fetch;
                window.fetch = async (input) => {
                    const url = typeof input === 'string' ? input : input.toString();
                    if (url.includes('/settings')) {
                        return new Response(JSON.stringify({ staff_cards: [] }), { status: 200 });
                    }
                    return originalFetch(input);
                };
                return () => { window.fetch = originalFetch; };
            }, []);
            return <Story />;
        }
    ]
};
