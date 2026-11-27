---
description: |
  Locks and verifies GitHub Actions workflow dependencies with gh-actions-lock. Use when onboarding a repository to .github/workflows/actions.lock, fixing or relocking the lockfile, verifying it in CI, reading its findings, or whenever a user mentions actions.lock, gh actions-lock, or pinning workflow dependencies.
license: MIT
metadata:
  author: github
  github-path: skills/gh-actions-lock
  github-ref: refs/tags/v0.5.1
  github-repo: https://github.com/github/gh-actions-lock
  github-repo-id: '1217640442'
  github-tree-sha: 3c24678b0d27fc3ea6f51ce0048777f84ff25627
  version: 0.1.0
name: gh-actions-lock
---

# gh-actions-lock

`gh actions-lock` is a [GitHub CLI](https://cli.github.com/) extension that pins every direct and
transitive action a repository's workflows use to a verified commit, recorded in
`.github/workflows/actions.lock`. It is pre-1.0: flags and behavior can change between releases.

## Setup

Requires an authenticated GitHub CLI. github.com and GitHub Enterprise Cloud with data residency
(`*.ghe.com`) are supported; GitHub Enterprise Server is not.

```bash
gh extension install github/gh-actions-lock
```

Run every command from the repository checkout. The host comes from `--hostname`, then `GH_HOST`,
then the repository remote, then github.com.

## Modes

| Command                          | Writes | Network | Use for                                                  |
| -------------------------------- | ------ | ------- | -------------------------------------------------------- |
| `gh actions-lock`                | yes    | yes     | onboarding and fixing the lockfile                       |
| `gh actions-lock --relock`       | yes    | yes     | advancing moved refs to current upstream commits         |
| `gh actions-lock --verify`       | no     | yes     | CI: same checks as a fix run, fails on anything blocking |
| `gh actions-lock --verify-local` | no     | no      | pre-commit: every `uses:` has a lockfile entry           |
| `gh actions-lock --no-fix`       | no     | yes     | read-only report                                         |

`--verify-local` only checks coverage, not that entries are trustworthy. Use `--verify` in CI.
`--verify` and `--verify-local` are mutually exclusive, and `--verify-local` cannot be combined
with `--relock` or `--accept-moved`.

Pass workflow paths to scope a run: `gh actions-lock .github/workflows/ci.yml`. Only a
full-directory run prunes entries for deleted workflows.

## Onboarding and fixing

```bash
gh actions-lock                 # pin every resolvable action and write actions.lock
gh actions-lock --verify        # confirm
git add .github/workflows/
```

- Rerun after adding a workflow or changing any `uses:`. Locked pins are sticky: a plain run only
  resolves refs the lockfile doesn't record yet.
- Partial versions (`v4`) are narrowed to the highest matching full tag (`v4.2.1`) when first
  pinned. `--no-narrow` keeps them as written.
- Writes are all or nothing. If any error remains that the run can't fix, it changes nothing,
  not even for workflows that are otherwise fine.
- Commit `actions.lock` together with any workflow edits the run made.

**Local `./…` actions.** The CLI never follows, locks or rewrites a workspace path. When a local
action in the checkout uses remote actions, every mode reports a blocking `local-action` error.
Fix it with one of:

```bash
gh actions-lock --migrate-local-actions   # rewrite workflows' same-repo ./… to $/… so they get locked
gh actions-lock --ignore-local-actions    # keep ./… and downgrade it to a warning
```

`$/…` refers to the same repository at the running commit and needs no lockfile entry. Action files
are never edited; change a `./…` inside one to `$/…` by hand. A `./…`
inside a remote composite can't be rewritten, so only `--ignore-local-actions` applies there.

## Relocking and moved refs

```bash
gh actions-lock --relock        # re-resolve every ref to its current upstream commit
```

`--relock` advances floating refs (`main`, `v4`), fixes `tag-commit-mismatch`, and rebuilds each
composite's dependencies from its manifest. It leaves `unreachable-pin` as an error: the locked
commit is no longer in the ref's history, which is either an upstream force-push or an edited
lockfile, and the CLI can't tell which.

`--accept-moved` accepts those pins at their current commit. **It is a human decision.** Only
run it after the user has checked why the commit moved, and never in CI, scheduled jobs, or other
automation, where it would silently accept a tampered pin.

## Exit codes and JSON

| Code | Meaning                                                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------------------------- |
| 0    | Nothing to fix, or every finding was fixed                                                                                |
| 1    | Blocking findings remain, or `--fail-on-warning` is set and a read-only run reported a warning; the report is well-formed |
| 2    | The tool itself failed (bad flag, IO, auth, malformed lockfile); read stderr                                              |

```bash
gh actions-lock --verify --json 2>/dev/null
```

JSON goes to stdout and progress to stderr; parse only stdout. `--json` alone selects
`valid,findings,workflows`. Pass a list to choose from `valid`, `findings`, `workflows`,
`dependencies`, and `pins`. Each finding has:

```
workflow, category, severity ("error" | "warning" | "info"), confidence,
dependency, required_by, detail, remediation, doc_url, retryable
```

A run is invalid exactly when some finding has severity `error`; warnings and info never block.
`retryable: true` means GitHub was unreachable or rate-limited: rerun later rather than editing
anything.

## Reading findings

Act on each finding's `remediation`, and open its `doc_url` before deciding. Don't guess from the
category name alone.

| Category                                                         | Usual next step                                   |
| ---------------------------------------------------------------- | ------------------------------------------------- |
| `not-pinned`, `stale`, `ref-changed`, `repo-renamed`             | `gh actions-lock`                                 |
| `ref-moved`, `tag-commit-mismatch`, `incomplete-lockfile`        | `gh actions-lock --relock`                        |
| `unreachable-pin`                                                | stop and ask the user; see `--accept-moved` above |
| `misleading-sha`, `repo-replaced`                                | stop and ask the user; don't relock or accept     |
| `ref-missing`, `invalid-workflow`, `invalid-self-repository-ref` | fix the workflow source                           |
| `repo-unavailable`                                               | deleted, or the token can't read it; check access |
| `ancestry-unknown`, `reachability-unknown`                       | retryable; rerun later                            |
| `local-action`                                                   | see local actions above                           |
| `container-image`, `version-ref`, `fresh-tag`                    | non-blocking; mention to the user                 |

## CI

Copy [`.github/workflows/verify-lockfile.yml`](https://github.com/github/gh-actions-lock/blob/main/.github/workflows/verify-lockfile.yml)
into the repository, then run `gh actions-lock` once so the new workflow is locked too. It runs
`gh actions-lock --verify` on pull requests, pushes to `main`, and a weekly schedule that catches
re-pointed tags. The job's `GITHUB_TOKEN` reads public actions and the repository itself; actions
from other private or internal repositories need a token that can read them.

## Limits

- Reusable workflows called at `jobs.<id>.uses` from another repository are not locked.
- Local `./…` actions and their dependencies are outside lockfile coverage.
- Container images are not pinned; anything without an `@sha256:` digest is a warning.
- A floating ref locked to an older commit in its history isn't detected. Review lockfile diffs or
  pin exact tags.

## Learn more

`gh actions-lock --help` is authoritative for flags. Failed runs print the path of a saved run
log; attach it to bug reports. Start from these, plus each finding's `doc_url`:

- [Workflow dependency lockfiles](https://docs.github.com/en/actions/concepts/security/workflow-dependency-lockfiles)
- [Lock workflow dependencies](https://docs.github.com/en/actions/how-tos/secure-your-work/lock-workflow-dependencies)
- [Enforce workflow lockfiles](https://docs.github.com/en/actions/how-tos/administer/enforce-workflow-lockfiles)
- [Control workflow execution](https://docs.github.com/en/actions/how-tos/administer/control-workflow-execution)
- [Troubleshooting](https://github.com/github/gh-actions-lock/blob/main/docs/troubleshooting.md)
  and the [README](https://github.com/github/gh-actions-lock#readme)
