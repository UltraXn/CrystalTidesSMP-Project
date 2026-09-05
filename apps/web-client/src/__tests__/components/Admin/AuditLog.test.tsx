import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuditLog from "@/components/Admin/AuditLog";
import { renderWithProviders } from "@/utils/test-utils";
import * as adminDataHooks from "@/hooks/useAdminData";

vi.mock("@/hooks/useAdminData", () => ({
  useAuditLogs: vi.fn(),
}));

describe("Admin/AuditLog", () => {
  const mockLogs = [
    {
      id: "log-1",
      created_at: 1718000000000,
      username: "Steve",
      action: "BAN_USER",
      details: "Banned player Herobrine for flying",
      source: "game",
    },
    {
      id: "log-2",
      created_at: 1718003600000,
      username: "AlexAdmin",
      action: "UPDATE_CONFIG",
      details: "Changed max player limit to 150",
      source: "web",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminDataHooks.useAuditLogs).mockReturnValue({
      data: { data: mockLogs, total: 2 },
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useAuditLogs>);
  });

  it("renders audit log table with headers and log entries", () => {
    renderWithProviders(<AuditLog />);

    expect(screen.getByText("admin.audit.title")).toBeInTheDocument();
    expect(screen.getByText("admin.audit.subtitle")).toBeInTheDocument();

    expect(screen.getByText("Steve")).toBeInTheDocument();
    expect(screen.getByText("BAN_USER")).toBeInTheDocument();
    expect(
      screen.getByText("Banned player Herobrine for flying"),
    ).toBeInTheDocument();

    expect(screen.getByText("AlexAdmin")).toBeInTheDocument();
    expect(screen.getByText("UPDATE_CONFIG")).toBeInTheDocument();
    expect(
      screen.getByText("Changed max player limit to 150"),
    ).toBeInTheDocument();
  });

  it("renders loader during loading state", () => {
    vi.mocked(adminDataHooks.useAuditLogs).mockReturnValue({
      data: null,
      isLoading: true,
    } as unknown as ReturnType<typeof adminDataHooks.useAuditLogs>);

    const { container } = renderWithProviders(<AuditLog />);
    expect(
      container.querySelector(".premium-loader-container"),
    ).toBeInTheDocument();
  });

  it("renders empty state when there are no logs", () => {
    vi.mocked(adminDataHooks.useAuditLogs).mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useAuditLogs>);

    renderWithProviders(<AuditLog />);
    expect(screen.getByText("admin.audit.no_logs_found")).toBeInTheDocument();
    expect(
      screen.getByText("admin.audit.try_adjust_filters"),
    ).toBeInTheDocument();
  });

  it("changes filter source when filter buttons are clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuditLog />);

    const gameBtn = screen.getByRole("button", {
      name: /admin\.audit\.source_game/i,
    });
    await user.click(gameBtn);

    expect(adminDataHooks.useAuditLogs).toHaveBeenCalledWith(1, 50, "", "game");
  });

  it("updates search term with debounce and passes it to query hook", () => {
    vi.useFakeTimers();

    renderWithProviders(<AuditLog />);
    const searchInput = screen.getByRole("textbox");

    fireEvent.change(searchInput, { target: { value: "Herobrine" } });

    // Before debounce timer finishes
    expect(adminDataHooks.useAuditLogs).not.toHaveBeenCalledWith(
      1,
      50,
      "Herobrine",
      "all",
    );

    // Fast-forward debounce timer (500ms)
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(adminDataHooks.useAuditLogs).toHaveBeenCalledWith(
      1,
      50,
      "Herobrine",
      "all",
    );

    vi.useRealTimers();
  });

  it("renders pagination controls and switches pages when total exceeds limit", async () => {
    const user = userEvent.setup();
    vi.mocked(adminDataHooks.useAuditLogs).mockReturnValue({
      data: { data: mockLogs, total: 150 },
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useAuditLogs>);

    renderWithProviders(<AuditLog mockTotal={150} />);

    expect(
      screen.getByRole("navigation", { name: /Paginación de registros/i }),
    ).toBeInTheDocument();

    const page2Btn = screen.getByRole("button", { name: /Página 2/i });
    expect(page2Btn).toBeInTheDocument();

    await user.click(page2Btn);
    expect(adminDataHooks.useAuditLogs).toHaveBeenCalledWith(2, 50, "", "all");
  });
});
