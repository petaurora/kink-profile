#!/usr/bin/env bash
set -euo pipefail
version=1.7.12
checksum=8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8
destination="${1:-${RUNNER_TEMP:-/tmp}/kp-ci-bin}"
archive="$(mktemp)"
trap 'rm -f "$archive"' EXIT
curl --fail --location --retry 3 "https://github.com/rhysd/actionlint/releases/download/v${version}/actionlint_${version}_linux_amd64.tar.gz" -o "$archive"
printf '%s  %s\n' "$checksum" "$archive" | sha256sum --check
mkdir -p "$destination"
tar --no-same-owner -xzf "$archive" -C "$destination" actionlint
if [[ -n "${GITHUB_PATH:-}" ]]; then printf '%s\n' "$destination" >> "$GITHUB_PATH"; fi
"$destination/actionlint" -version
