import type { Meta, StoryObj } from "@storybook/react";
import { ProfileEditorDialog } from "../../components/Launcher/ProfileEditorDialog";

const meta: Meta<typeof ProfileEditorDialog> = {
  title: "Launcher/ProfileEditorDialog",
  component: ProfileEditorDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProfileEditorDialog>;

export const OpenModal: Story = {
  args: {
    profile: null,
  },
};

export const LoadingState: Story = {
  args: {},
};
