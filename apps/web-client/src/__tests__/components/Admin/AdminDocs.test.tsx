import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminDocs from "@/components/Admin/AdminDocs";
import { renderWithProviders } from "@/utils/test-utils";

// Mock supabaseClient
vi.mock("@/services/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: "mock-token" } },
      }),
    },
  },
}));

// Mock uploadService
vi.mock("@/services/uploadService", () => ({
  uploadImage: vi.fn().mockResolvedValue("https://example.com/mock-image.png"),
}));

// Mock adminAuth
vi.mock("@/services/adminAuth", () => ({
  getAuthHeaders: vi.fn().mockReturnValue({ Authorization: "Bearer mock-token" }),
}));

// Sample docs for test isolation
const sampleDocs = [
  {
    id: "intro",
    title: "Introducción",
    content: "# Introducción\n\nBienvenido al centro de control.",
  },
  {
    id: "security",
    title: "Seguridad (2FA)",
    content: "# Seguridad\n\nProtección de acceso.",
  },
  {
    id: "moderation",
    title: "Moderación",
    content: "# Moderación\n\nReglas y sanciones.",
  },
];

describe("Admin/AdminDocs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  it("renders document titles and initial active content with mockDocs", () => {
    renderWithProviders(<AdminDocs mockDocs={sampleDocs} />);

    // Check tabs in sidebar
    expect(screen.getByRole("button", { name: /ver documento: introducción/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ver documento: seguridad/i })).toBeInTheDocument();

    // Check rendered heading
    expect(screen.getByRole("heading", { name: "Introducción", level: 2 })).toBeInTheDocument();
  });

  it("switches tabs and displays corresponding content", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminDocs mockDocs={sampleDocs} />);

    // Click on Seguridad tab
    const secTab = screen.getByRole("button", { name: /ver documento: seguridad/i });
    await user.click(secTab);

    // Active document heading should now be Seguridad (2FA)
    expect(screen.getByRole("heading", { name: "Seguridad (2FA)", level: 2 })).toBeInTheDocument();
  });

  it("toggles edit mode and allows updating content", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminDocs mockDocs={sampleDocs} />);

    // Click Edit button
    const editBtn = screen.getByRole("button", { name: /edit_section|editar/i });
    await user.click(editBtn);

    // Textarea should appear
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();

    // Type new text
    await user.clear(textarea);
    await user.type(textarea, "Texto actualizado");

    // Save button should be available
    const saveBtn = screen.getByRole("button", { name: /save|guardar/i });
    expect(saveBtn).toBeInTheDocument();
  });

  it("cancels edit mode without saving", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminDocs mockDocs={sampleDocs} />);

    // Enter edit mode
    const editBtn = screen.getByRole("button", { name: /edit_section|editar/i });
    await user.click(editBtn);

    // Cancel edit
    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelBtn);

    // Textarea should no longer be present
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("shows reset confirmation modal when reset button is clicked in edit mode", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminDocs mockDocs={sampleDocs} />);

    // Enter edit mode
    const editBtn = screen.getByRole("button", { name: /edit_section|editar/i });
    await user.click(editBtn);

    // Click reset button
    const resetBtn = screen.getByRole("button", { name: /restablecer documento|reset/i });
    await user.click(resetBtn);

    // PremiumConfirm modal should show up
    expect(screen.getByText(/Restablecer Sección|reset_confirm_title/i)).toBeInTheDocument();
  });
});
