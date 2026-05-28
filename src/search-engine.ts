import { FileCache } from './cache';
import { GitHubAPI } from './github-api';
import { BranchSearchResult, SearchOptions, SearchResults } from './types';
import PQueue from 'pqueue';
import * as cliProgress from 'cli-progress';

export class BranchSearchEngine {
  private api: GitHubAPI;
  private cache: FileCache;
  private options: SearchOptions;
  private progressBar: cliProgress.SingleBar;

  constructor(options: SearchOptions, token?: string) {
    this.api = new GitHubAPI(token);
    this.cache = new FileCache(options.cacheTTL || 24);
    this.options = {
      maxConcurrent: 10,
      enableCache: true,
      ...options,
    };
    this.progressBar = new cliProgress.SingleBar({
      format: '{bar} | {percentage}% || {value}/{total} branches',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    });
  }

  async search(): Promise<SearchResults> {
    const startTime = Date.now();

    try {
      // Step 1: Get all branches
      console.log('📋 Fetching all branches...');
      const branches = await this.api.getAllBranches(
        this.options.owner,
        this.options.repo
      );
      console.log(`✅ Found ${branches.length} branches\n`);

      // Step 2: Create queue for parallel processing
      const queue = new PQueue({
        concurrency: this.options.maxConcurrent,
      });

      // Step 3: Search all branches in parallel
      console.log(
        `🔍 Searching across ${branches.length} branches (max ${this.options.maxConcurrent} concurrent)...\n`
      );
      this.progressBar.start(branches.length, 0);

      const results: BranchSearchResult[] = [];
      let completed = 0;

      const searchPromises = branches.map((branch) =>
        queue.add(async () => {
          try {
            const result = await this.searchBranch(branch);
            results.push(result);
          } catch (error) {
            results.push({
              branch,
              found: false,
              matches: 0,
              lineNumbers: [],
              error: String(error),
            });
          }
          completed++;
          this.progressBar.update(completed);
        })
      );

      await Promise.all(searchPromises);
      this.progressBar.stop();

      // Step 4: Compile results
      const matchingBranches = results.filter((r) => r.found);
      const executionTime = Date.now() - startTime;

      return {
        totalBranches: branches.length,
        successfulSearches: results.filter((r) => !r.error).length,
        failedSearches: results.filter((r) => r.error).length,
        matchingBranches,
        executionTime,
      };
    } catch (error) {
      this.progressBar.stop();
      throw error;
    }
  }

  private async searchBranch(branch: string): Promise<BranchSearchResult> {
    const cacheKey = `${this.options.owner}/${this.options.repo}/${branch}/${this.options.fileName}`;

    try {
      let content: string | null = null;

      // Try cache first
      if (this.options.enableCache) {
        const cached = this.cache.get(cacheKey);
        if (cached) {
          content = cached.content;
        }
      }

      // Fetch from API if not cached
      if (!content) {
        content = await this.api.getFileContent(
          this.options.owner,
          this.options.repo,
          branch,
          this.options.fileName
        );

        if (content && this.options.enableCache) {
          this.cache.set(cacheKey, {
            content,
            timestamp: 0,
            branch,
            fileName: this.options.fileName,
          });
        }
      }

      // If file not found
      if (!content) {
        return {
          branch,
          found: false,
          matches: 0,
          lineNumbers: [],
        };
      }

      // Search for text
      const { matches, lineNumbers } = this.findMatches(
        content,
        this.options.searchText
      );

      return {
        branch,
        found: matches > 0,
        matches,
        lineNumbers,
        content: matches > 0 ? content : undefined,
      };
    } catch (error: any) {
      return {
        branch,
        found: false,
        matches: 0,
        lineNumbers: [],
        error: error.message,
      };
    }
  }

  private findMatches(content: string, searchText: string): { matches: number; lineNumbers: number[] } {
    const lines = content.split('\n');
    const lineNumbers: number[] = [];
    let matches = 0;

    lines.forEach((line, index) => {
      const count = (line.match(new RegExp(searchText, 'g')) || []).length;
      if (count > 0) {
        matches += count;
        lineNumbers.push(index + 1);
      }
    });

    return { matches, lineNumbers };
  }
}
