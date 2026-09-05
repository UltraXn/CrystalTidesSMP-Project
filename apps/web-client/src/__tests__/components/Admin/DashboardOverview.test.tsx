import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import DashboardOverview from "@/components/Admin/DashboardOverview";
import { renderWithProviders } from "@/utils/test-utils";
import * as adminDataHooks from "@/hooks/useAdminData";

vi.mock("@/hooks/useAdminData", () => ({
  useServerResources: vi.fn(),
  useServerLiveStatus: vi.fn(),
  useStaffOnlineStatus: vi.fn(),
  useTicketStats: vi.fn(),
  useDonationStats: vi.fn(),
}));

vi.mock("@/components/UI/MinecraftAvatar", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <div data-testid="minecraft-avatar" data-src={src} data-alt={alt} />
  ),
}));

describe("Admin/DashboardOverview", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(adminDataHooks.useServerResources).mockReturnValue({
      data: {
        status: "running",
        cpu: 45,
        memory: { current: 8192, limit: 16384 },
        online: 12,
        total_players: 120,
        new_players: 15,
        total_playtime_hours: 450,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useServerResources>);

    vi.mocked(adminDataHooks.useServerLiveStatus).mockReturnValue({
      data: {
        online: true,
        players: { online: 12, max: 100 },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useServerLiveStatus>);

    vi.mocked(adminDataHooks.useStaffOnlineStatus).mockReturnValue({
      data: [
        {
          username: "NachoDev",
          avatar: "NachoDev",
          role: "Developer",
          mc_status: "online",
          discord_status: "online",
          login_time: Date.now() - 3600000,
        },
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useStaffOnlineStatus>);

    vi.mocked(adminDataHooks.useTicketStats).mockReturnValue({
      data: { open: 4, urgent: 1 },
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useTicketStats>);

    vi.mocked(adminDataHooks.useDonationStats).mockReturnValue({
      data: { currentMonth: "1250.00", percentChange: 15 },
      isLoading: false,
    } as unknown as ReturnType<typeof adminDataHooks.useDonationStats>);
  });

  it("renders loader when data is loading and no mockServerStats are provided", () => {
    vi.mocked(adminDataHooks.useServerResources).mockReturnValue({
      data: null,
      isLoading: true,
    } as unknown as ReturnType<typeof adminDataHooks.useServerResources>);

    const { container } = renderWithProviders(<DashboardOverview />);
    expect(
      container.querySelector(".premium-loader-container"),
    ).toBeInTheDocument();
  });

  it("renders server KPI cards correctly from query data", () => {
    renderWithProviders(<DashboardOverview />);

    // KPI: Server status
    expect(
      screen.getByText("admin.dashboard.stats.server_status"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("admin.dashboard.stats.server_online"),
    ).toBeInTheDocument();

    // KPI: Players online
    expect(
      screen.getByText("admin.dashboard.stats.players"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/admin\.dashboard\.stats\.capacity: 100/i),
    ).toBeInTheDocument();

    // KPI: Tickets
    expect(
      screen.getByText("admin.dashboard.stats.pending_tickets"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/admin\.dashboard\.stats\.high_priority/i),
    ).toBeInTheDocument();

    // KPI: Donations / Revenue
    expect(
      screen.getByText("admin.dashboard.stats.revenue"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/\+15% admin\.dashboard\.stats\.vs_prev_month/i),
    ).toBeInTheDocument();
  });

  it("renders ResourceUsage and StaffActivity sections", () => {
    renderWithProviders(<DashboardOverview />);

    // Resource usage
    expect(
      screen.getByText("admin.dashboard.resources.title"),
    ).toBeInTheDocument();
    expect(screen.getByText("45%")).toBeInTheDocument();
    expect(screen.getByText(/8192/)).toBeInTheDocument();
    expect(screen.getByText(/16384/)).toBeInTheDocument();

    // Staff activity
    expect(screen.getByText("NachoDev")).toBeInTheDocument();
  });

  it("prioritizes mock props over query data when supplied", () => {
    const customStats = {
      online: false,
      status: "offline",
      memory: { current: 1024, limit: 8192 },
      cpu: 10,
      players: { online: 0, max: 50 },
      global: { total: 10, new: 1, playtime: 20 },
    };

    const customStaff = [
      {
        username: "Moderator1",
        avatar: "ModSkin",
        role: "Moderator",
        login_time: null,
        mc_status: "offline",
        discord_status: "online",
      },
    ];

    renderWithProviders(
      <DashboardOverview
        mockServerStats={customStats}
        mockStaffOnline={customStaff}
        mockTicketStats={{ open: 0, urgent: 0 }}
        mockDonationStats={{ currentMonth: "50.00", percentChange: -5 }}
      />,
    );

    expect(
      screen.getByText("ADMIN.DASHBOARD.STATS.STATUS_OFFLINE"),
    ).toBeInTheDocument();
    expect(screen.getByText("Moderator1")).toBeInTheDocument();
    expect(screen.getByText("10%")).toBeInTheDocument();
    expect(screen.getByText(/1024/)).toBeInTheDocument();
  });
});
