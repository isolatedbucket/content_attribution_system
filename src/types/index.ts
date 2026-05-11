export interface LedgerEntry {
  id: string;
  filename: string;
  filetype: 'text' | 'image';
  fingerprint: string;
  ngramHashes?: string[];
  timestamp: string;
}

export interface Match {
  entry: LedgerEntry;
  similarity: number;
}

export interface ProcessResult {
  fingerprint: string;
  filetype: 'text' | 'image';
  ngramHashes?: string[];
}
