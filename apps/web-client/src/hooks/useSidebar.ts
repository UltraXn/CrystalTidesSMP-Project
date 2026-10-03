import { useContext } from 'react';
import { SidebarContext } from '../context/SidebarContext';

const SIDEBAR_CONTEXT_ERRORS = {
    PROVIDER_REQUIRED: 'useSidebar must be used within a SidebarProvider',
} as const;

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error(SIDEBAR_CONTEXT_ERRORS.PROVIDER_REQUIRED);
    }
    return context;
};