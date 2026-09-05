import React, { ReactNode } from "react";
import { render, renderHook, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, MemoryRouterProps } from "react-router-dom";
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

export function renderWithProviders(
  ui: React.ReactElement,
  options?: ExtendedRenderOptions,
) {
  const testQueryClient = createTestQueryClient();
  const authValue: AuthContextType = {
    ...defaultMockAuth,
    ...(options?.auth || {}),
  };

  const { auth: _auth, initialEntries, ...renderOptions } = options || {};

  return render(
    <QueryClientProvider client={testQueryClient}>
      <AuthContext.Provider value={authValue}>
        <SidebarProvider>
          <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
        </SidebarProvider>
      </AuthContext.Provider>
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
  const authValue: AuthContextType = {
    ...defaultMockAuth,
    ...(options?.auth || {}),
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      <AuthContext.Provider value={authValue}>
        <SidebarProvider>
          <MemoryRouter initialEntries={options?.initialEntries}>
            {children}
          </MemoryRouter>
        </SidebarProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
  return renderHook(renderCallback, { wrapper });
}
