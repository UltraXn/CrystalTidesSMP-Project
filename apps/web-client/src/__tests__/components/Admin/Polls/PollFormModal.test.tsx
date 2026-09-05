import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/test-utils";
import PollFormModal from "@/components/Admin/Polls/PollFormModal";
import { Poll } from "@/components/Admin/Polls/types";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

describe("PollFormModal", () => {
  const samplePoll: Poll = {
    id: 1,
    title: "Encuesta Servidor",
    title_en: "Server Poll",
    question: "¿Qué evento prefieres?",
    question_en: "What event do you prefer?",
    options: [
      { id: 10, label: "Parkour", label_en: "Parkour" },
      { id: 11, label: "Torneo PvP", label_en: "PvP Tournament" },
    ],
  };

  it("renders creation mode with default empty inputs", () => {
    // Arrange & Act
    renderWithProviders(
      <PollFormModal
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        poll={null}
        creating={false}
        buttonSuccess={false}
        hasActivePoll={false}
        onTranslate={vi.fn()}
        translatingField={null}
        translatedValues={{}}
      />,
    );

    // Assert
    expect(screen.getByText("admin.polls.create_title")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "admin.polls.form_extras.title_es" }),
    ).toHaveValue("");
    expect(
      screen.getByRole("textbox", {
        name: "admin.polls.form_extras.question_es",
      }),
    ).toHaveValue("");
    expect(
      screen.getByRole("textbox", { name: "Opción en español 1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Opción en español 2" }),
    ).toBeInTheDocument();
  });

  it("populates fields in edit mode when poll is provided", () => {
    // Arrange & Act
    renderWithProviders(
      <PollFormModal
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        poll={samplePoll}
        creating={false}
        buttonSuccess={false}
        hasActivePoll={true}
        onTranslate={vi.fn()}
        translatingField={null}
        translatedValues={{}}
      />,
    );

    // Assert
    expect(screen.getByText("Editar Encuesta")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "admin.polls.form_extras.title_es" }),
    ).toHaveValue("Encuesta Servidor");
    expect(
      screen.getByRole("textbox", {
        name: "admin.polls.form_extras.question_es",
      }),
    ).toHaveValue("¿Qué evento prefieres?");
    expect(
      screen.getByRole("textbox", { name: "Opción en español 1" }),
    ).toHaveValue("Parkour");
    expect(
      screen.getByRole("textbox", { name: "Opción en español 2" }),
    ).toHaveValue("Torneo PvP");
  });

  it("adds and removes options dynamically", async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithProviders(
      <PollFormModal
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        poll={null}
        creating={false}
        buttonSuccess={false}
        hasActivePoll={false}
        onTranslate={vi.fn()}
        translatingField={null}
        translatedValues={{}}
      />,
    );

    // Initially 2 options, no delete button
    expect(
      screen.queryByLabelText("Eliminar opción 1"),
    ).not.toBeInTheDocument();

    // Act: click add option
    const addBtn = screen.getByRole("button", {
      name: "admin.polls.form.add_option",
    });
    await user.click(addBtn);

    // Assert 3 options exist
    expect(
      screen.getByRole("textbox", { name: "Opción en español 3" }),
    ).toBeInTheDocument();
    const deleteOption3Btn = screen.getByLabelText("Eliminar opción 3");
    expect(deleteOption3Btn).toBeInTheDocument();

    // Act: click remove option 3
    await user.click(deleteOption3Btn);

    // Assert option 3 is gone
    expect(
      screen.queryByRole("textbox", { name: "Opción en español 3" }),
    ).not.toBeInTheDocument();
  });

  it("triggers onTranslate callback when translate buttons are clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const onTranslate = vi.fn();

    renderWithProviders(
      <PollFormModal
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        poll={samplePoll}
        creating={false}
        buttonSuccess={false}
        hasActivePoll={false}
        onTranslate={onTranslate}
        translatingField={null}
        translatedValues={{}}
      />,
    );

    // Act: click title translate
    const translateBtns = screen.getAllByRole("button", {
      name: "admin.polls.form_extras.translate",
    });
    await user.click(translateBtns[0]);

    // Assert
    expect(onTranslate).toHaveBeenCalledWith("Encuesta Servidor", "title");
  });

  it("displays active poll warning in create mode when hasActivePoll is true", () => {
    // Arrange & Act
    renderWithProviders(
      <PollFormModal
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        poll={null}
        creating={false}
        buttonSuccess={false}
        hasActivePoll={true}
        onTranslate={vi.fn()}
        translatingField={null}
        translatedValues={{}}
      />,
    );

    // Assert
    expect(
      screen.getByText("admin.polls.form.warning_active"),
    ).toBeInTheDocument();
  });

  it("submits form data when submit button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <PollFormModal
        onClose={vi.fn()}
        onSubmit={onSubmit}
        poll={samplePoll}
        creating={false}
        buttonSuccess={false}
        hasActivePoll={false}
        onTranslate={vi.fn()}
        translatingField={null}
        translatedValues={{}}
      />,
    );

    // Act
    const submitBtn = screen.getByRole("button", { name: /actualizar/i });
    await user.click(submitBtn);

    // Assert
    expect(onSubmit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        title: "Encuesta Servidor",
        question: "¿Qué evento prefieres?",
      }),
    );
  });

  it("calls onClose when close or cancel button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithProviders(
      <PollFormModal
        onClose={onClose}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        poll={null}
        creating={false}
        buttonSuccess={false}
        hasActivePoll={false}
        onTranslate={vi.fn()}
        translatingField={null}
        translatedValues={{}}
      />,
    );

    // Act: click close modal
    const closeBtn = screen.getByRole("button", { name: "Cerrar modal" });
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Act: click cancel
    const cancelBtn = screen.getByRole("button", {
      name: "admin.polls.form_extras.cancel",
    });
    await user.click(cancelBtn);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
