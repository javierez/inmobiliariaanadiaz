---
name: ship
description: Ship local changes to production — pulls latest, commits all changes with a generated summary, pushes to main, then redeploys the Railway site-generator API
disable-model-invocation: true
---

# Ship to Production

Ship the current working-tree changes to production. Optional context from the user: $ARGUMENTS

## Steps

Execute these in order. Stop and report to the user if any step fails — do NOT try to "fix" failures with destructive commands.

### 1. Sync with remote

Pull the latest `main` with rebase + autostash so local changes are preserved:

```bash
git pull --rebase --autostash origin main
```

If there are merge/rebase conflicts, STOP and ask the user how to proceed. Do not run `git rebase --abort` or any reset without permission.

### 2. Inspect changes

Run in parallel:
- `git status`
- `git diff` (unstaged)
- `git diff --cached` (staged)
- `git log -5 --oneline` (to match commit-message style)

If there is nothing to commit, skip to Step 5 (still redeploy Railway, since the user explicitly asked for it).

### 3. Stage and commit

- Stage only the relevant changed files by name. Do NOT use `git add -A` or `git add .` (avoid committing accidental files).
- Skip anything that looks like secrets (`.env*`, credentials, keys). Warn the user if any such file appears modified.
- Draft a commit message that **summarizes what actually changed** (read the diff — don't guess). Format:
  - First line: short imperative subject (≤72 chars), conventional-commits prefix when it fits (`feat:`, `fix:`, `chore:`, etc.).
  - Blank line.
  - 1–4 bullets explaining the *why* and the user-visible effect, not a file list.
- Commit using a HEREDOC, ending with the Co-Authored-By trailer:

```bash
git commit -m "$(cat <<'EOF'
<subject line>

- <bullet 1>
- <bullet 2>

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

If a pre-commit hook fails, fix the underlying issue and create a NEW commit. Never use `--no-verify` or `--amend` here.

### 4. Push to main

```bash
git push origin main
```

Never force-push. If the push is rejected, STOP and report to the user.

### 5. Wait for the push to land, then redeploy Railway

The Railway service `vesta-site-generator` is wired to auto-deploy from `main`, so the `git push` in Step 4 already kicks off a build. Give GitHub → Railway a moment to register the new commit before we touch anything:

```bash
sleep 180
```

Then explicitly redeploy with the latest local state (belt-and-suspenders — guarantees the Railway service is running exactly the code we just shipped, even if the auto-deploy webhook is slow or flaky):

```bash
railway up --detach
```

Then wait ~30s for the container to come up and verify health:

```bash
curl -s https://vesta-site-generator-production.up.railway.app/health
```

A healthy response looks like `{"status":"ok",...}`. If the health check fails, fetch recent logs with `railway logs --lines 50` and report what you find.

### 6. Report

Give the user a concise summary:
- Commit SHA + subject
- Push confirmation
- Railway health status

Keep it short — a few lines, no preamble.

## Hard rules

- Never `git push --force`, `git reset --hard`, or `git rebase --abort` without explicit user permission.
- Never skip hooks (`--no-verify`).
- Never commit `.env*` or anything that looks like a secret.
- If anything unexpected happens (unknown files, conflicts, failed health check), STOP and ask — don't paper over it.
