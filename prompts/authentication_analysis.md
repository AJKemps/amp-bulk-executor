<!--  Authentication Analysis Prompt  (Amp-compatible)  -->

<task>
  Determine how authentication is handled in the target codebase.
  Produce a single JSON object as described in <output_format>.
  Use the multi-tool strategy in <execution_plan>.
</task>

<execution_plan>
  1. Oracle-phase (planning & synthesis)  
     a. Read this entire prompt.  
     b. Use mcp__sourcegraph-tools to identify the repository name and current commit hash for tracking.
     c. Create a "work plan" that lists which areas of code should be searched using
        mcp__sourcegraph-tools, and which heuristics or keywords will be used for searches
        (e.g., "signin", "jwt.verify", "oauth2", "@PreAuthorize").  
     d. Output the plan as an internal comment for subagents (it will not
        appear in the final JSON).  

  2. Subagent-phase (parallel evidence gathering)  
     a. Spawn one subagent per major area identified by Oracle.  
     b. Subagents MUST ONLY use mcp__sourcegraph-tools tools to collect facts.
        Available tools: list_repos, list_files, read_file, keyword_search,
        nls_search, go_to_definition, find_references, commit_search,
        diff_search, get_code_owners, get_contributor_repos.
        NO local file system access is available.
     c. Each subagent returns a compact summary:
        – auth_indicators : list of strings (code snippets, filenames, etc.)  
        – suspected_auth_type : one of "modern_auth", "legacy_auth", "no_auth", "mixed", "uncertain"
        – confidence (0-100)  
        – notes : free-text reasoning  

  3. Oracle-phase (integration & decision)  
     a. Aggregate subagent summaries.  
     b. Apply decision rules in <auth_type_rules>.  
     c. Include repository metadata (name and commit) for tracking.
     d. Compose the final JSON response required in <output_format>.  
</execution_plan>

<auth_type_rules>
  modern_auth : Clear evidence of modern authentication using OAuth 2.0, JWT tokens,
                or similar industry-standard protocols with proper security practices
                (secure token handling, refresh mechanisms, etc.).

  legacy_auth : Authentication present but using outdated methods like basic auth,
                session cookies without proper security, or custom authentication
                schemes without modern security standards.

  no_auth     : Clear evidence that authentication is explicitly disabled or
                absent, and no fallback auth is observed.  

  mixed       : Some endpoints use modern auth while others use legacy methods
                or no authentication (inconsistent implementation).

  uncertain   : Use ONLY when the available evidence is
                • ambiguous OR contradictory, OR
                • insufficient because critical code areas were inaccessible,
                  obfuscated, or outside the repository.  
                Subagents must include explicit reasons in notes when choosing
                this value.  
</auth_type_rules>

<output_format>
  Produce exactly one JSON object with these keys:
  {
    "repo_name"       : "<string>  // Repository name (e.g., 'acme/payment-service' or path)",
    "commit_hash"     : "<string>  // Current commit SHA (40 chars) or branch name",
    "auth_type"       : "modern_auth" | "legacy_auth" | "no_auth" | "mixed" | "uncertain",
    "reasons"         : "<short paragraph explaining the decision>",
    "evidence_samples": ["<code_or_comment_snippet>", ...]// ≤ 5 short snippets
  }
</output_format>

<constraints>
  • The JSON object MUST be the only thing in the final answer.  
  • Do NOT include XML, commentary, or markdown in the final answer.
  • Your response must start with { and end with } - nothing else.
  • Do NOT wrap the JSON in code blocks or markdown formatting.
  • Do NOT provide explanations, summaries, or additional text.
  • Limit each evidence snippet to ≤ 200 characters, strip newlines.  
  • Always include repo_name and commit_hash for tracking and verification.
  • ONLY use mcp__sourcegraph-tools tools - no local file system access.
</constraints>
