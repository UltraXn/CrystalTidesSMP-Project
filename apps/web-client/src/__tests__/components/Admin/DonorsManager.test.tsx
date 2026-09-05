import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DonorsManager from "@/components/Admin/DonorsManager";
import { renderWithProviders } from "@/utils/test-utils";
import * as adminDataHooks from "@/hooks/useAdminData";

vi.mock("@/hooks/useAdminData", () => ({
  useAdminSettings: vi.fn(),
  useUpdateSiteSetting: vi.fn(),
}));

describe("Admin/DonorsManager", () => {
  const mockUpdateSettingMutate = vi.fn();

  const mockDonorsList = [
    {
      id: "1",
      name: "LegendaryDonor",
      skinUrl: "https://example.com/skin1.png",
      description: "Generous contributor to the server.",
      ranks: ["donador", "fundador"],
      isPremium: true,
    },
    {
      id: "2",
      name: "EpicSupporter",
      skinUrl: "https://example.com/skin2.png",
      description: "Supporting community events.",
      ranks: ["donador"],
      isPremium: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(adminDataHooks.useAdminSettings).mockReturnValue({
      data: { donors: mockDonorsList },
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useAdminSettings>);

    vi.mocked(adminDataHooks.useUpdateSiteSetting).mockReturnValue({
      mutate: mockUpdateSettingMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useUpdateSiteSetting>);
  });

  it("renders donors header and donor cards list", () => {
    renderWithProviders(<DonorsManager />);

    expect(screen.getByText("admin.donors.manager_title")).toBeInTheDocument();
    expect(screen.getByText("LegendaryDonor")).toBeInTheDocument();
    expect(screen.getByText('"Generous contributor to the server."')).toBeInTheDocument();

    expect(screen.getByText("EpicSupporter")).toBeInTheDocument();
    expect(screen.getByText('"Supporting community events."')).toBeInTheDocument();
  });

  it("renders loader during loading state", () => {
    vi.mocked(adminDataHooks.useAdminSettings).mockReturnValue({
      data: null,
      isLoading: true,
    } as unknown as ReturnType<typeof adminDataHooks.useAdminSettings>);

    const { container } = renderWithProviders(<DonorsManager />);
    expect(container.querySelector(".premium-loader-container")).toBeInTheDocument();
  });

  it("renders empty state and import button when donors list is empty", async () => {
    const user = userEvent.setup();
    vi.mocked(adminDataHooks.useAdminSettings).mockReturnValue({
      data: { donors: [] },
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useAdminSettings>);

    renderWithProviders(<DonorsManager />);

    expect(screen.getByText("admin.donors.empty_msg")).toBeInTheDocument();

    const importBtn = screen.getByRole("button", { name: /admin\.donors\.import_btn/i });
    expect(importBtn).toBeInTheDocument();
    await user.click(importBtn);

    expect(screen.getByText("admin.donors.import_confirm.title")).toBeInTheDocument();
  });

  it("opens create modal when add button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DonorsManager />);

    const addBtn = screen.getByRole("button", { name: /admin\.donors\.add_btn/i });
    await user.click(addBtn);

    expect(screen.getByText("admin.donors.new_title")).toBeInTheDocument();
  });

  it("opens edit modal when edit button on card is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DonorsManager />);

    const editBtns = screen.getAllByRole("button", { name: /admin\.polls\.edit_btn|editar/i });
    await user.click(editBtns[0]);

    expect(screen.getByText("admin.donors.edit_title")).toBeInTheDocument();
  });

  it("opens delete modal and executes updateSettingMutation on confirm", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DonorsManager />);

    const deleteBtns = screen.getAllByRole("button", { name: /admin\.donors\.delete_btn|eliminar/i });
    await user.click(deleteBtns[0]);

    expect(screen.getByText("admin.donors.delete_confirm.title")).toBeInTheDocument();

    const confirmDeleteBtn = screen.getByRole("button", { name: "admin.donors.delete_confirm.btn" });
    await user.click(confirmDeleteBtn);

    expect(mockUpdateSettingMutate).toHaveBeenCalledWith(
      {
        key: "donors_list",
        value: expect.any(String),
      },
      expect.any(Object)
    );
  });
});
