import chalk from 'chalk';
import { SearchResults } from './types';

export class SearchReporter {
  static printResults(results: SearchResults): void {
    console.log('\n' + '='.repeat(80));
    console.log(chalk.bold.cyan('📊 SEARCH RESULTS'));
    console.log('='.repeat(80) + '\n');

    // Summary
    console.log(chalk.bold('📈 Summary:'));
    console.log(`  Total Branches:       ${chalk.blue(results.totalBranches)}`);
    console.log(`  Successful Searches:  ${chalk.green(results.successfulSearches)}`);
    console.log(`  Failed Searches:      ${chalk.red(results.failedSearches)}`);
    console.log(`  Matching Branches:    ${chalk.yellow(results.matchingBranches.length)}`);
    console.log(`  Execution Time:       ${chalk.magenta(this.formatTime(results.executionTime))}\n`);

    // Matching branches
    if (results.matchingBranches.length > 0) {
      console.log(chalk.bold.green('✅ Branches with Matches:'));
      results.matchingBranches.forEach((result) => {
        console.log(`\n  ${chalk.cyan('Branch:')} ${chalk.bold(result.branch)}`);
        console.log(`  ${chalk.cyan('Matches:')} ${chalk.yellow(result.matches)}`);
        console.log(`  ${chalk.cyan('Line Numbers:')} ${chalk.blue(result.lineNumbers.join(', '))}`);
      });
    } else {
      console.log(chalk.yellow('⚠️  No matches found in any branch'));
    }

    // Performance metrics
    console.log('\n' + '='.repeat(80));
    console.log(chalk.bold.cyan('⚡ Performance Metrics:'));
    const branchesPerSecond = (
      (results.successfulSearches / (results.executionTime / 1000)).toFixed(2)
    );
    console.log(`  Branches/Second:      ${chalk.green(branchesPerSecond)}`);
    console.log('='.repeat(80) + '\n');
  }

  private static formatTime(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    }
    const seconds = (milliseconds / 1000).toFixed(2);
    return `${seconds}s`;
  }
}
