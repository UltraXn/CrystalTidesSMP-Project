import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useQuery } from "@tanstack/react-query";
import BroadcastAlert from "@/components/UI/BroadcastAlert";

interface BroadcastConfig {
  active: boolean;
  type: "alert" | "error" | "info";
  message: string;
}

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

describe("BroadcastAlert", () => {
  let user: ReturnType<typeof userEvent.setup>;
  const mockConfig: BroadcastConfig = {
    active: true,
    type: "alert",
    message: "Test Alert",
  };

  beforeEach(() => {
    user = userEvent.setup();
    vi.mocked(useQuery).mockReturnValue({
      data: mockConfig,
    } as unknown as ReturnType<typeof useQuery>);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render the alert when config is active and visible", () => {
    render(<BroadcastAlert />);
    expect(screen.getByText("Test Alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /action/i })).toBeInTheDocument();
  });

  it("should not render the alert when config is not active", () => {
    vi.mocked(useQuery).mockReturnValue({
      data: { ...mockConfig, active: false },
    } as unknown as ReturnType<typeof useQuery>);
    render(<BroadcastAlert />);
    expect(screen.queryByText("Test Alert")).not.toBeInTheDocument();
  });

  it("should not render the alert when user clicks close button", async () => {
    render(<BroadcastAlert />);
    const closeButton = screen.getByRole("button", { name: /action/i });
    await user.click(closeButton);
    expect(screen.queryByText("Test Alert")).not.toBeInTheDocument();
  });

  it("should render with correct styles for alert type", () => {
    render(<BroadcastAlert />);
    const textElement = screen.getByText("Test Alert");
    const container = textElement.closest("div");
    expect(container).toHaveStyle({ background: "#facc15", color: "#000" });
  });

  it("should render with correct styles for error type", () => {
    const errorConfig: BroadcastConfig = { ...mockConfig, type: "error" };
    vi.mocked(useQuery).mockReturnValue({
      data: errorConfig,
    } as unknown as ReturnType<typeof useQuery>);
    render(<BroadcastAlert />);
    const textElement = screen.getByText("Test Alert");
    const container = textElement.closest("div");
    expect(container).toHaveStyle({ background: "#ef4444", color: "#fff" });
  });

  it("should render with correct styles for info type", () => {
    const infoConfig: BroadcastConfig = { ...mockConfig, type: "info" };
    vi.mocked(useQuery).mockReturnValue({
      data: infoConfig,
    } as unknown as ReturnType<typeof useQuery>);
    render(<BroadcastAlert />);
    const textElement = screen.getByText("Test Alert");
    const container = textElement.closest("div");
    expect(container).toHaveStyle({ background: "#3b82f6", color: "#fff" });
  });

  it("should handle real-time updates from broadcastChanged event", async () => {
    render(<BroadcastAlert />);
    const newConfig = { active: true, type: "alert", message: "Updated Alert" };
    const event = new CustomEvent("broadcastChanged", {
      detail: JSON.stringify(newConfig),
    });
    window.dispatchEvent(event);
    await waitFor(() => {
      expect(screen.getByText("Updated Alert")).toBeInTheDocument();
    });
  });

  it("should handle invalid JSON in real-time updates gracefully", () => {
    render(<BroadcastAlert />);
    const event = new CustomEvent("broadcastChanged", {
      detail: "invalid json",
    });
    window.dispatchEvent(event);
    expect(screen.getByText("Test Alert")).toBeInTheDocument();
  });

  it("should handle null config", () => {
    vi.mocked(useQuery).mockReturnValue({ data: null } as unknown as ReturnType<
      typeof useQuery
    >);
    render(<BroadcastAlert />);
    expect(screen.queryByText("Test Alert")).not.toBeInTheDocument();
  });

  it("should handle undefined config", () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useQuery>);
    render(<BroadcastAlert />);
    expect(screen.queryByText("Test Alert")).not.toBeInTheDocument();
  });
});
