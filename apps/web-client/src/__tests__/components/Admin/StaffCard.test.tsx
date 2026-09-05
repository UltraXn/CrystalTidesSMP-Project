import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StaffCard from "@/components/Admin/StaffCard";
import { renderWithProviders } from "@/utils/test-utils";

vi.mock("@/components/UI/MinecraftAvatar", () => ({
  default: ({ src, alt, size }: { src: string; alt: string; size: number }) => (
    <div
      data-testid="minecraft-avatar"
      data-src={src}
      data-alt={alt}
      data-size={size}
    />
  ),
}));

describe("Admin/StaffCard", () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const defaultStaff = {
    id: 1,
    name: "Alex",
    mc_nickname: "AlexMC",
    role: "Administrator",
    description: "Server lead administrator and developer.",
    image: "https://example.com/alex.png",
    color: "#ff0055",
    socials: {
      discord: "Alex#0001",
      twitter: "https://twitter.com/alex",
      twitch: "alex_streams",
      youtube: "https://youtube.com/@alex",
    },
  };

  const defaultStatus = {
    mc: "online",
    discord: "online",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders staff member information, avatar, and custom theme color", () => {
    const { container } = renderWithProviders(
      <StaffCard
        data={defaultStaff}
        status={defaultStatus}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("Alex")).toBeInTheDocument();
    expect(
      screen.getByText("Server lead administrator and developer."),
    ).toBeInTheDocument();
    expect(screen.getByText("Administrator")).toBeInTheDocument();

    const avatar = screen.getByTestId("minecraft-avatar");
    expect(avatar).toHaveAttribute("data-src", "https://example.com/alex.png");
    expect(avatar).toHaveAttribute("data-alt", "Alex");

    const card = container.querySelector(".staff-card-premium");
    expect(card).toHaveStyle({ borderTopColor: "#ff0055" });
  });

  it("renders status indicators for MC and Discord correctly", () => {
    const { container, rerender } = renderWithProviders(
      <StaffCard
        data={defaultStaff}
        status={{ mc: "online", discord: "dnd" }}
      />,
    );

    const mcIndicator = container.querySelector(".status-orb-mini.mc");
    expect(mcIndicator).toHaveClass("online");
    expect(mcIndicator).toHaveAttribute("title", "MC: online");

    const discordIndicator = container.querySelector(
      ".status-orb-mini.discord",
    );
    expect(discordIndicator).toHaveClass("dnd");
    expect(discordIndicator).toHaveAttribute("title", "Discord: dnd");

    // Rerender as offline
    rerender(
      <StaffCard
        data={defaultStaff}
        status={{ mc: "offline", discord: "offline" }}
      />,
    );
    expect(container.querySelector(".status-orb-mini.mc")).toHaveClass(
      "offline",
    );
    expect(container.querySelector(".status-orb-mini.discord")).toHaveClass(
      "offline",
    );
  });

  it("renders image badge when roleBadge prop is provided", () => {
    renderWithProviders(
      <StaffCard
        data={defaultStaff}
        status={defaultStatus}
        roleBadge="https://example.com/badges/admin.png"
      />,
    );

    const badgeImg = screen.getByAltText("Administrator");
    expect(badgeImg).toBeInTheDocument();
    expect(badgeImg).toHaveAttribute(
      "src",
      "https://example.com/badges/admin.png",
    );
    expect(screen.queryByText("Administrator")).not.toBeInTheDocument();
  });

  it("renders all social links when present", () => {
    const { container } = renderWithProviders(
      <StaffCard data={defaultStaff} status={defaultStatus} />,
    );

    expect(
      container.querySelector(".staff-social-link.discord"),
    ).toHaveAttribute("title", "Discord: Alex#0001");
    expect(screen.getByLabelText("Twitch de Alex")).toHaveAttribute(
      "href",
      "https://twitch.tv/alex_streams",
    );
    expect(screen.getByLabelText("Twitter de Alex")).toHaveAttribute(
      "href",
      "https://twitter.com/alex",
    );
    expect(screen.getByLabelText("YouTube de Alex")).toHaveAttribute(
      "href",
      "https://youtube.com/@alex",
    );
  });

  it("displays 'No socials' message when no social accounts are linked", () => {
    const noSocialsStaff = {
      ...defaultStaff,
      socials: {},
    };

    renderWithProviders(
      <StaffCard data={noSocialsStaff} status={defaultStatus} />,
    );

    expect(screen.getByText("No socials")).toBeInTheDocument();
  });

  it("triggers onEdit and onDelete callbacks when buttons are clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <StaffCard
        data={defaultStaff}
        status={defaultStatus}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    const editBtn = screen.getByRole("button", { name: "Editar a Alex" });
    await user.click(editBtn);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);

    const deleteBtn = screen.getByRole("button", { name: "Eliminar a Alex" });
    await user.click(deleteBtn);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });
});
