import type { Meta, StoryObj } from "@storybook/react";
import type { User } from "@supabase/supabase-js";
import ProfileSettings from "../../components/Account/ProfileSettings";

const mockUser: User = {
  id: "usr_test_123",
  app_metadata: {},
  user_metadata: {
    bio: "Explorador y constructor en CrystalTides SMP",
    avatar_preference: "minecraft",
    public_stats: true,
    notify_events: true,
    notify_mentions: true,
    full_name: "Nero",
  },
  aud: "authenticated",
  created_at: "2025-01-01T00:00:00.000Z",
  email: "nero@crystaltides.net",
  phone: "",
  role: "authenticated",
  updated_at: "2025-01-01T00:00:00.000Z",
};

const meta: Meta<typeof ProfileSettings> = {
  title: "Account/ProfileSettings",
  component: ProfileSettings,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProfileSettings>;

export const DefaultSettings: Story = {
  args: {
    user: mockUser,
    mcUsername: "NeroFerno",
    showToast: (msg, type) => console.log(`[Toast ${type}]: ${msg}`),
  },
};

export const SocialAvatarSettings: Story = {
  args: {
    user: {
      ...mockUser,
      user_metadata: {
        ...mockUser.user_metadata,
        avatar_preference: "social",
        picture: "https://ui-avatars.com/api/?name=Nero",
      },
    },
    mcUsername: "NeroFerno",
    showToast: (msg, type) => console.log(`[Toast ${type}]: ${msg}`),
  },
};
