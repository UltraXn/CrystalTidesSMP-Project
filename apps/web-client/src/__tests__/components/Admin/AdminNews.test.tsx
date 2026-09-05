import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { User } from "@supabase/supabase-js";
import AdminNews from "@/components/Admin/AdminNews";
import { renderWithProviders } from "@/utils/test-utils";
import * as adminDataHooks from "@/hooks/useAdminData";

// Mock hooks
vi.mock("@/hooks/useAdminData", () => ({
  useAdminNews: vi.fn(),
  useCreateNews: vi.fn(),
  useUpdateNews: vi.fn(),
  useDeleteNews: vi.fn(),
}));

describe("Admin/AdminNews", () => {
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();
  const mockDeleteMutate = vi.fn();

  const mockUser = {
    id: "admin-1",
    email: "admin@crystaltides.com",
    user_metadata: { full_name: "AdminUser" },
  } as unknown as User;

  const mockNewsPosts = [
    {
      id: 1,
      title: "Gran Actualización 2.0",
      category: "Updates",
      content: "Contenido de la actualización",
      content_en: "Update content",
      status: "Published",
      image: "https://example.com/news1.webp",
      created_at: "2026-08-15T10:00:00Z",
      username: "AdminUser",
    },
    {
      id: 2,
      title: "Evento de Verano",
      category: "Events",
      content: "Evento especial de verano",
      content_en: "Summer event",
      status: "Draft",
      image: "https://example.com/news2.webp",
      created_at: "2026-08-16T10:00:00Z",
      username: "AdminUser",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(adminDataHooks.useAdminNews).mockReturnValue({
      data: mockNewsPosts,
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useAdminNews>);

    vi.mocked(adminDataHooks.useCreateNews).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useCreateNews>);

    vi.mocked(adminDataHooks.useUpdateNews).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useUpdateNews>);

    vi.mocked(adminDataHooks.useDeleteNews).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useDeleteNews>);
  });

  it("renders news cards with titles", () => {
    renderWithProviders(<AdminNews user={mockUser} />);

    expect(screen.getByText("Gran Actualización 2.0")).toBeInTheDocument();
    expect(screen.getByText("Evento de Verano")).toBeInTheDocument();
  });

  it("renders category badges on cards", () => {
    renderWithProviders(<AdminNews user={mockUser} />);

    expect(screen.getByText("Updates")).toBeInTheDocument();
    expect(screen.getByText("Events")).toBeInTheDocument();
  });

  it("renders status indicators (Published/Draft)", () => {
    renderWithProviders(<AdminNews user={mockUser} />);

    expect(screen.getByText("admin.news.form.published")).toBeInTheDocument();
    expect(screen.getByText("admin.news.form.draft")).toBeInTheDocument();
  });

  it("renders search input and new button", () => {
    renderWithProviders(<AdminNews user={mockUser} />);

    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(screen.getByText("admin.news.write_btn")).toBeInTheDocument();
  });

  it("filters news by search term", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminNews user={mockUser} />);

    const searchInput = screen.getByRole("searchbox");
    await user.type(searchInput, "Verano");

    expect(screen.getByText("Evento de Verano")).toBeInTheDocument();
    expect(
      screen.queryByText("Gran Actualización 2.0"),
    ).not.toBeInTheDocument();
  });

  it("shows empty state when no news match", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminNews user={mockUser} />);

    const searchInput = screen.getByRole("searchbox");
    await user.type(searchInput, "XYZ_NO_MATCH");

    expect(screen.getByText("admin.news.no_news")).toBeInTheDocument();
  });

  it("opens delete confirmation modal when delete button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminNews user={mockUser} />);

    const deleteButtons = screen.getAllByTitle("admin.news.delete_tooltip");
    await user.click(deleteButtons[0]);

    expect(
      screen.getByText("admin.news.delete_modal.title"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("admin.news.delete_modal.desc"),
    ).toBeInTheDocument();
  });

  it("calls delete mutation when confirming deletion", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminNews user={mockUser} />);

    // Open delete modal
    const deleteButtons = screen.getAllByTitle("admin.news.delete_tooltip");
    await user.click(deleteButtons[0]);

    // Confirm delete
    const confirmBtn = screen.getByText("admin.news.delete_modal.confirm");
    await user.click(confirmBtn);

    expect(mockDeleteMutate).toHaveBeenCalledWith(1, expect.any(Object));
  });
});
