export interface FieldChange {
  oldValue: string | number | null;
  newValue: string | number | null;
  changedBy: string;
  changedAt: string;
}

export interface AssetFieldHistory {
  [fieldKey: string]: FieldChange[];
}

export interface FieldVersionHistory {
  [assetId: string]: AssetFieldHistory;
}

const users = ['John Doe', 'Sarah Jenkins', 'Mike Ross', 'Jessica Pearson', 'Harvey Specter', 'Donna Paulsen', 'Rachel Zane', 'Alex Williams'];

const generateRandomDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 12) + 8);
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString();
};

const generateFieldHistory = (currentValue: any, fieldType: 'status' | 'assignee' | 'disposition' | 'date' | 'text' | 'number'): FieldChange[] => {
  const historyLength = Math.floor(Math.random() * 4) + 1;
  const changes: FieldChange[] = [];
  
  const statusValues = ['Pending', 'In Progress', 'Onboarded', 'Not Started', 'Blocked'];
  const assigneeValues = ['Sarah Jenkins', 'Mike Ross', 'Jessica Pearson', 'Harvey Specter', 'Donna Paulsen'];
  const dispositionValues = ['Pending Review', 'Approved', 'Rejected', 'N/A', 'Waived'];
  
  let previousValue = currentValue;
  
  for (let i = 0; i < historyLength; i++) {
    let oldValue: any;
    
    switch (fieldType) {
      case 'status':
        oldValue = statusValues[Math.floor(Math.random() * statusValues.length)];
        break;
      case 'assignee':
        oldValue = assigneeValues[Math.floor(Math.random() * assigneeValues.length)];
        break;
      case 'disposition':
        oldValue = dispositionValues[Math.floor(Math.random() * dispositionValues.length)];
        break;
      case 'number':
        oldValue = Math.floor(Math.random() * 20);
        break;
      case 'date':
        oldValue = generateRandomDate(Math.floor(Math.random() * 365) + 30);
        break;
      default:
        oldValue = `Previous Value ${i + 1}`;
    }
    
    changes.push({
      oldValue,
      newValue: previousValue,
      changedBy: users[Math.floor(Math.random() * users.length)],
      changedAt: generateRandomDate((i + 1) * 7 + Math.floor(Math.random() * 7))
    });
    
    previousValue = oldValue;
  }
  
  return changes;
};

export const generateMockFieldHistory = (assets: any[]): FieldVersionHistory => {
  const history: FieldVersionHistory = {};
  
  const fieldsWithHistory = [
    { key: 'onboardingStatus', type: 'status' as const },
    { key: 'kalmAssignee', type: 'assignee' as const },
    { key: 'onboardingDisposition', type: 'disposition' as const },
    { key: 'airDisposition', type: 'disposition' as const },
    { key: 'maintenanceDisposition', type: 'disposition' as const },
    { key: 'cmdbStatus', type: 'status' as const },
    { key: 'connectorStatus', type: 'status' as const },
    { key: 'enrollmentStatus', type: 'status' as const },
    { key: 'evidenceStatus', type: 'status' as const },
    { key: 'miStatus', type: 'status' as const },
    { key: 'aiStatus', type: 'status' as const },
    { key: 'ticketsOpened', type: 'number' as const },
    { key: 'technology', type: 'text' as const },
    { key: 'assetType', type: 'text' as const },
    { key: 'automationTeam', type: 'text' as const },
    { key: 'miL2Assignee', type: 'assignee' as const },
    { key: 'aiL2Assignee', type: 'assignee' as const },
  ];
  
  assets.slice(0, 50).forEach(asset => {
    history[asset.id] = {};
    
    fieldsWithHistory.forEach(field => {
      if (asset[field.key] !== undefined && Math.random() > 0.4) {
        history[asset.id][field.key] = generateFieldHistory(asset[field.key], field.type);
      }
    });
  });
  
  return history;
};

export const formatHistoryDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};
