export interface SearchOptions {
  owner: string;
  repo: string;
  fileName: string;
  searchText: string;
  maxConcurrent?: number;
  enableCache?: boolean;
  cacheTTL?: number;
}

export interface BranchSearchResult {
  branch: string;
  found: boolean;
  matches: number;
  lineNumbers: number[];
  content?: string;
  error?: string;
}

export interface SearchResults {
  totalBranches: number;
  successfulSearches: number;
  failedSearches: number;
  matchingBranches: BranchSearchResult[];
  executionTime: number;
}

export interface CacheEntry {
  content: string;
  timestamp: number;
  branch: string;
  fileName: string;
}
