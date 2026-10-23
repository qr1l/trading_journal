export interface ChecklistItem {
  id: string;
  text: string;
}

export interface System {
  id: string;
  name: string;
  description: string;
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SystemInput {
  name: string;
  description: string;
  checklist: Array<{ id?: string; text: string }>;
}

export type TradeDirection = 'long' | 'short';

export type TradeStatus = 'open' | 'closed';

export interface ChecklistSnapshotItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Trade {
  id: string;
  systemId: string;
  systemName: string;
  checklistSnapshot: ChecklistSnapshotItem[];
  checkedCount: number;
  totalCount: number;
  ruleViolation: boolean;
  limitExceeded: boolean;
  direction: TradeDirection;
  riskUsd: number;
  status: TradeStatus;
  openedAt: string;
  closedAt: string | null;
  resultUsd: number | null;
  resultR: number | null;
  note: string;
}

export interface Settings {
  /** Максимум сделок в день, null — без лимита. */
  dailyTradeLimit: number | null;
}
