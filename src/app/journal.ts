import { useContext } from 'react';
import { JournalContext, type JournalValue } from './journalContext';

export function useJournal(): JournalValue {
  const value = useContext(JournalContext);
  if (!value) {
    throw new Error('useJournal должен вызываться внутри JournalProvider');
  }
  return value;
}
