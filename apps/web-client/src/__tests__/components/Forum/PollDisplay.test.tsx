import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PollDisplay from "@/components/Forum/PollDisplay";
import { renderWithProviders } from "@/utils/test-utils";

const mockPoll = {
  id: "poll-123",
  question: "¿Qué bioma deberíamos agregar al servidor?",
  options: [
    { id: "opt-1", label: "Cerezo Profundo", percent: 60, votes: 12 },
    { id: "opt-2", label: "Pantano Místico", percent: 40, votes: 8 },
  ],
  totalVotes: 20,
  closesIn: "3 días",
};

const mockDiscordPoll = {
  id: "poll-discord",
  question: "Votación especial en Discord",
  options: [],
  totalVotes: 50,
  closesIn: "1 día",
  discord_link: "https://discord.gg/crystaltides",
};

describe("PollDisplay", () => {
  it("returns null when poll data is null", () => {
    const { container } = renderWithProviders(<PollDisplay poll={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders Discord poll card when discord_link is present", () => {
    renderWithProviders(<PollDisplay poll={mockDiscordPoll} />);

    expect(screen.getByText("Encuesta en Discord")).toBeInTheDocument();
    const voteLink = screen.getByRole("link", { name: /ir a votar/i });
    expect(voteLink).toBeInTheDocument();
    expect(voteLink).toHaveAttribute("href", "https://discord.gg/crystaltides");
  });

  it("renders native poll with question, options and vote statistics", () => {
    renderWithProviders(<PollDisplay poll={mockPoll} />);

    expect(
      screen.getByText("¿Qué bioma deberíamos agregar al servidor?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Cerezo Profundo")).toBeInTheDocument();
    expect(screen.getByText("Pantano Místico")).toBeInTheDocument();
    expect(screen.getByText(/Total: 20 votos/)).toBeInTheDocument();
    expect(screen.getByText(/Cierra en 3 días/)).toBeInTheDocument();
  });

  it("invokes onVote when an option button is selected", async () => {
    const handleVote = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    renderWithProviders(<PollDisplay poll={mockPoll} onVote={handleVote} />);

    const optionButton = screen.getByRole("button", {
      name: /cerezo profundo/i,
    });
    await user.click(optionButton);

    expect(handleVote).toHaveBeenCalledWith("opt-1");
    expect(await screen.findByText("Votado")).toBeInTheDocument();
  });
});
