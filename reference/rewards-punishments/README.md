# Rewards & Punishments Reference Data

Source data converted from `jackie_taylor_rewards_punishments_combined.xlsx`.

This follows the same source-data approach as `reference/catalog/`: plain-text TSV/Markdown
is readable, searchable, and diffable in GitHub, while source provenance remains explicit.

## Files

Runtime-normalized M11 inputs are checked in separately from the raw source bank so runtime identity never depends on source row order or display labels:

- `context-categories.tsv` — versioned stable M11 contextual category taxonomy
- `action-library.tsv` — normalized, deduplicated action primitives with stable IDs and preserved source provenance
- `catalog-category-mappings.tsv` — bounded mappings from every M6 catalog category into the M11 contextual taxonomy
- `catalog-source-links.tsv` — source ideas that intentionally reuse an existing M6 catalog primitive identity


- `punishments.tsv` — 486 punishment/consequence ideas combined from six source sheets
- `rewards.tsv` — 183 reward ideas combined from two source sheets
- `system-guide.md` — reward/punishment principles, tiers, rules, and metadata reconstructed from the workbook's structured guide rows
- `overview.tsv` — workbook overview and original source-file provenance
- `source/` — exact sheet-level TSV exports retained for fidelity and future reprocessing

The combined TSVs preserve each source row through `Source Sheet`, `Source File`, and
`Source Row`. Source-specific columns are mapped into a shared reference schema; fields
that did not exist in a given source remain blank rather than being inferred.

Total source ideas: **486 punishments + 183 rewards = 669 ideas**.

The original combined/source TSVs remain immutable reference material. M11 runtime code consumes the normalized files above, preserving all 669 source origins while keeping source row order and raw source category text out of runtime identity.
