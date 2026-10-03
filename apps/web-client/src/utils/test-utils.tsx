import React, { ReactNode } from "react";
import { render, renderHook, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, type MemoryRouterProps } from "react-router-dom";
import { vi } from "vitest";
import { AuthContext, AuthContextType } from "../context/AuthContext";
import { SidebarProvider } from "../context/SidebarContext";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

export const defaultMockAuth: AuthContextType = {
  user: null,
  loading: false,
  login: vi.fn(),
  loginWithProvider: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  updateUser: vi.fn(),
};

interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  auth?: Partial<AuthContextType>;
  initialEntries?: MemoryRouterProps["initialEntries"];
}

function MockAuthProvider({ auth, children }: { auth?: Partial<AuthContextType>; children: ReactNode }) {
  const authValue = React.useMemo<AuthContextType>(
    () => ({
      ...defaultMockAuth,
      ...auth,
    }),
    [auth],
  );
  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: ExtendedRenderOptions,
) {
  const testQueryClient = createTestQueryClient();
  const initialEntries = options?.initialEntries;
  const renderOptions = options ? { ...options } : undefined;
  if (renderOptions) {
    delete renderOptions.auth;
    delete renderOptions.initialEntries;
  }

  return render(
    <QueryClientProvider client={testQueryClient}>
      <MockAuthProvider auth={options?.auth}>
        <SidebarProvider>
          <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
        </SidebarProvider>
      </MockAuthProvider>
    </QueryClientProvider>,
    renderOptions,
  );
}

export function renderHookWithProviders<Result, Props>(
  renderCallback: (props: Props) => Result,
  options?: {
    auth?: Partial<AuthContextType>;
    initialEntries?: MemoryRouterProps["initialEntries"];
  },
) {
  const testQueryClient = createTestQueryClient();

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      <MockAuthProvider auth={options?.auth}>
        <SidebarProvider>
          <MemoryRouter initialEntries={options?.initialEntries}>
            {children}
          </MemoryRouter>
        </SidebarProvider>
      </MockAuthProvider>
    </QueryClientProvider>
  );
  return renderHook(renderCallback, { wrapper });
}
