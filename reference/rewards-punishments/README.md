# Rewards & Punishments Reference Data

Source data converted from `jackie_taylor_rewards_punishments_combined.xlsx`.

This follows the same source-data approach as `reference/catalog/`: plain-text TSV/Markdown
is readable, searchable, and diffable in GitHub, while source provenance remains explicit.

## Files

- `punishments.tsv` — 486 punishment/consequence ideas combined from six source sheets
- `rewards.tsv` — 183 reward ideas combined from two source sheets
- `system-guide.md` — reward/punishment principles, tiers, rules, and metadata reconstructed from the workbook's structured guide rows
- `overview.tsv` — workbook overview and original source-file provenance
- `source/` — exact sheet-level TSV exports retained for fidelity and future reprocessing

The combined TSVs preserve each source row through `Source Sheet`, `Source File`, and
`Source Row`. Source-specific columns are mapped into a shared reference schema; fields
that did not exist in a given source remain blank rather than being inferred.

Total source ideas: **486 punishments + 183 rewards = 669 ideas**.

These files are reference/source material only. A future rewards-and-consequences runtime
model should define stable IDs and application semantics separately rather than using source
row order as identity.
