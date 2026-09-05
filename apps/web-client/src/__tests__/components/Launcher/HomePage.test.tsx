import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomePage } from "@/components/Launcher/HomePage";
import { renderWithProviders } from "@/utils/test-utils";

// Mock subcomponents
vi.mock("@/components/Launcher/ProfileSelector", () => ({
  ProfileSelector: ({
    onEditProfile,
    onCreateProfile,
  }: {
    onEditProfile: (p: unknown) => void;
    onCreateProfile: () => void;
  }) => (
    <div data-testid="mock-profile-selector">
      <button onClick={() => onEditProfile({ id: "p1", name: "Custom 1" })}>
        Edit Profile Mock
      </button>
      <button onClick={onCreateProfile}>Create Profile Mock</button>
    </div>
  ),
}));

vi.mock("@/components/Launcher/ProfileEditorDialog", () => ({
  ProfileEditorDialog: ({
    onClose,
    onSave,
  }: {
    onClose: () => void;
    onSave: () => void;
  }) => (
    <div data-testid="mock-profile-editor">
      <button onClick={onClose}>Close Editor</button>
      <button onClick={onSave}>Save Editor</button>
    </div>
  ),
}));

vi.mock("@/components/Launcher/SkinViewer", () => ({
  SkinViewer: () => <div data-testid="mock-skin-viewer">SkinViewer Mock</div>,
}));

// Mock mockLauncherState
const mockFetchServerStatus = vi.fn();
const mockFetchNews = vi.fn();
const mockGetActiveProfile = vi.fn();
const mockGetSettings = vi.fn();
const mockLaunchGame = vi.fn();
let mockCurrentSession: Record<string, unknown> | null = null;
let mockCrystalSession: Record<string, unknown> | null = null;

vi.mock("@/components/Launcher/mockLauncherState", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useAuth: () => ({
      currentSession: mockCurrentSession,
      crystalSession: mockCrystalSession,
    }),
    fetchServerStatus: () => mockFetchServerStatus(),
    fetchNews: () => mockFetchNews(),
    getActiveProfile: () => mockGetActiveProfile(),
    getSettings: () => mockGetSettings(),
    launchGame: (...args: unknown[]) => mockLaunchGame(...args),
    resolveProfileGameDir: () => "C:\\mock\\gameDir",
  };
});

const MOCK_NEWS = [
  {
    id: "news-1",
    title: "Nueva Temporada 4 Disponible",
    content: "Descubre la dimensión submarina y nuevos cristales inestables.",
    category: "Anuncio",
    createdAt: new Date().toISOString(),
  },
  {
    id: "news-2",
    title: "Torneo de Clanes",
    content: "Participa por 10,000 KilluCoins este fin de semana.",
    category: "Evento",
    createdAt: new Date().toISOString(),
  },
];

describe("Launcher/HomePage Component", () => {
  const mockWriteText = vi.fn().mockResolvedValue(undefined);
  const mockOnNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentSession = {
      username: "NachoPlayer",
      uuid: "1111-2222",
      type: "crystal",
    };
    mockCrystalSession = {
      username: "NachoPlayer",
      role: "captain",
    };
    mockFetchServerStatus.mockResolvedValue({
      online: true,
      playersOnline: 85,
      playersMax: 200,
    });
    mockFetchNews.mockResolvedValue(MOCK_NEWS);
    mockGetActiveProfile.mockReturnValue({
      id: "default",
      name: "Default Fabric",
      mcVersion: "1.21.3",
      loaderType: "fabric",
      loaderVersion: "0.16.1",
      minRam: 2048,
      maxRam: 4096,
      useOptimization: true,
    });
    mockGetSettings.mockReturnValue({
      minRam: 2048,
      maxRam: 4096,
    });

    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });
  });

  it("renders greetings, server status, and online player count", async () => {
    renderWithProviders(<HomePage onNavigate={mockOnNavigate} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "NachoPlayer" }),
    ).toBeInTheDocument();

    expect(await screen.findByText(/85\/200/i)).toBeInTheDocument();
    expect(screen.getByText("mc.crystaltidesSMP.net")).toBeInTheDocument();
  });

  it("copies server IP to clipboard on click", async () => {
    const { fireEvent } = await import("@testing-library/react");
    renderWithProviders(<HomePage onNavigate={mockOnNavigate} />);

    const copyBtn = screen.getByRole("button", {
      name: "Copiar IP del servidor",
    });
    fireEvent.click(copyBtn);

    expect(mockWriteText).toHaveBeenCalledWith("mc.crystaltidesSMP.net");
    await waitFor(() => {
      expect(screen.getByText("¡IP copiada!")).toBeInTheDocument();
    });
  });

  it("renders news carousel and advances to next post on arrow click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage onNavigate={mockOnNavigate} />);

    await waitFor(() => {
      expect(
        screen.getByText("Nueva Temporada 4 Disponible"),
      ).toBeInTheDocument();
    });

    const nextBtn = screen.getByLabelText("Noticia siguiente");
    await user.click(nextBtn);

    expect(screen.getByText("Torneo de Clanes")).toBeInTheDocument();
  });

  it("navigates to news page when Leer noticia completa is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage onNavigate={mockOnNavigate} />);

    await waitFor(() => {
      expect(
        screen.getByText("Nueva Temporada 4 Disponible"),
      ).toBeInTheDocument();
    });

    const readBtn = screen.getByRole("button", {
      name: /Leer noticia completa/i,
    });
    await user.click(readBtn);

    expect(mockOnNavigate).toHaveBeenCalledWith("news");
  });

  it("renders ProfileSelector and launches game button in dock", () => {
    renderWithProviders(<HomePage onNavigate={mockOnNavigate} />);

    expect(screen.getByTestId("mock-profile-selector")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar juego" })).toBeInTheDocument();
    expect(screen.getByText("Jugar")).toBeInTheDocument();
  });

  it("opens and closes ProfileEditorDialog via ProfileSelector triggers", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage onNavigate={mockOnNavigate} />);

    // Trigger edit profile
    await user.click(screen.getByText("Edit Profile Mock"));
    expect(screen.getByTestId("mock-profile-editor")).toBeInTheDocument();

    // Close editor
    await user.click(screen.getByText("Close Editor"));
    expect(screen.queryByTestId("mock-profile-editor")).not.toBeInTheDocument();

    // Trigger create profile
    await user.click(screen.getByText("Create Profile Mock"));
    expect(screen.getByTestId("mock-profile-editor")).toBeInTheDocument();
  });
});
