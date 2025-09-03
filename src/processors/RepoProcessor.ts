import { RepoSpec, RepoResult } from '../types.js';
import { AmpExecutor } from '../exec/AmpExecutor.js';

export class RepoProcessor {
  constructor(
    private spec: RepoSpec,
    private ampExecutor: AmpExecutor
  ) {}

  async process(): Promise<RepoResult> {
    const timestamp = new Date().toISOString();
    
    try {
      const data = await this.ampExecutor.run(this.spec.slug);
      
      return {
        slug: this.spec.slug,
        timestamp,
        status: 'SUCCESS',
        data
      };
    } catch (error) {
      return {
        slug: this.spec.slug,
        timestamp,
        status: 'ERROR',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
