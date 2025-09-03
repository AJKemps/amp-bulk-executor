export interface RepoSpec {
  slug: string;
}

export interface AuthAnalysisResult {
  repo_name: string;
  commit_hash: string;
  auth_type: 'auth' | 'no_auth' | 'mixed' | 'uncertain';
  reasons: string;
  auth_locations: string[];
  no_auth_locations?: string[];
  evidence_samples: string[];
}

export interface RepoResult {
  slug: string;
  timestamp: string;
  status: 'SUCCESS' | 'ERROR';
  data?: AuthAnalysisResult;
  error?: string;
}

export interface PoolOptions {
  concurrency: number;
}

export interface Config {
  inputPath: string;
  concurrency: number;
  promptPath: string;
  outputDir: string;
}
