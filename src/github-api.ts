import { Octokit } from '@octokit/rest';

interface BranchInfo {
  name: string;
  commit: {
    sha: string;
  };
}

export class GitHubAPI {
  private octokit: Octokit;

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  async getAllBranches(owner: string, repo: string): Promise<string[]> {
    try {
      const branches: string[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await this.octokit.repos.listBranches({
          owner,
          repo,
          per_page: 100,
          page,
        });

        const branchNames = response.data.map((b: BranchInfo) => b.name);
        branches.push(...branchNames);

        hasMore = response.data.length === 100;
        page++;
      }

      return branches;
    } catch (error) {
      throw new Error(`Failed to fetch branches: ${error}`);
    }
  }

  async getFileContent(
    owner: string,
    repo: string,
    branch: string,
    filePath: string
  ): Promise<string | null> {
    try {
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: branch,
      });

      if (Array.isArray(response.data)) {
        return null;
      }

      if ('content' in response.data) {
        return Buffer.from(response.data.content, 'base64').toString('utf-8');
      }

      return null;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }
}
