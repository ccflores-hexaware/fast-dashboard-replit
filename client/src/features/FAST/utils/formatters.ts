import { COLUMN_HEADERS } from '../constants/columns';
import type { FASTColumnKey } from '../types/column.types';

export const getFieldLabel = (key: string): string => {
  return COLUMN_HEADERS[key as FASTColumnKey] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
};

export const formatValue = (value: any): string => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }
  return String(value);
};

export const isDateField = (key: string): boolean => {
  const dateFields = [
    'lastConnectorDeliveryDate',
    'maintenanceSLAExpiration',
    'miLastAIRUpload',
    'miDueDate',
    'miOnboardingChangeDate',
    'attestationKickedOff',
    'attestationComplete',
    'aiLastCandAAttestation',
    'keychainAttestationKickoffDate',
    'aiAttestationDueDate',
    'aiOnboardingChangeDate',
    'lastModifiedDate',
  ];
  return dateFields.includes(key);
};

export const validateDateFormat = (value: string): boolean => {
  if (!value || value.trim() === '') return true;
  const dateRegex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}(\s+\d{1,2}:\d{2})?$/i;
  return dateRegex.test(value.trim());
};
