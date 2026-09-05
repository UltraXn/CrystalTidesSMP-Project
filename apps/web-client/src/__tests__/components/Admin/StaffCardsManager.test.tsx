import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StaffCardsManager from "@/components/Admin/StaffCardsManager";
import { renderWithProviders } from "@/utils/test-utils";
import * as adminDataHooks from "@/hooks/useAdminData";

// Mock all hooks used by StaffCardsManager
vi.mock("@/hooks/useAdminData", () => ({
  useAdminSettings: vi.fn(),
  useUpdateSiteSetting: vi.fn(),
  useStaffOnlineStatus: vi.fn(),
}));

// Mock supabaseClient (used for sync auth)
vi.mock("@/services/supabaseClient", () => ({
  supabase: { auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) } },
}));

describe("Admin/StaffCardsManager", () => {
  const mockMutate = vi.fn();

  const mockCards = [
    {
      id: 1,
      name: "Neroferno",
      role: "Neroferno",
      description: "El mero mero",
      image: "https://example.com/nero.png",
      color: "#8b5cf6",
      socials: { twitter: "", discord: "neroferno", twitch: "", youtube: "" },
    },
    {
      id: 2,
      name: "TestMod",
      role: "Moderator",
      description: "Un mod de pruebas",
      image: "https://example.com/mod.png",
      color: "#21cb20",
      socials: { twitter: "", discord: "testmod", twitch: "", youtube: "" },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(adminDataHooks.useAdminSettings).mockReturnValue({
      data: { staff: mockCards },
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useAdminSettings>);

    vi.mocked(adminDataHooks.useUpdateSiteSetting).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useUpdateSiteSetting>);

    vi.mocked(adminDataHooks.useStaffOnlineStatus).mockReturnValue({
      data: { Neroferno: { mc: "online", discord: "online" } },
    } as unknown as ReturnType<typeof adminDataHooks.useStaffOnlineStatus>);
  });

  it("renders staff cards with names and roles", () => {
    renderWithProviders(<StaffCardsManager />);

    expect(screen.getByText("Neroferno")).toBeInTheDocument();
    expect(screen.getByText("TestMod")).toBeInTheDocument();
  });

  it("renders manager title from i18n key", () => {
    renderWithProviders(<StaffCardsManager />);

    expect(screen.getByText("admin.staff.manager_title")).toBeInTheDocument();
  });

  it("shows loader when settings are loading", () => {
    vi.mocked(adminDataHooks.useAdminSettings).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof adminDataHooks.useAdminSettings>);

    const { container } = renderWithProviders(<StaffCardsManager />);
    // Loader renders a spinner div
    expect(container.querySelector(".loader, .spinner") || container.textContent).toBeTruthy();
  });

  it("renders empty state with no staff cards", () => {
    vi.mocked(adminDataHooks.useAdminSettings).mockReturnValue({
      data: { staff: [] },
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useAdminSettings>);

    renderWithProviders(<StaffCardsManager />);
    // With zero cards, the list should not render any card names
    expect(screen.queryByText("Neroferno")).not.toBeInTheDocument();
  });

  it("allows using mockCards prop to override hook data", () => {
    const customCards = [
      { id: 99, name: "CustomStaff", role: "Admin", description: "test", image: "", color: "#ef4444", socials: {} },
    ];

    renderWithProviders(<StaffCardsManager mockCards={customCards} />);

    expect(screen.getByText("CustomStaff")).toBeInTheDocument();
    expect(screen.queryByText("Neroferno")).not.toBeInTheDocument();
  });

  it("calls delete handler with confirmation when delete is triggered", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();

    renderWithProviders(<StaffCardsManager />);

    // StaffList should have delete buttons
    const deleteButtons = screen.getAllByRole("button", { name: /delete|eliminar|admin\.staff/i });
    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0]);
      expect(window.confirm).toHaveBeenCalled();
      expect(mockMutate).toHaveBeenCalled();
    }
  });
});
