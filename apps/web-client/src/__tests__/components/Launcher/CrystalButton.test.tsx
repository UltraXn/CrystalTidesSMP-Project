import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CrystalButton } from "@/components/Launcher/CrystalButton";
import { renderWithProviders } from "@/utils/test-utils";

describe("Launcher/CrystalButton", () => {
  it("renders button text and triggers onPressed callback on click", async () => {
    const handlePress = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <CrystalButton text="Jugar Ahora" onPressed={handlePress} />
    );

    const btn = screen.getByRole("button", { name: "Jugar Ahora" });
    expect(btn).toBeInTheDocument();
    await user.click(btn);
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it("disables button and shows spinner when isLoading is true", async () => {
    const handlePress = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <CrystalButton
        text="Iniciando..."
        isLoading={true}
        onPressed={handlePress}
      />
    );

    const btn = screen.getByRole("button", { name: /Iniciando/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");

    await user.click(btn);
    expect(handlePress).not.toHaveBeenCalled();
  });
});
