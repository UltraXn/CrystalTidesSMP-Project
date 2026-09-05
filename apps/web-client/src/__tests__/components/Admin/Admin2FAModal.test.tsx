import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Admin2FAModal from "@/components/Admin/Admin2FAModal";
import { renderWithProviders } from "@/utils/test-utils";
import * as adminAuth from "@/services/adminAuth";
import * as adminDataHooks from "@/hooks/useAdminData";

vi.mock("@/services/adminAuth", () => ({
  setAdminToken: vi.fn(),
}));

vi.mock("@/hooks/useAdminData", () => ({
  useVerifyAdmin2FA: vi.fn(),
}));

describe("Admin/Admin2FAModal", () => {
  const mockOnVerified = vi.fn();
  const mockOnClose = vi.fn();
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminDataHooks.useVerifyAdmin2FA).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof adminDataHooks.useVerifyAdmin2FA>);
  });

  it("renders null when isOpen is false", () => {
    const { container } = renderWithProviders(
      <Admin2FAModal isOpen={false} onVerified={mockOnVerified} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders dialog correctly when isOpen is true", () => {
    renderWithProviders(
      <Admin2FAModal isOpen={true} onVerified={mockOnVerified} onClose={mockOnClose} />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Acceso Restringido")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("000 000")).toBeInTheDocument();
  });

  it("disallows submit button when code has fewer than 6 digits", () => {
    renderWithProviders(
      <Admin2FAModal isOpen={true} onVerified={mockOnVerified} onClose={mockOnClose} />
    );

    const submitBtn = screen.getByRole("button", { name: /Verificar Acceso/i });
    expect(submitBtn).toBeDisabled();

    const input = screen.getByPlaceholderText("000 000");
    fireEvent.change(input, { target: { value: "123" } });
    expect(submitBtn).toBeDisabled();
  });

  it("filters out non-numeric characters on typing", () => {
    renderWithProviders(
      <Admin2FAModal isOpen={true} onVerified={mockOnVerified} onClose={mockOnClose} />
    );

    const input = screen.getByPlaceholderText("000 000") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "abc123xy45" } });
    expect(input.value).toBe("12345");
  });

  it("submits 6-digit code and calls onVerified and setAdminToken on success", async () => {
    mockMutate.mockImplementation((_code: string, options: { onSuccess: (data: { adminToken: string }) => void }) => {
      options.onSuccess({ adminToken: "mock-jwt-token-123" });
    });

    renderWithProviders(
      <Admin2FAModal isOpen={true} onVerified={mockOnVerified} onClose={mockOnClose} />
    );

    const input = screen.getByPlaceholderText("000 000");
    fireEvent.change(input, { target: { value: "123456" } });

    const submitBtn = screen.getByRole("button", { name: /Verificar Acceso/i });
    expect(submitBtn).toBeEnabled();

    fireEvent.click(submitBtn);

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith("123456", expect.any(Object));
    expect(adminAuth.setAdminToken).toHaveBeenCalledWith("mock-jwt-token-123");
    expect(mockOnVerified).toHaveBeenCalledTimes(1);
  });

  it("displays error message on verification failure", async () => {
    mockMutate.mockImplementation((_code: string, options: { onError: (err: Error) => void }) => {
      options.onError(new Error("Invalid 2FA Code"));
    });

    renderWithProviders(
      <Admin2FAModal isOpen={true} onVerified={mockOnVerified} onClose={mockOnClose} />
    );

    const input = screen.getByPlaceholderText("000 000") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "654321" } });

    const submitBtn = screen.getByRole("button", { name: /Verificar Acceso/i });
    fireEvent.click(submitBtn);

    expect(screen.getByRole("alert")).toHaveTextContent("Código incorrecto. Inténtalo de nuevo.");
    expect(input.value).toBe("");
  });

  it("calls onClose when close buttons are clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <Admin2FAModal isOpen={true} onVerified={mockOnVerified} onClose={mockOnClose} />
    );

    const closeBtn = screen.getByLabelText("Cerrar modal de autenticación");
    await user.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    const cancelBtn = screen.getByRole("button", { name: /Cancelar y volver al inicio/i });
    await user.click(cancelBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });
});
