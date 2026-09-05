import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfileHeader from "@/components/User/ProfileHeader";
import { renderWithProviders } from "@/utils/test-utils";

describe("ProfileHeader", () => {
  const mockProfile = {
    id: "profile-456",
    username: "AlexMiner",
    minecraft_nick: "AlexMC",
    role: "admin",
    reputation: 25,
    status_message: "Exploring deep caves!",
    profile_banner_url: "https://example.com/banner.png",
  };

  const mockCurrentUser = {
    id: "user-789",
    user_metadata: {
      username: "SteveExplorer",
    },
  };

  it("renders profile details, banner, reputation, and status message", () => {
    renderWithProviders(
      <ProfileHeader
        profile={mockProfile}
        currentUser={mockCurrentUser}
        onGiveKarma={vi.fn()}
        givingKarma={false}
      />
    );

    expect(screen.getByRole("img", { name: /banner/i })).toHaveAttribute(
      "src",
      "https://example.com/banner.png"
    );
    expect(screen.getByText("AlexMC")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText(/"Exploring deep caves!"/i)).toBeInTheDocument();
  });

  it("allows other logged-in users to give karma", async () => {
    const handleGiveKarma = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <ProfileHeader
        profile={mockProfile}
        currentUser={mockCurrentUser}
        onGiveKarma={handleGiveKarma}
        givingKarma={false}
      />
    );

    const karmaBtn = screen.getByRole("button", { name: /action/i });
    expect(karmaBtn).toBeInTheDocument();
    await user.click(karmaBtn);
    expect(handleGiveKarma).toHaveBeenCalledTimes(1);
  });

  it("does not display give karma button on own profile", () => {
    renderWithProviders(
      <ProfileHeader
        profile={mockProfile}
        currentUser={{ id: mockProfile.id }}
        onGiveKarma={vi.fn()}
        givingKarma={false}
      />
    );

    expect(screen.queryByRole("button", { name: /action/i })).not.toBeInTheDocument();
  });
});
