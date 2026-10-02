import type { Meta, StoryObj } from "@storybook/react";
import DashboardOverview from "../../components/Admin/DashboardOverview";

const meta: Meta<typeof DashboardOverview> = {
  title: "Admin/DashboardOverview",
  component: DashboardOverview,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DashboardOverview>;

export const Default: Story = {
  args: {
    mockServerStats: {
      online: true,
      status: "running",
      memory: { current: 8192, limit: 24576 },
      cpu: 14.5,
      players: { online: 42, max: 100 },
      global: { total: 1540, new: 12, playtime: 340 },
    },
    mockStaffOnline: [
      {
        username: "NeroFerno",
        avatar: "https://mc-heads.net/avatar/NeroFerno/64",
        role: "admin",
        login_time: Date.now(),
        mc_status: "online",
        discord_status: "online",
      },
    ],
    mockTicketStats: { open: 3, urgent: 1 },
    mockDonationStats: { currentMonth: "145.00", percentChange: 12.5 },
  },
};

export const ServerOffline: Story = {
  args: {
    mockServerStats: {
      online: false,
      status: "offline",
      memory: { current: 0, limit: 24576 },
      cpu: 0,
      players: { online: 0, max: 100 },
      global: { total: 1540, new: 0, playtime: 340 },
    },
    mockStaffOnline: [],
    mockTicketStats: { open: 0, urgent: 0 },
    mockDonationStats: { currentMonth: "0.00", percentChange: 0 },
  },
};
