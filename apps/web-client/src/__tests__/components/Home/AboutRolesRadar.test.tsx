import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import AboutRolesRadar from "@/components/Home/AboutRolesRadar";
import { renderWithProviders } from "@/utils/test-utils";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  RadarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="radar-chart">{children}</div>
  ),
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  Radar: () => <div data-testid="radar" />,
}));

describe("AboutRolesRadar", () => {
  const sampleData = [
    { subject: "Ataque", A: 85 },
    { subject: "Defensa", A: 70 },
    { subject: "Velocidad", A: 90 },
  ];

  it("renders radar chart with responsive container and polar elements", () => {
    renderWithProviders(
      <AboutRolesRadar data={sampleData} colorHex="#89d9d1" />,
    );

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("radar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("polar-grid")).toBeInTheDocument();
    expect(screen.getByTestId("radar")).toBeInTheDocument();
  });
});
