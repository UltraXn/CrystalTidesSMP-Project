import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/utils/test-utils";
import { ArchitectureInfographic } from "@/components/Launcher/ArchitectureInfographic";

describe("ArchitectureInfographic Component", () => {
  it("renders main heading and badge", () => {
    renderWithProviders(<ArchitectureInfographic />);

    expect(screen.getByText(/ARQUITECTURA DE ALTO RENDIMIENTO/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Ingeniería de Cero Bloat en Rust/i })).toBeInTheDocument();
  });

  it("renders 3 core architecture cards with their features", () => {
    renderWithProviders(<ArchitectureInfographic />);

    expect(screen.getByRole("heading", { level: 3, name: /Motor Nativo Tauri 2\.0/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: /Sincronización Delta SHA-256/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: /Bóveda PKCE & Cero Passwords/i })).toBeInTheDocument();

    expect(screen.getByText(/RAM en reposo:/i)).toBeInTheDocument();
    expect(screen.getByText(/< 38\.4 MB/i)).toBeInTheDocument();
    expect(screen.getByText(/Ahorro de ancho de banda:/i)).toBeInTheDocument();
    expect(screen.getByText(/95\.4%/i)).toBeInTheDocument();
  });
});
