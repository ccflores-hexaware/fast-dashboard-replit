import { format } from 'date-fns';

export function formatHistoryDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (date.getFullYear() === 9999) return 'Present';
  return format(date, 'MMM d, yyyy HH:mm');
}

export function isCurrentRecord(endDate: string): boolean {
  return new Date(endDate).getFullYear() === 9999;
}

export function formatDisplayValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string' && value.trim() === '') return '—';
  return String(value);
}
