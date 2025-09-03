# Amp Bulk Executor

A TypeScript tool for running Amp AI threads across multiple repositories in parallel and extracting structured repository data in JSON format.

## Setup

```bash
npm install
```

## Usage

1. Add repository slugs to `input/repos.txt` (one per line):
   ```
   facebook/react
   vercel/next.js
   microsoft/vscode
   ```

2. Run the executor:
   ```bash
   npm start
   ```

   Or with custom options:
   ```bash
   npm start -- -i input/repos.txt -c 10 -o runs
   ```

## Options

- `-i, --input`: Input file with repo slugs (default: `input/repos.txt`)
- `-c, --concurrency`: Number of concurrent sessions (default: `10`)
- `-p, --prompt`: Path to prompt file (default: `prompts/authentication_analysis.md`)
- `-o, --output-dir`: Output directory (default: `runs`)

## Output

Results are saved to `runs/run_<timestamp>.json` containing an array of execution results. The structure of the `data` field is defined by your prompt:

```json
[
  {
    "slug": "facebook/react",
    "timestamp": "2025-09-03T03:07:02.160Z",
    "status": "SUCCESS",
    "data": {
      "repo_name": "github.com/facebook/react",
      "commit_hash": "6a58b80",
      "auth_type": "modern_auth",
      "reasons": "React implements modern authentication patterns...",
      "evidence_samples": [
        "//registry.npmjs.org/:_authToken=${NPM_TOKEN}",
        "${{ secrets.NPM_TOKEN }}"
      ]
    }
  }
]
```

**Note**: The `data` object structure depends entirely on the prompt used - this example shows authentication analysis output.

## Development

```bash
npm run build  # Compile TypeScript
npm run demo   # Build and run with default input
```
