import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import DonationDeleteModal from "@/components/Admin/Donations/DonationDeleteModal";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

describe("DonationDeleteModal", () => {
  it("renders null when isOpen is false", () => {
    // Arrange & Act
    const { container } = renderWithProviders(
      <DonationDeleteModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    // Assert
    expect(container.firstChild).toBeNull();
  });

  it("renders modal elements and texts when isOpen is true", () => {
    // Arrange & Act
    renderWithProviders(
      <DonationDeleteModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    // Assert
    expect(
      screen.getByText("admin.donations.delete_confirm.title"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("admin.donations.delete_confirm.msg"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "common.cancel" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "admin.donations.delete_confirm.btn",
      }),
    ).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(
      <DonationDeleteModal
        isOpen={true}
        onClose={onClose}
        onConfirm={vi.fn()}
      />,
    );

    // Act
    const cancelBtn = screen.getByRole("button", { name: "common.cancel" });
    await user.click(cancelBtn);

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when confirm delete button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderWithProviders(
      <DonationDeleteModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    // Act
    const confirmBtn = screen.getByRole("button", {
      name: "admin.donations.delete_confirm.btn",
    });
    await user.click(confirmBtn);

    // Assert
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("disables confirm button and shows deleting text when deleting is true", () => {
    // Arrange & Act
    renderWithProviders(
      <DonationDeleteModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        deleting={true}
      />,
    );

    // Assert
    const confirmBtn = screen.getByRole("button", { name: "common.deleting" });
    expect(confirmBtn).toBeDisabled();
  });
});
