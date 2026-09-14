#!/usr/bin/env bash
set -euo pipefail

mode="${1:-}"
if [[ "$mode" != "production" && "$mode" != "preview" && "$mode" != "cleanup" ]]; then
  echo "Usage: publish-pages.sh <production|preview|cleanup>" >&2
  exit 2
fi

: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
: "${GH_TOKEN:?GH_TOKEN is required}"

source_dir="${SOURCE_DIR:-}"
pr_number="${PR_NUMBER:-}"
max_attempts="${MAX_PUSH_ATTEMPTS:-6}"
repo_url="https://x-access-token:${GH_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
work_root="$(mktemp -d "${RUNNER_TEMP:-/tmp}/pages-publish.XXXXXX")"
trap 'rm -rf "$work_root"' EXIT

if [[ "$mode" == "production" || "$mode" == "preview" ]]; then
  [[ -n "$source_dir" && -d "$source_dir" ]] || {
    echo "SOURCE_DIR must point to the built site for $mode publishing." >&2
    exit 2
  }
fi

if [[ "$mode" == "preview" ]]; then
  [[ "$pr_number" =~ ^[0-9]+$ ]] || {
    echo "PR_NUMBER must be numeric for preview publishing." >&2
    exit 2
  }
fi

write_output() {
  local key="$1"
  local value="$2"
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    echo "${key}=${value}" >> "$GITHUB_OUTPUT"
  fi
}

pr_is_open() {
  local state
  state="$(gh api "repos/${GITHUB_REPOSITORY}/pulls/${pr_number}" --jq '.state')"
  [[ "$state" == "open" ]]
}

publish_succeeded=false
published=false
removed_json='[]'

for (( attempt=1; attempt<=max_attempts; attempt++ )); do
  if [[ "$mode" == "preview" ]] && ! pr_is_open; then
    echo "PR #${pr_number} is no longer open; skipping preview publish."
    write_output published false
    write_output removed '[]'
    exit 0
  fi

  checkout="$work_root/gh-pages"
  rm -rf "$checkout"
  git clone --quiet --depth 1 --branch gh-pages "$repo_url" "$checkout"
  cd "$checkout"

  removed=()

  case "$mode" in
    production)
      # Production owns the root site but deliberately preserves active PR
      # preview directories. Cleanup owns deletion of stale pr-* directories.
      find . -mindepth 1 -maxdepth 1 \
        ! -name '.git' \
        ! -name 'pr-*' \
        -exec rm -rf -- {} +
      cp -a "$source_dir"/. .
      ;;

    preview)
      # A PR can close while its build is running. Check again immediately
      # before mutating so retries cannot resurrect an already-closed preview.
      if ! pr_is_open; then
        echo "PR #${pr_number} closed before publish; skipping preview publish."
        write_output published false
        write_output removed '[]'
        exit 0
      fi

      rm -rf -- "pr-${pr_number}"
      mkdir -p "pr-${pr_number}"
      cp -a "$source_dir"/. "pr-${pr_number}/"
      published=true
      ;;

    cleanup)
      declare -A open_prs=()
      while read -r number; do
        [[ -n "$number" ]] && open_prs["$number"]=1
      done < <(
        gh api --paginate \
          "repos/${GITHUB_REPOSITORY}/pulls?state=open&per_page=100" \
          --jq '.[].number'
      )

      shopt -s nullglob
      for path in pr-*; do
        [[ -d "$path" ]] || continue
        [[ "$path" =~ ^pr-([0-9]+)$ ]] || continue
        number="${BASH_REMATCH[1]}"

        if [[ -z "${open_prs[$number]:-}" ]]; then
          echo "Removing stale preview: $path"
          rm -rf -- "$path"
          removed+=("$number")
        fi
      done
      shopt -u nullglob
      ;;
  esac

  git config user.name "github-actions[bot]"
  git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
  git add -A

  if git diff --cached --quiet; then
    echo "No gh-pages changes required for $mode."
    publish_succeeded=true
    if [[ "$mode" == "cleanup" ]]; then
      removed=()
    fi
    break
  fi

  git commit --quiet -m "${PUBLISH_COMMIT_MESSAGE:-Update GitHub Pages}"

  if git push --quiet origin HEAD:gh-pages; then
    publish_succeeded=true
    if [[ "$mode" == "cleanup" && ${#removed[@]} -gt 0 ]]; then
      removed_json="$({ printf '%s\n' "${removed[@]}"; } | jq -Rsc 'split("\n") | map(select(length > 0) | tonumber)')"
    fi
    break
  fi

  echo "gh-pages changed during publish attempt ${attempt}/${max_attempts}; retrying from the latest branch..."
  sleep $((attempt * 2))
done

if [[ "$publish_succeeded" != true ]]; then
  echo "Failed to publish $mode after ${max_attempts} attempts." >&2
  exit 1
fi

if [[ "$mode" == "production" ]]; then
  published=true
fi

write_output published "$published"
write_output removed "$removed_json"
