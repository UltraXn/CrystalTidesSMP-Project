import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import StaffShowcase from "@/components/Home/StaffShowcase";
import { renderWithProviders } from "@/utils/test-utils";

describe("StaffShowcase", () => {
  const sampleStaff = [
    {
      id: "killu",
      name: "KillubysmaliVT",
      role: "Killuwu",
      color: "#00637c",
      image: "/skins/killu.png",
      mc_nickname: "KillubysmaliVT",
      description: "Creadora, streamer y líder comunitaria.",
      socials: { twitter: "KilluBysmali", discord: "killubysmalivt" },
    },
    {
      id: "nero",
      name: "Neroferno ultranix",
      role: "Neroferno",
      color: "#ff00b7",
      image: "/skins/nero.png",
      mc_nickname: "Neroferno",
      description: "Co-fundador y desarrollador Lead.",
      socials: { twitter: "Neroferno", discord: "neroferno" },
    },
  ];

  it("renders the staff team section title and mocked staff members", () => {
    renderWithProviders(<StaffShowcase mockStaff={sampleStaff} />);

    expect(
      screen.getByRole("heading", { level: 2, name: /Nuestro Equipo/i })
    ).toBeInTheDocument();

    expect(screen.getByText("KillubysmaliVT")).toBeInTheDocument();
    expect(screen.getByText("Neroferno ultranix")).toBeInTheDocument();
  });

  it("renders staff roles and descriptions", () => {
    renderWithProviders(<StaffShowcase mockStaff={sampleStaff} />);

    expect(
      screen.getByText("Creadora, streamer y líder comunitaria.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Co-fundador y desarrollador Lead.")
    ).toBeInTheDocument();
  });
});
