# Profile and Settings navigation ownership

M19 treats Profile as the owner of profile-adjacent actions and Settings as the owner of advanced/local configuration.

- `/profile` is the primary Profile destination.
- Profile exposes real `Share` and `Settings` actions. Share enters `/settings?section=sharing` and opens the share-summary area; Settings enters `/settings` normally.
- `/settings` is classified as Profile in primary navigation. Direct Settings entry safely returns to `/profile`; route state may preserve another valid invoking route.
- Settings uses local back/title chrome. The legacy desktop header remains only as temporary desktop compatibility until the M19 desktop rail work.
- Advanced Settings owns the local Developer / Admin Tools preference. That preference is stored separately from profile data and is not included in profile backup/export.
- Enabling Developer / Admin Tools reveals Curation Workbench from Advanced Settings. This is discoverability only, not authentication or authorization.
- Curation remains absent from ordinary primary navigation and launchers. Curation opened from Advanced Settings returns to Settings when closed.
