#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import { Config, RepoResult } from './types.js';
import { readRepoFile, ensureDir, writeJson } from './utils/fs.js';
import { buildRunFilePath } from './utils/path.js';
import { AmpExecutor } from './exec/AmpExecutor.js';
import { RepoProcessor } from './processors/RepoProcessor.js';
import { runWithPool } from './concurrency/Pool.js';

async function parseArgs(): Promise<Config> {
  const argv = await yargs(hideBin(process.argv))
    .option('input', {
      alias: 'i',
      type: 'string',
      default: 'input/repos.txt',
      describe: 'Path to input file containing repo slugs'
    })
    .option('concurrency', {
      alias: 'c',
      type: 'number',
      default: 10,
      describe: 'Number of concurrent amp sessions'
    })
    .option('prompt', {
      alias: 'p',
      type: 'string',
      default: 'prompts/authentication_analysis.md',
      describe: 'Path to authentication analysis prompt file'
    })
    .option('output-dir', {
      alias: 'o',
      type: 'string',
      default: 'runs',
      describe: 'Output directory for results'
    })
    .help()
    .argv;

  return {
    inputPath: argv.input,
    concurrency: argv.concurrency,
    promptPath: argv.prompt,
    outputDir: argv['output-dir']
  };
}

async function main(): Promise<void> {
  try {
    const config = await parseArgs();
    
    console.log('🚀 Starting repo authentication analysis...');
    console.log(`📁 Input: ${config.inputPath}`);
    console.log(`⚡ Concurrency: ${config.concurrency}`);
    console.log(`📝 Prompt: ${config.promptPath}`);
    console.log(`📤 Output: ${config.outputDir}`);
    
    // Read repo list
    const repos = readRepoFile(config.inputPath);
    console.log(`🔍 Found ${repos.length} repositories to analyze`);
    
    // Ensure output directory exists
    await ensureDir(config.outputDir);
    
    // Create amp executor
    const ampExecutor = new AmpExecutor(config.promptPath);
    
    // Process repos with concurrency pool
    console.log(`⏳ Processing repositories...`);
    const results = await runWithPool(
      repos,
      async (repo) => {
        const processor = new RepoProcessor(repo, ampExecutor);
        return processor.process();
      },
      { concurrency: config.concurrency }
    );
    
    // Write aggregated results
    const outputPath = buildRunFilePath(config.outputDir);
    await writeJson(outputPath, results);
    
    // Print summary
    const successful = results.filter(r => r.status === 'SUCCESS').length;
    const failed = results.filter(r => r.status === 'ERROR').length;
    
    console.log(`✅ Analysis complete!`);
    console.log(`📊 Results: ${successful} successful, ${failed} failed`);
    console.log(`📄 Output file: ${outputPath}`);
    
    if (failed > 0) {
      console.log(`❌ Failed repositories:`);
      results
        .filter(r => r.status === 'ERROR')
        .forEach(r => console.log(`   - ${r.slug}: ${r.error}`));
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main().catch(console.error);
