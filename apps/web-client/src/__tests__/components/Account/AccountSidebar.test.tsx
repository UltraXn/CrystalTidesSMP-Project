import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AccountSidebar from "@/components/Account/AccountSidebar";
import { renderWithProviders } from "@/utils/test-utils";
import { User } from "@supabase/supabase-js";

vi.mock("@/hooks/useAccountData", () => ({
  useGachaBalance: () => ({
    data: { crystals: 100, shards: 50 },
    isLoading: false,
  }),
}));

vi.mock("@/services/uploadService", () => ({
  uploadImage: vi.fn().mockResolvedValue("https://example.com/new-avatar.png"),
}));

vi.mock("@/utils/imageOptimizer", () => ({
  compressImage: vi.fn().mockResolvedValue(new Blob()),
}));

const mockUser = {
  id: "usr-123",
  app_metadata: {},
  user_metadata: {
    username: "AlexMiner",
    full_name: "Alex Miner",
  },
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as unknown as User;

describe("AccountSidebar", () => {
  it("renders navigation tabs and switches tabs on click", async () => {
    const handleTabChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <AccountSidebar
        activeTab="overview"
        setActiveTab={handleTabChange}
        user={mockUser}
        mcUsername="AlexMC"
        isLinked={true}
      />,
    );

    expect(screen.getByText("Alex Miner")).toBeInTheDocument();
    const avatarImg = screen.getByRole('img', { name: /avatar/i });
    expect(avatarImg).toHaveAttribute('src', expect.stringContaining('AlexMC'));

    const settingsTab = screen.getByRole("button", {
      name: /configuración|settings/i,
    });
    await user.click(settingsTab);
    expect(handleTabChange).toHaveBeenCalledWith("settings");
  });

  it("triggers logout when logout button is clicked", async () => {
    const mockLogout = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    renderWithProviders(
      <AccountSidebar
        activeTab="overview"
        setActiveTab={vi.fn()}
        user={mockUser}
        mcUsername="AlexMC"
        isLinked={true}
      />,
      { auth: { logout: mockLogout } },
    );

    const logoutBtn = screen.getByRole("button", {
      name: /cerrar sesión|logout/i,
    });
    await user.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
  });
});
