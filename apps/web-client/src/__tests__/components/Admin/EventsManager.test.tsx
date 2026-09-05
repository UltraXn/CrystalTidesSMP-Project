import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EventsManager from "@/components/Admin/EventsManager";
import { renderWithProviders } from "@/utils/test-utils";
import * as adminDataHooks from "@/hooks/useAdminData";

vi.mock("@/hooks/useAdminData", () => ({
  useAdminEvents: vi.fn(),
  useCreateEvent: vi.fn(),
  useUpdateEvent: vi.fn(),
  useDeleteEvent: vi.fn(),
  useEventRegistrations: vi
    .fn()
    .mockReturnValue({ data: [], isLoading: false }),
}));

describe("Admin/EventsManager", () => {
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();
  const mockDeleteMutate = vi.fn();

  const mockEventsList = [
    {
      id: 1,
      title: "Torneo de Construcción",
      title_en: "Building Contest",
      description: "Construye la mejor fortaleza.",
      description_en: "Build the best fortress.",
      type: "hammer",
      status: "active",
      image_url: "https://example.com/event1.png",
      registrations: [{ id: 10, created_at: "2026-06-01" }],
    },
    {
      id: 2,
      title: "Carrera del Nether",
      title_en: "Nether Race",
      description: "Llega al portal final sin morir.",
      description_en: "Reach the exit portal without dying.",
      type: "running",
      status: "soon",
      image_url: "https://example.com/event2.png",
      registrations: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(adminDataHooks.useAdminEvents).mockReturnValue({
      data: mockEventsList,
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useAdminEvents>);

    vi.mocked(adminDataHooks.useCreateEvent).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useCreateEvent>);

    vi.mocked(adminDataHooks.useUpdateEvent).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useUpdateEvent>);

    vi.mocked(adminDataHooks.useDeleteEvent).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useDeleteEvent>);
  });

  it("renders header, create button, and events list", () => {
    renderWithProviders(<EventsManager />);

    expect(screen.getByText("admin.events.title")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /admin\.events\.create_title/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Torneo de Construcción")).toBeInTheDocument();
    expect(screen.getByText("Carrera del Nether")).toBeInTheDocument();
  });

  it("opens EventFormModal when clicking create button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<EventsManager />);

    const newBtn = screen.getByRole("button", {
      name: /admin\.events\.create_title/i,
    });
    await user.click(newBtn);

    const headings = screen.getAllByRole("heading", {
      name: "admin.events.create_title",
    });
    expect(headings.length).toBeGreaterThan(0);
  });

  it("opens EventFormModal with existing event data when clicking edit", async () => {
    const user = userEvent.setup();
    renderWithProviders(<EventsManager />);

    const editBtns = screen.getAllByRole("button", {
      name: "admin.events.edit_title",
    });
    await user.click(editBtns[0]);

    const headings = screen.getAllByRole("heading", {
      name: "admin.events.edit_title",
    });
    expect(headings.length).toBeGreaterThan(0);
    const titleInputs = screen.getAllByRole("textbox");
    expect(
      titleInputs.some(
        (input) =>
          (input as HTMLInputElement).value === "Torneo de Construcción",
      ),
    ).toBe(true);
  });

  it("opens delete confirmation modal and calls deleteMutation when confirmed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<EventsManager />);

    const deleteBtns = screen.getAllByRole("button", {
      name: "admin.events.delete_tooltip",
    });
    await user.click(deleteBtns[0]);

    expect(
      screen.getByText("admin.events.delete_modal.title"),
    ).toBeInTheDocument();

    const confirmDeleteBtn = screen.getByRole("button", {
      name: "admin.events.delete_modal.confirm",
    });
    await user.click(confirmDeleteBtn);

    expect(mockDeleteMutate).toHaveBeenCalledTimes(1);
    expect(mockDeleteMutate).toHaveBeenCalledWith(1, expect.any(Object));
  });

  it("opens registrations modal when clicking registrations button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<EventsManager mockRegistrationsMap={{ 1: [] }} />);

    const regBtns = screen.getAllByRole("button", {
      name: "admin.events.registrations.view_tooltip",
    });
    await user.click(regBtns[0]);

    expect(
      screen.getByText(/admin\.events\.registrations\.title/i),
    ).toBeInTheDocument();
  });
});
