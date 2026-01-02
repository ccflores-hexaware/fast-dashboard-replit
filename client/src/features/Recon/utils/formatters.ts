export function formatFieldValue(value: any): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  return String(value);
}

export function formatStatus(status: string | null): string {
  if (!status) return '-';
  return status;
}
