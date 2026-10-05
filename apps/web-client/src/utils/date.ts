/**
 * Date and time formatting utilities with explicit locale and UTC timezone
 * to prevent SSR hydration mismatches and ensure deterministic rendering.
 */

export const formatDate = (
  date: string | number | Date,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const d = typeof date === 'object' && date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('es-ES', {
    timeZone: 'UTC',
    ...options,
  });
};

export const formatTime = (
  date: string | number | Date,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const d = typeof date === 'object' && date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString('es-ES', {
    timeZone: 'UTC',
    ...options,
  });
};
