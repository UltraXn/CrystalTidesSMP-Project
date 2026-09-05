import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import UserAchievementsModal from "@/components/Admin/Users/UserAchievementsModal";
import {
  UserDefinition,
  AchievementDefinition,
} from "@/components/Admin/Users/types";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallbackOrOptions?: string | Record<string, unknown>) => {
      if (typeof fallbackOrOptions === "string") return fallbackOrOptions;
      return key;
    },
    i18n: { language: "es" },
  }),
}));

describe("UserAchievementsModal", () => {
  const mockUser: UserDefinition = {
    id: "user-001",
    email: "alex@example.com",
    username: "AlexMiner",
    achievements: ["first_mine"],
    created_at: "2026-01-01T00:00:00Z",
  };

  const mockAchievements: AchievementDefinition[] = [
    {
      id: "first_mine",
      name: "First Blood",
      description: "Mine your first diamond",
      criteria: "mine_diamond_1",
      icon: "💎",
    },
    {
      id: "dragon_slayer",
      name: "Dragon Slayer",
      description: "Defeat the Ender Dragon",
      criteria: "kill_dragon_1",
      icon: "🐉",
    },
  ];

  const defaultProps = {
    user: mockUser,
    availableAchievements: mockAchievements,
    onClose: vi.fn(),
    onSave: vi.fn(),
    saving: false,
    onToggleAchievement: vi.fn(),
  };

  it("renders modal with user name and available achievements", () => {
    renderWithProviders(<UserAchievementsModal {...defaultProps} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("AlexMiner")).toBeInTheDocument();
    expect(screen.getByText("First Blood")).toBeInTheDocument();
    expect(screen.getByText("Dragon Slayer")).toBeInTheDocument();
  });

  it("reflects active/assigned achievements with aria-pressed and correct label", () => {
    renderWithProviders(<UserAchievementsModal {...defaultProps} />);

    const firstMineBtn = screen.getByRole("button", {
      name: "Remover logro First Blood",
    });
    expect(firstMineBtn).toHaveAttribute("aria-pressed", "true");

    const dragonBtn = screen.getByRole("button", {
      name: "Asignar logro Dragon Slayer",
    });
    expect(dragonBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onToggleAchievement when clicking an achievement", async () => {
    const user = userEvent.setup();
    const onToggleAchievement = vi.fn();
    renderWithProviders(
      <UserAchievementsModal
        {...defaultProps}
        onToggleAchievement={onToggleAchievement}
      />,
    );

    const dragonBtn = screen.getByRole("button", {
      name: "Asignar logro Dragon Slayer",
    });
    await user.click(dragonBtn);

    expect(onToggleAchievement).toHaveBeenCalledWith("dragon_slayer");
  });

  it("handles empty available achievements array", () => {
    renderWithProviders(
      <UserAchievementsModal {...defaultProps} availableAchievements={[]} />,
    );

    expect(screen.getByText("No hay logros definidos")).toBeInTheDocument();
  });

  it("calls onClose and onSave on respective button clicks", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSave = vi.fn();

    renderWithProviders(
      <UserAchievementsModal
        {...defaultProps}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    const cancelBtn = screen.getByRole("button", { name: "Cancelar" });
    await user.click(cancelBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    const saveBtn = screen.getByRole("button", { name: "Guardar Logros" });
    await user.click(saveBtn);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("disables save button and displays saving text when saving is true", () => {
    renderWithProviders(
      <UserAchievementsModal {...defaultProps} saving={true} />,
    );

    const saveBtn = screen.getByRole("button", { name: "Guardando..." });
    expect(saveBtn).toBeDisabled();
  });
});
