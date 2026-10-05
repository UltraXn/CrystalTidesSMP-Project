import { useState, useEffect } from 'react';
import { useAuditLogs } from '../../../hooks/useAdminData';
import { AuditLogProps, LogEntry } from './types';

export interface UseAuditLogStateReturn {
  filterSource: string;
  handleFilterChange: (source: string) => void;
  page: number;
  setPage: (page: number | ((prev: number) => number)) => void;
  search: string;
  setSearch: (search: string) => void;
  loading: boolean;
  logs: LogEntry[];
  totalCount: number;
  totalPages: number;
}

/**
 * Feature hook for managing Audit Log state, debounce filters, and data fetching.
 * Complies with AGENTS.md rule 1.6 (State and Logic Governance).
 */
export function useAuditLogState({
  mockLogs,
  mockTotal,
}: AuditLogProps = {}): UseAuditLogStateReturn {
  const [filterSource, setFilterSource] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // TanStack Query Hook
  const { data: fetchLogsData, isLoading: loading } = useAuditLogs(
    page,
    limit,
    searchTerm,
    filterSource,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const logs = mockLogs || fetchLogsData?.data || [];
  const totalCount = mockTotal !== undefined ? mockTotal : fetchLogsData?.total || 0;
  const totalPages = Math.ceil(totalCount / limit) || 1;

  const handleFilterChange = (source: string) => {
    setFilterSource(source);
    setPage(1);
  };

  return {
    filterSource,
    handleFilterChange,
    page,
    setPage,
    search,
    setSearch,
    loading,
    logs,
    totalCount,
    totalPages,
  };
}
