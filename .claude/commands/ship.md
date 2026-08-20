---
description: Pull, stage, commit with auto-generated message, and push to origin.
disable-model-invocation: true
allowed-tools: Bash, Read, Grep, Glob
---

# Ship: Pull → Add → Commit → Push

Run the full git ship workflow automatically. Follow these steps **exactly in order**, stopping if any step fails.

## Step 0 — Pull latest

```
git pull origin main
```

If there are merge conflicts, **stop and tell the user**. Do not attempt to resolve them automatically.

## Step 1 — Check what changed

Run these in parallel:
- `git status -u` (never use `-uall`)
- `git diff --stat`
- `git log --oneline -5` (for commit message style reference)

If there are **no changes** (no modified, no untracked files), tell the user "Nothing to commit" and stop.

## Step 2 — Stage changes

Stage all modified and untracked files. **Exclude** any files that look like secrets (`.env`, `credentials.json`, `*.pem`, `*.key`). If you find such files, warn the user and skip them.

```
git add <specific files>
```

## Step 3 — Generate commit message

Analyze the staged diff (`git diff --cached`) to understand **all changes** since the last commit. Write a concise commit message following this format:

- **First line**: conventional commit type + short summary (max 72 chars)
  - Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `perf`, `test`
  - If multiple types apply, pick the dominant one or use `feat` for mixed feature work
- **Body** (optional, only if 3+ distinct changes): bullet list of key changes, each ≤ 80 chars

Keep it factual — describe **what** changed, not implementation details. Match the terse style of recent commits in this repo.

Always end with:
```
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

Use a HEREDOC for the commit message.

## Step 4 — Push

```
git push origin main
```

If push fails (e.g. rejected), tell the user and **do not force push**.

## Step 5 — Log to Second Brain

After a successful push, append an entry to `~/Desktop/second-brain/log.md`:

```markdown
## [YYYY-MM-DD] commit | <commit message first line>
- Project: <project name from directory>
- Hash: <short hash>
- Files changed: <count>
- Summary: <1-2 sentence description of what was done and why>
```

Then check if `~/Desktop/second-brain/wiki/project-<name>.md` exists for this project:
- If it exists, append the commit to a `## Recent Activity` section at the bottom (keep last 10 entries)
- If it doesn't exist, skip — the user can run "ingest project X" from the second-brain folder later

## Step 6 — Confirm

Show the user the commit hash and a one-line summary of what was shipped.
