import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DonationsManager from "@/components/Admin/DonationsManager";
import { renderWithProviders } from "@/utils/test-utils";
import * as adminDataHooks from "@/hooks/useAdminData";

vi.mock("@/hooks/useAdminData", () => ({
  useAdminDonations: vi.fn(),
  useCreateDonation: vi.fn(),
  useUpdateDonation: vi.fn(),
  useDeleteDonation: vi.fn(),
}));

describe("Admin/DonationsManager", () => {
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();
  const mockDeleteMutate = vi.fn();

  const mockDonationsList = [
    {
      id: 1,
      from_name: "DiamondSupporter",
      amount: 50,
      currency: "USD",
      message: "¡Gracias por el gran servidor!",
      is_public: true,
      buyer_email: "diamond@example.com",
      created_at: "2026-06-01T15:00:00Z",
    },
    {
      id: 2,
      from_name: "GoldPlayer",
      amount: 25,
      currency: "USD",
      message: "Apoyando al proyecto",
      is_public: true,
      buyer_email: "gold@example.com",
      created_at: "2026-06-02T18:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(adminDataHooks.useAdminDonations).mockReturnValue({
      data: { data: mockDonationsList, totalPages: 1 },
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useAdminDonations>);

    vi.mocked(adminDataHooks.useCreateDonation).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useCreateDonation>);

    vi.mocked(adminDataHooks.useUpdateDonation).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useUpdateDonation>);

    vi.mocked(adminDataHooks.useDeleteDonation).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useDeleteDonation>);
  });

  it("renders donation statistics cards and table rows", () => {
    renderWithProviders(<DonationsManager />);

    // Title & subtitle
    expect(screen.getByText("admin.donations.title")).toBeInTheDocument();
    expect(
      screen.getByText("admin.donations.manager_desc"),
    ).toBeInTheDocument();

    // Stats calculations: total 75.00, count 2, avg 37.50
    expect(screen.getByText("$75.00")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("$37.50")).toBeInTheDocument();

    // Table rows
    expect(screen.getByText("DiamondSupporter")).toBeInTheDocument();
    expect(
      screen.getByText("¡Gracias por el gran servidor!"),
    ).toBeInTheDocument();
    expect(screen.getByText("GoldPlayer")).toBeInTheDocument();
    expect(screen.getByText("Apoyando al proyecto")).toBeInTheDocument();
  });

  it("renders empty state when there are no donations", () => {
    vi.mocked(adminDataHooks.useAdminDonations).mockReturnValue({
      data: { data: [], totalPages: 0 },
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useAdminDonations>);

    renderWithProviders(<DonationsManager mockDonations={[]} />);

    expect(screen.getByText("admin.donations.empty")).toBeInTheDocument();
  });

  it("opens create modal when new donation button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DonationsManager />);

    const newBtn = screen.getByRole("button", {
      name: /admin\.donations\.new_btn/i,
    });
    await user.click(newBtn);

    const headings = screen.getAllByRole("heading", {
      name: "admin.donations.new_btn",
    });
    expect(headings.length).toBeGreaterThan(0);
  });

  it("opens edit modal when clicking edit button in table", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DonationsManager />);

    const editBtn = screen.getByRole("button", {
      name: /Editar donación de DiamondSupporter/i,
    });
    await user.click(editBtn);

    expect(screen.getByText("admin.donations.edit_title")).toBeInTheDocument();
  });

  it("opens delete modal and executes deleteMutation on confirm", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DonationsManager />);

    const deleteBtn = screen.getByRole("button", {
      name: /Eliminar donación de DiamondSupporter/i,
    });
    await user.click(deleteBtn);

    expect(
      screen.getByText("admin.donations.delete_confirm.title"),
    ).toBeInTheDocument();

    const confirmDeleteBtn = screen.getByRole("button", {
      name: "admin.donations.delete_confirm.btn",
    });
    await user.click(confirmDeleteBtn);

    expect(mockDeleteMutate).toHaveBeenCalledWith(1, expect.any(Object));
  });
});
