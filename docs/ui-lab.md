# UI Lab

`#/ui-lab` composes the experimental responsive shell and shared controls. It uses
illustrative Catalog records. Production Catalog routes and durable profile data
remain separate.

## Records and explicit editing

The Lab record provider owns independent item ratings, item-specific modifier
ratings, Tried and Comfort. Navigation and disclosure do not create records.
The preference vocabulary is Love, Like, Curious, Unsure, Not Interested, Hard
Limit and Not Applicable. Contextual help describes these meanings. Help expansion
is retained across selectors only within the mounted Lab session.

The selector focuses its heading. Tab enters the choices; arrow keys/Home/End move
focus without editing; Enter/Space explicitly commits; Escape cancels. Clear
offers Undo for the exact preceding value. Version checks keep an older Undo from
overwriting a newer explicit edit.

Tried and three-value Comfort live in an optional item Experience disclosure.
Unchecked Tried means no affirmative record. Comfort stores semantic string values,
independently of Tried and preference. Changes retain session revisions and edit
timestamps; these are not dates of participation. Tried offers Undo.

## Simulated save and recovery

The latest edit wins per target. The provider retains pending operations across
feature mounts, cancels obsolete timers and confirms only the latest simulated
operation. Saving becomes Saved after 850 ms; Saved clears after 1.25 seconds.
The test-failure checkbox fails the next rating operation and retains its value.
Failures remain visible until retried or replaced with a newer edit.

Failed modifiers take priority over saving and ordinary rated dots at item/group
level. Opening the failed parent reveals the affected group, scrolls to the field
and focuses Retry. Multiple failures offer Retry all and next-issue navigation.
Other destinations retain a summary and Retry all. Fresh Refine opens keep groups
collapsed unless revealing an explicit error or search destination.

Search clear and classification-filter clear remain independent in R/P. Changes
to R/P search results and classification chips/answer states return to the list
start. Classification fixture values remain read-only; Refine classification
editing is deferred.

## Storage boundary

All new records and revisions are memory-only. Reloading or leaving the mounted
Lab ends the session. The simulated persistence indicators do not establish a
durable write, cross-device sync, permission or consent.
