import { execa } from 'execa';
import fs from 'fs-extra';
import { AuthAnalysisResult } from '../types.js';

export class AmpExecutor {
  constructor(private promptPath: string) {}

  async run(repoSlug: string): Promise<AuthAnalysisResult> {
    const command = '/opt/homebrew/bin/amp';
    const args = [
      '-x',
      '--dangerously-allow-all'
    ];

    // Read the prompt file and inject repo slug
    const promptContent = await fs.readFile(this.promptPath, 'utf8');
    const promptWithRepo = `${promptContent}\n\nAnalyze repository: ${repoSlug}`;

    const { stdout, stderr, exitCode } = await execa(command, args, {
      input: promptWithRepo,
      reject: false,
      timeout: 300000, // 300 second timeout for complex analysis
      encoding: 'utf8'
    });

    if (exitCode !== 0) {
      throw new Error(`amp command failed (exit code ${exitCode}): ${stderr}`);
    }

    try {
      // Extract JSON from various formats
      let jsonText = stdout.trim();
      
      // Try markdown code blocks first
      const codeBlockMatch = jsonText.match(/```(?:json)?\s*\n?(.*?)\n?```/s);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1];
      } else {
        // Try to extract JSON object from mixed text
        const jsonObjectMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
          jsonText = jsonObjectMatch[0];
        }
      }
      
      const result = JSON.parse(jsonText) as AuthAnalysisResult;
      return result;
    } catch (parseError) {
      throw new Error(`Failed to parse JSON output: ${parseError}. Raw output: ${stdout}`);
    }
  }
}
