import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import DonationFeed from "@/components/Widgets/DonationFeed";
import { renderWithProviders } from "@/utils/test-utils";

const mockDonationsList = [
  {
    id: "don-1",
    from_name: "AlexMC",
    amount: "15.00",
    currency: "USD",
    message: "¡Gracias por el excelente servidor!",
    created_at: new Date().toISOString(),
    is_public: true,
  },
  {
    id: "don-2",
    from_name: "SteveCraft",
    amount: "5.00",
    currency: "EUR",
    message: "Apoyo para el hosting",
    created_at: new Date().toISOString(),
    is_public: true,
  },
];

describe("DonationFeed", () => {
  it("renders a list of public donations with names and amounts", () => {
    renderWithProviders(<DonationFeed mockDonations={mockDonationsList} />);

    expect(screen.getAllByText("AlexMC")[0]).toBeInTheDocument();
    expect(screen.getAllByText("SteveCraft")[0]).toBeInTheDocument();
    expect(
      screen.getAllByText(/¡Gracias por el excelente servidor!/)[0],
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Apoyo para el hosting/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/15\.00/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/5\.00/)[0]).toBeInTheDocument();
  });

  it("renders empty message or container when no donations exist", () => {
    renderWithProviders(<DonationFeed mockDonations={[]} />);

    expect(screen.queryByText("AlexMC")).not.toBeInTheDocument();
  });
});
