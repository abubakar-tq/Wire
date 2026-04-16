# Pull Sync Workflow

This repo sometimes has a dirty worktree due to contract submodules and local forge installs. Use this workflow to sync with `origin/master` without losing work.

## Fast-forward sync (preferred)

1. Fetch:
```bash
git fetch origin
```

2. Check whether you are already synced:
```bash
git rev-parse HEAD
git rev-parse origin/master
```

3. If your worktree is clean, pull fast-forward only:
```bash
git pull --ff-only origin master
```

## If your worktree is dirty

1. Inspect:
```bash
git status --porcelain=v1
git submodule status
```

2. Decide for each dirty area:

- Local code changes you want to keep: commit them on a feature branch.
- Experimental changes you might keep later: stash them.
- Submodule noise (forge-std / OZ) you do not intend to keep: restore them (do not do this if you intentionally updated those libs).

3. Stash everything (including untracked) when unsure:
```bash
git stash push -u -m "wip before sync"
```

4. Pull:
```bash
git pull --ff-only origin master
```

5. Re-apply stashed changes:
```bash
git stash pop
```

## Notes

- Avoid `git pull` merges on `master`. Prefer `--ff-only` so history stays linear.
- If you need to update a submodule intentionally, do it on a branch and commit it explicitly.
