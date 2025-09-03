# Repo Authentication Analyzer

A TypeScript tool that analyzes authentication patterns in repositories using parallelized `amp -x` sessions.

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

2. Run the analyzer:
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
- `-p, --prompt`: Path to analysis prompt (default: `prompts/authentication_analysis.md`)
- `-o, --output-dir`: Output directory (default: `runs`)

## Output

Results are saved to `runs/run_<timestamp>.json` containing an array of analysis results:

```json
[
  {
    "slug": "facebook/react",
    "timestamp": "2024-09-02T10:30:00.000Z",
    "status": "SUCCESS",
    "data": {
      "repo_name": "facebook/react",
      "commit_hash": "abc123",
      "auth_type": "no_auth",
      "reasons": "...",
      "auth_locations": [],
      "evidence_samples": []
    }
  }
]
```

## Development

```bash
npm run build  # Compile TypeScript
npm run demo   # Build and run with default input
```
