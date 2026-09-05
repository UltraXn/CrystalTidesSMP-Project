import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminMobileNavbar from "@/components/Admin/AdminMobileNavbar";
import { renderWithProviders } from "@/utils/test-utils";

describe("Admin/AdminMobileNavbar", () => {
  const mockSetActiveTab = vi.fn();
  const mockSetSidebarOpen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all navigation items and menu toggle button", () => {
    renderWithProviders(
      <AdminMobileNavbar
        activeTab="overview"
        setActiveTab={mockSetActiveTab}
        sidebarOpen={false}
        setSidebarOpen={mockSetSidebarOpen}
      />
    );

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Inicio" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "StaffHub" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Config" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir menú lateral" })).toBeInTheDocument();
  });

  it("marks active tab with aria-current='page' and active class", () => {
    renderWithProviders(
      <AdminMobileNavbar
        activeTab="staff_hub"
        setActiveTab={mockSetActiveTab}
        sidebarOpen={false}
        setSidebarOpen={mockSetSidebarOpen}
      />
    );

    const activeBtn = screen.getByRole("button", { name: "StaffHub" });
    expect(activeBtn).toHaveAttribute("aria-current", "page");
    expect(activeBtn).toHaveClass("active");

    const inactiveBtn = screen.getByRole("button", { name: "Inicio" });
    expect(inactiveBtn).not.toHaveAttribute("aria-current");
    expect(inactiveBtn).not.toHaveClass("active");
  });

  it("switches active tab and closes sidebar on click", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AdminMobileNavbar
        activeTab="overview"
        setActiveTab={mockSetActiveTab}
        sidebarOpen={true}
        setSidebarOpen={mockSetSidebarOpen}
      />
    );

    const settingsBtn = screen.getByRole("button", { name: "Config" });
    await user.click(settingsBtn);

    expect(mockSetActiveTab).toHaveBeenCalledWith("settings");
    expect(mockSetSidebarOpen).toHaveBeenCalledWith(false);
  });

  it("toggles sidebar when menu toggle button is clicked", async () => {
    const user = userEvent.setup();
    const { rerender } = renderWithProviders(
      <AdminMobileNavbar
        activeTab="overview"
        setActiveTab={mockSetActiveTab}
        sidebarOpen={false}
        setSidebarOpen={mockSetSidebarOpen}
      />
    );

    const toggleOpenBtn = screen.getByRole("button", { name: "Abrir menú lateral" });
    expect(toggleOpenBtn).toHaveAttribute("aria-expanded", "false");
    await user.click(toggleOpenBtn);
    expect(mockSetSidebarOpen).toHaveBeenCalledWith(true);

    rerender(
      <AdminMobileNavbar
        activeTab="overview"
        setActiveTab={mockSetActiveTab}
        sidebarOpen={true}
        setSidebarOpen={mockSetSidebarOpen}
      />
    );

    const toggleCloseBtn = screen.getByRole("button", { name: "Cerrar menú lateral" });
    expect(toggleCloseBtn).toHaveAttribute("aria-expanded", "true");
    await user.click(toggleCloseBtn);
    expect(mockSetSidebarOpen).toHaveBeenCalledWith(false);
  });
});
