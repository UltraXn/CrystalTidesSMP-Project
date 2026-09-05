import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UsersManager from "@/components/Admin/UsersManager";
import { renderWithProviders } from "@/utils/test-utils";
import * as adminDataHooks from "@/hooks/useAdminData";

// Mock admin data hooks
vi.mock("@/hooks/useAdminData", () => ({
  useAdminSettings: vi.fn(),
  useUsers: vi.fn(),
  useUpdateUserRole: vi.fn(),
  useUpdateUserMetadata: vi.fn(),
}));

// Mock AuthContext — preserve the real AuthContext export for renderWithProviders
vi.mock("@/context/AuthContext", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useAuth: () => ({
      user: {
        id: "admin-123",
        email: "admin@crystaltides.com",
        user_metadata: { username: "AdminUser" },
        app_metadata: { role: "developer" },
      },
    }),
  };
});

// Mock roleUtils
vi.mock("@/utils/roleUtils", () => ({
  getUserRole: () => "Developer",
}));

// Mock supabaseClient
vi.mock("@/services/supabaseClient", () => ({
  supabase: { auth: { refreshSession: vi.fn().mockResolvedValue({}) } },
}));

// Mock discordService
vi.mock("@/services/discordService", () => ({
  sendDiscordLog: vi.fn(),
}));

describe("Admin/UsersManager", () => {
  const mockUpdateRoleMutate = vi.fn();
  const mockUpdateMetaMutate = vi.fn();

  const mockUsers = [
    {
      id: "user-1",
      username: "PlayerOne",
      email: "player1@test.com",
      role: "user",
      medals: [1, 2],
      achievements: ["first_login"],
    },
    {
      id: "user-2",
      username: "ModUser",
      email: "mod@test.com",
      role: "moderator",
      medals: [],
      achievements: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(adminDataHooks.useAdminSettings).mockReturnValue({
      data: {
        medals: [{ id: 1, name: "Beta Tester" }, { id: 2, name: "Donor" }],
        achievements: [{ id: "first_login", name: "First Login" }],
      },
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useAdminSettings>);

    vi.mocked(adminDataHooks.useUsers).mockReturnValue({
      data: mockUsers,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useUsers>);

    vi.mocked(adminDataHooks.useUpdateUserRole).mockReturnValue({
      mutate: mockUpdateRoleMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useUpdateUserRole>);

    vi.mocked(adminDataHooks.useUpdateUserMetadata).mockReturnValue({
      mutate: mockUpdateMetaMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useUpdateUserMetadata>);
  });

  it("renders page title", () => {
    renderWithProviders(<UsersManager />);

    expect(screen.getByText("admin.users.title")).toBeInTheDocument();
  });

  it("renders search input and search button", () => {
    renderWithProviders(<UsersManager />);

    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /admin\.users\.search_btn/i })).toBeInTheDocument();
  });

  it("renders user list with usernames", () => {
    renderWithProviders(<UsersManager />);

    expect(screen.getByText("PlayerOne")).toBeInTheDocument();
    expect(screen.getByText("ModUser")).toBeInTheDocument();
  });

  it("shows no users when data is empty and search has been performed", () => {
    vi.mocked(adminDataHooks.useUsers).mockReturnValue({
      data: [],
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useUsers>);

    renderWithProviders(<UsersManager />);

    expect(screen.queryByText("PlayerOne")).not.toBeInTheDocument();
  });

  it("performs search when search button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersManager />);

    const searchInput = screen.getByRole("searchbox");
    await user.type(searchInput, "Player");

    const searchBtn = screen.getByRole("button", { name: /admin\.users\.search_btn/i });
    await user.click(searchBtn);

    // The useUsers hook should have been called; no error thrown
    expect(screen.getByRole("searchbox")).toHaveValue("Player");
  });
});
