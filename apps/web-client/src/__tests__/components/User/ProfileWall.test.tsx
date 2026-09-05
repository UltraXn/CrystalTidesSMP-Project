import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import ProfileWall from "@/components/User/ProfileWall";
import { renderWithProviders } from "@/utils/test-utils";
import { ProfileComment } from "@/services/profileCommentService";

vi.mock("@/services/profileCommentService", () => ({
  getProfileComments: vi.fn().mockResolvedValue([]),
  postProfileComment: vi.fn().mockResolvedValue({
    id: 99,
    content: "New mock comment",
    created_at: new Date().toISOString(),
    author_id: "user-1",
    author: { username: "Tester", role: "user" },
  }),
  deleteProfileComment: vi.fn().mockResolvedValue(true),
}));

describe("ProfileWall", () => {
  const sampleComments: ProfileComment[] = [
    {
      id: 1,
      author_id: "usr-2",
      content: "Great builds on the server!",
      created_at: new Date().toISOString(),
      author: {
        username: "BuilderBob",
        role: "user",
        minecraft_nick: "BuilderBob",
        avatar_url: "https://example.com/avatar.png",
      },
    },
  ];

  it("renders empty state message when no comments are present", () => {
    renderWithProviders(
      <ProfileWall profileId="prof-1" mockComments={[]} />
    );

    expect(
      screen.getByText(/Aún no hay mensajes|empty/i)
    ).toBeInTheDocument();
  });

  it("renders list of comments with author username and message content", () => {
    renderWithProviders(
      <ProfileWall profileId="prof-1" mockComments={sampleComments} />
    );

    expect(screen.getByText("Great builds on the server!")).toBeInTheDocument();
    expect(screen.getAllByText("BuilderBob").length).toBeGreaterThan(0);
  });

  it("renders login required message when user is not authenticated", () => {
    renderWithProviders(
      <ProfileWall profileId="prof-1" mockComments={sampleComments} />,
      { auth: { user: null } }
    );

    expect(
      screen.getByText(/Inicia sesión para dejar un comentario|login/i)
    ).toBeInTheDocument();
  });
});
