import type { Meta, StoryObj } from "@storybook/react";
import StaffCardsManager, {
  StaffCardsManagerProps,
} from "../../components/Admin/StaffCardsManager";

const meta: Meta<StaffCardsManagerProps> = {
  title: "Admin/StaffCardsManager",
  component: StaffCardsManager,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<StaffCardsManagerProps>;

export const AbyssalVariant: Story = {
  args: {
    mockCards: [
      {
        id: 1,
        name: "Killu",
        role: "Administrador",
        image: "/images/staff/killu.webp",
        color: "#38BDF8",
        description: "Objeto místico de CrystalTides SMP",
      },
    ],
  },
};

export const LegendaryVariant: Story = {
  args: {
    mockCards: [
      {
        id: 2,
        name: "Nero",
        role: "Fundador",
        image: "/images/staff/nero.webp",
        color: "#F59E0B",
        description: "Rareza suprema",
      },
    ],
  },
};
