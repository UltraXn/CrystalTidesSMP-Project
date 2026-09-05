import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import DonorFormModal, {
  Donor,
} from "@/components/Admin/Donors/DonorFormModal";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

vi.mock("@/services/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: "mock-test-token" } },
      }),
    },
  },
}));

vi.mock("@/services/adminAuth", () => ({
  getAuthHeaders: vi.fn(() => ({ Authorization: "Bearer mock-test-token" })),
}));

describe("DonorFormModal", () => {
  const sampleDonor: Donor = {
    id: "donor-1",
    name: "SteveDonor",
    skinUrl: "https://example.com/steve.png",
    description: "Jugador activo y colaborador",
    description_en: "Active player and collaborator",
    ranks: ["donador"],
    isPremium: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("returns null when donor prop is null", () => {
    // Arrange & Act
    const { container } = renderWithProviders(
      <DonorFormModal
        donor={null}
        isNew={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
        saving={false}
      />,
    );

    // Assert
    expect(container.firstChild).toBeNull();
  });

  it("renders modal with new donor title when isNew is true", () => {
    // Arrange & Act
    renderWithProviders(
      <DonorFormModal
        donor={sampleDonor}
        isNew={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        saving={false}
      />,
    );

    // Assert
    expect(screen.getByText("admin.donors.new_title")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "admin.donors.form.nick" }),
    ).toHaveValue("SteveDonor");
  });

  it("renders modal with edit donor title when isNew is false", () => {
    // Arrange & Act
    renderWithProviders(
      <DonorFormModal
        donor={sampleDonor}
        isNew={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
        saving={false}
      />,
    );

    // Assert
    expect(screen.getByText("admin.donors.edit_title")).toBeInTheDocument();
  });

  it("toggles isPremium checkbox and shows or hides skin url input", async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithProviders(
      <DonorFormModal
        donor={sampleDonor}
        isNew={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
        saving={false}
      />,
    );

    // Initially skinUrl input is visible
    expect(
      screen.getByRole("textbox", { name: "admin.donors.form.skin_url" }),
    ).toBeInTheDocument();

    // Act: check isPremium
    const isPremiumCheckbox = screen.getByRole("checkbox", {
      name: "Es donador premium",
    });
    await user.click(isPremiumCheckbox);

    // Assert: skinUrl input is hidden for premium donors
    expect(
      screen.queryByRole("textbox", { name: "admin.donors.form.skin_url" }),
    ).not.toBeInTheDocument();
  });

  it("toggles rank badges when clicked in ranks selector", async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithProviders(
      <DonorFormModal
        donor={sampleDonor}
        isNew={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
        saving={false}
      />,
    );

    const fundadorRankBtn = screen.getByRole("button", { name: /fundador/i });
    expect(fundadorRankBtn).toHaveAttribute("aria-pressed", "false");

    // Act: click to select
    await user.click(fundadorRankBtn);
    expect(fundadorRankBtn).toHaveAttribute("aria-pressed", "true");

    // Act: click again to deselect
    await user.click(fundadorRankBtn);
    expect(fundadorRankBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("translates description to English when translate button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      {
        ok: true,
        json: async () => ({
          success: true,
          translatedText: "Translated to English successfully",
        }),
      },
    );

    renderWithProviders(
      <DonorFormModal
        donor={sampleDonor}
        isNew={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
        saving={false}
      />,
    );

    // Act: click translate to EN
    const translateBtn = screen.getByRole("button", {
      name: "admin.donors.form.translate_en",
    });
    await user.click(translateBtn);

    // Assert
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/translation"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            text: "Jugador activo y colaborador",
            targetLang: "en",
          }),
        }),
      );
      expect(
        screen.getByRole("textbox", { name: "admin.donors.form.desc_en" }),
      ).toHaveValue("Translated to English successfully");
    });
  });

  it("calls onClose when close or cancel button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(
      <DonorFormModal
        donor={sampleDonor}
        isNew={false}
        onClose={onClose}
        onSave={vi.fn()}
        saving={false}
      />,
    );

    // Act: click header close
    await user.click(screen.getByRole("button", { name: "Cerrar ventana" }));
    expect(onClose).toHaveBeenCalledTimes(1);

    // Act: click cancel
    await user.click(
      screen.getByRole("button", { name: "admin.donors.form.cancel" }),
    );
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("calls onSave with updated form data when save button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderWithProviders(
      <DonorFormModal
        donor={sampleDonor}
        isNew={false}
        onClose={vi.fn()}
        onSave={onSave}
        saving={false}
      />,
    );

    // Act: change nick
    const nickInput = screen.getByRole("textbox", {
      name: "admin.donors.form.nick",
    });
    await user.clear(nickInput);
    await user.type(nickInput, "SuperSteve");

    const saveBtn = screen.getByRole("button", {
      name: /admin\.donors\.form\.save/i,
    });
    await user.click(saveBtn);

    // Assert
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "SuperSteve",
      }),
    );
  });

  it("disables save button when saving is true", () => {
    // Arrange & Act
    renderWithProviders(
      <DonorFormModal
        donor={sampleDonor}
        isNew={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
        saving={true}
      />,
    );

    // Assert
    const saveBtn = screen.getByRole("button", { name: "" });
    expect(saveBtn).toBeDisabled();
  });
});
