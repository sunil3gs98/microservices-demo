import * as dotenv from 'dotenv';
import chalk from 'chalk';
import { BranchSearchEngine } from './search-engine';
import { SearchReporter } from './reporter';

// Load environment variables
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER || 'sunil3gs98';
const REPO_NAME = process.env.REPO_NAME || 'microservices-demo';
const FILE_NAME = process.env.FILE_NAME || 'README.md';
const SEARCH_TEXT = process.env.SEARCH_TEXT || 'microservices';
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_REQUESTS || '10');

async function main() {
  console.clear();
  console.log(chalk.bold.cyan('\n🚀 GitHub Branch File Search Engine'));
  console.log(chalk.gray('High-performance search across 2500+ branches\n'));

  console.log(chalk.bold('Configuration:'));
  console.log(`  Repository:    ${chalk.yellow(`${REPO_OWNER}/${REPO_NAME}`)}`);
  console.log(`  File to Search: ${chalk.yellow(FILE_NAME)}`);
  console.log(`  Search Text:   ${chalk.yellow(SEARCH_TEXT)}`);
  console.log(`  Max Concurrent: ${chalk.yellow(MAX_CONCURRENT)}`);
  console.log(`  Cache Enabled:  ${chalk.yellow(process.env.CACHE_ENABLED !== 'false' ? 'Yes' : 'No')}\n`);

  if (!GITHUB_TOKEN) {
    console.log(
      chalk.yellow(
        '⚠️  Warning: GITHUB_TOKEN not set. Using unauthenticated requests (lower rate limits).'
      )
    );
    console.log(chalk.gray('   Set GITHUB_TOKEN for higher rate limits.\n'));
  }

  try {
    const engine = new BranchSearchEngine(
      {
        owner: REPO_OWNER,
        repo: REPO_NAME,
        fileName: FILE_NAME,
        searchText: SEARCH_TEXT,
        maxConcurrent: MAX_CONCURRENT,
        enableCache: process.env.CACHE_ENABLED !== 'false',
      },
      GITHUB_TOKEN
    );

    const results = await engine.search();
    SearchReporter.printResults(results);
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error);
    process.exit(1);
  }
}

main();
