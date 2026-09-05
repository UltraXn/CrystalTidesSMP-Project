import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import SuggestionDeleteModal from "@/components/Admin/Suggestions/SuggestionDeleteModal";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallbackOrOptions?: string | Record<string, unknown>) => {
      if (typeof fallbackOrOptions === "string") return fallbackOrOptions;
      return key;
    },
    i18n: { language: "es" },
  }),
}));

describe("SuggestionDeleteModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  };

  it("renders modal content when open", () => {
    renderWithProviders(<SuggestionDeleteModal {...defaultProps} />);

    expect(
      screen.getByText("admin.suggestions.delete_modal.title"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("admin.suggestions.delete_modal.desc"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "admin.suggestions.delete_modal.cancel",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "admin.suggestions.delete_modal.confirm",
      }),
    ).toBeInTheDocument();
  });

  it("returns null when isOpen is false", () => {
    const { container } = renderWithProviders(
      <SuggestionDeleteModal {...defaultProps} isOpen={false} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("calls onClose when clicking cancel button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(
      <SuggestionDeleteModal {...defaultProps} onClose={onClose} />,
    );

    const cancelBtn = screen.getByRole("button", {
      name: "admin.suggestions.delete_modal.cancel",
    });
    await user.click(cancelBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when clicking confirm button", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderWithProviders(
      <SuggestionDeleteModal {...defaultProps} onConfirm={onConfirm} />,
    );

    const confirmBtn = screen.getByRole("button", {
      name: "admin.suggestions.delete_modal.confirm",
    });
    await user.click(confirmBtn);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
