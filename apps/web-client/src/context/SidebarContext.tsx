/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useMemo, useCallback, type ReactNode } from 'react';

export interface SidebarContextType {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
}

export const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

    const value = useMemo(() => ({ sidebarOpen, setSidebarOpen, toggleSidebar }), [sidebarOpen, toggleSidebar]);

    return (
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    );
};
