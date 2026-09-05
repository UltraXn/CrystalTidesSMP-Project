import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PollsManager from "@/components/Admin/PollsManager";
import { renderWithProviders } from "@/utils/test-utils";
import * as adminDataHooks from "@/hooks/useAdminData";

vi.mock("@/hooks/useAdminData", () => ({
  useAdminActivePoll: vi.fn(),
  useAdminPolls: vi.fn(),
  useCreatePoll: vi.fn(),
  useUpdatePoll: vi.fn(),
  useClosePoll: vi.fn(),
  useDeletePoll: vi.fn(),
  useTranslateText: vi.fn(),
}));

describe("Admin/PollsManager", () => {
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();
  const mockCloseMutate = vi.fn();
  const mockDeleteMutate = vi.fn();

  const mockActivePollData = {
    id: 1,
    title: "Votación de Bioma Favorito",
    question: "¿Qué bioma debería renovarse en el próximo parche?",
    closesIn: "3 días",
    totalVotes: 120,
    options: [
      { id: "101", label: "Pantano", votes: 80, percent: 67 },
      { id: "102", label: "Desierto", votes: 40, percent: 33 },
    ],
  };

  const mockHistoryPollsData = [
    {
      id: 2,
      title: "Encuesta de Clases RPG",
      created_at: "2026-05-15T12:00:00Z",
      totalVotes: 450,
      is_active: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(adminDataHooks.useAdminActivePoll).mockReturnValue({
      data: mockActivePollData,
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useAdminActivePoll>);

    vi.mocked(adminDataHooks.useAdminPolls).mockReturnValue({
      data: { data: mockHistoryPollsData, totalPages: 1 },
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useAdminPolls>);

    vi.mocked(adminDataHooks.useCreatePoll).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useCreatePoll>);

    vi.mocked(adminDataHooks.useUpdatePoll).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useUpdatePoll>);

    vi.mocked(adminDataHooks.useClosePoll).mockReturnValue({
      mutate: mockCloseMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useClosePoll>);

    vi.mocked(adminDataHooks.useDeletePoll).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useDeletePoll>);

    vi.mocked(adminDataHooks.useTranslateText).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useTranslateText>);
  });

  it("renders active poll details, question, and vote options", () => {
    renderWithProviders(<PollsManager />);

    expect(screen.getByText("Votación de Bioma Favorito")).toBeInTheDocument();
    expect(screen.getByText("¿Qué bioma debería renovarse en el próximo parche?")).toBeInTheDocument();
    expect(screen.getByText("Pantano")).toBeInTheDocument();
    expect(screen.getByText("67%")).toBeInTheDocument();
    expect(screen.getByText("Desierto")).toBeInTheDocument();
    expect(screen.getByText("33%")).toBeInTheDocument();
  });

  it("renders empty state when there is no active poll", () => {
    vi.mocked(adminDataHooks.useAdminActivePoll).mockReturnValue({
      data: null,
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useAdminActivePoll>);

    renderWithProviders(<PollsManager mockActivePoll={null} />);

    expect(screen.getByText("admin.polls.no_active")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /admin\.polls\.create_now_btn/i })).toBeInTheDocument();
  });

  it("switches to history tab and renders past polls table", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PollsManager />);

    const historyTabBtn = screen.getByRole("button", { name: /admin\.polls\.tabs\.history/i });
    await user.click(historyTabBtn);

    expect(screen.getByText("admin.polls.history_title")).toBeInTheDocument();
    expect(screen.getByText("Encuesta de Clases RPG")).toBeInTheDocument();
    expect(screen.getByText("450")).toBeInTheDocument();
  });

  it("opens create modal when new poll button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PollsManager />);

    const newBtn = screen.getByRole("button", { name: /admin\.polls\.new_btn/i });
    await user.click(newBtn);

    expect(screen.getByText("admin.polls.create_title")).toBeInTheDocument();
  });

  it("opens edit modal when edit button on active poll is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PollsManager />);

    const editBtn = screen.getByRole("button", { name: "admin.polls.edit_btn" });
    await user.click(editBtn);

    expect(screen.getByText("Editar Encuesta")).toBeInTheDocument();
  });

  it("opens delete modal and executes deleteMutation on confirm", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PollsManager />);

    const deleteBtn = screen.getByRole("button", { name: "admin.polls.delete_tooltip" });
    await user.click(deleteBtn);

    expect(screen.getByText("¿Eliminar Encuesta?")).toBeInTheDocument();

    const confirmDeleteBtn = screen.getByRole("button", { name: "Eliminar" });
    await user.click(confirmDeleteBtn);

    expect(mockDeleteMutate).toHaveBeenCalledWith(1, expect.any(Object));
  });

  it("prompts confirmation and closes poll when close button is clicked", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    renderWithProviders(<PollsManager />);

    const closeBtn = screen.getByRole("button", { name: /admin\.polls\.close_btn/i });
    await user.click(closeBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockCloseMutate).toHaveBeenCalledWith(1);
  });
});
