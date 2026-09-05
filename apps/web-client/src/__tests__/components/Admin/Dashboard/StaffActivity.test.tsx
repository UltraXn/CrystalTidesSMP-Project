import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/utils/test-utils";
import StaffActivity, {
  StaffMember,
} from "@/components/Admin/Dashboard/StaffActivity";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

vi.mock("@/components/UI/MinecraftAvatar", () => ({
  default: ({ alt }: { alt: string }) => (
    <img
      data-testid="mc-avatar"
      alt={alt}
      src="https://example.com/avatar.png"
    />
  ),
}));

describe("StaffActivity", () => {
  const sampleStaff: StaffMember[] = [
    {
      username: "AlexDev",
      avatar: "https://example.com/alex.png",
      role: "Developer",
      login_time: Date.now() - 3600000 * 2, // 2 hours ago
      mc_status: "online",
      discord_status: "online",
    },
    {
      username: "SarahMod",
      avatar: "https://example.com/sarah.png",
      role: "Moderator",
      login_time: null,
      mc_status: "offline",
      discord_status: "dnd",
    },
  ];

  it("renders offline message when server is offline and no staff are online", () => {
    // Arrange & Act
    renderWithProviders(
      <StaffActivity staffOnline={[]} serverOnline={false} />,
    );

    // Assert
    expect(
      screen.getByText("admin.dashboard.staff.offline_msg"),
    ).toBeInTheDocument();
  });

  it("renders no staff message when server is online but staff list is empty", () => {
    // Arrange & Act
    renderWithProviders(<StaffActivity staffOnline={[]} serverOnline={true} />);

    // Assert
    expect(
      screen.getByText("admin.dashboard.staff.no_staff"),
    ).toBeInTheDocument();
  });

  it("renders online staff count badge and staff members when staff are present", () => {
    // Arrange & Act
    renderWithProviders(
      <StaffActivity staffOnline={sampleStaff} serverOnline={true} />,
    );

    // Assert
    expect(screen.getByText("2 ON")).toBeInTheDocument();
    expect(screen.getByText("AlexDev")).toBeInTheDocument();
    expect(screen.getByText("SarahMod")).toBeInTheDocument();
    expect(screen.getByText("JUGANDO")).toBeInTheDocument();
    expect(screen.getByText("NO MOLESTAR")).toBeInTheDocument();
  });

  it("renders session duration when login_time is present and mc_status is online", () => {
    // Arrange & Act
    renderWithProviders(
      <StaffActivity staffOnline={sampleStaff} serverOnline={true} />,
    );

    // Assert: 2 hours ago -> should contain "2h"
    expect(screen.getByText(/2h/)).toBeInTheDocument();
  });
});
