# Appearance

KP has five app-wide appearance presets: Midnight (default, dark), Dusty Rose
(light), Oxblood (dark), Crimson Depths (dark) and INFJ (light). Settings in both
the V2 shell and existing app expose the same native radio picker with miniature
previews. Changes apply immediately;
keyboard arrows select adjacent choices. Appearance does not follow OS changes.

`src/styles/theme.css` owns semantic surface, text, border, focus, status and
progress colors. Shared UI components and both application shells consume these
tokens. Keep color decisions here rather than creating per-feature palettes.
Midnight's light pink, `#f0d3e7`, is the shared `--brand-pink` and
`--accent-primary` in every preset. Filled primary actions use this pink with
dark `--text-on-accent` ink. Dark themes also use it for accent text; light
themes retain darker accent ink for contrast. `--accent-theme` preserves each
palette's distinct color for progress gradients. The picker
previews show the same pink accent in all five palettes.
`data-theme` is set on the document element; nested scopes are only for the
appearance picker's decorative previews. Geometry, feature behavior and the
shared progress bar's gradient/feather treatment are independent of the palette.
Dusty Rose, Oxblood, Crimson Depths and INFJ derive their bar stops and glow
from their semantic palette colors; Midnight retains its approved
rose/lavender/blue stops.
Determinate bars, quiz bars and indeterminate sweeps consume the same shared
fill tokens, and loading artwork uses the active accent text color. The shared
base ink uses zero specificity so lazily loaded defaults cannot replace a
component's theme color.

Crimson Depths uses the supplied crimson/teal/plum reference palette, with
lifted text and accent tones for dark-surface contrast. INFJ uses the supplied
teal/sage/lavender/pine/ivory palette with an ivory light foundation. Both are
explicit appearance choices and use the same metadata and persistence contract.

`src/lib/appearancePresets.ts` owns stable IDs, display labels, color schemes and
browser chrome colors. Its synchronous bootstrap script is injected in the HTML
head by Vite, before styles or application modules. The script reads the exact
production or PR-scoped key and sets the document theme, background, color scheme
and browser metadata. After the preview storage shim is installed, normal app
initialization uses the same preference. Invalid/missing values and unavailable
storage fall back to Midnight. Failed writes retain the selected theme for this
visit and show a persistence message; navigation does not discard that selection.

The browser-local key is `kink-profile:appearance`; PR preview builds scope it to
`kink-profile:preview:pr-<number>:kink-profile:appearance`. This preference is
separate from profile settings, ratings, roles, consent and relationship rules.
Profile backups, sharing and selective profile reset do not export, restore or
reset appearance. No schema migration is required. There is no theme inference,
custom theme editor, account sync or per-relationship selection in this slice.

Runtime `theme-color`, `color-scheme` metadata and CSS `color-scheme` agree with
the selected preset. The static PWA manifest uses Midnight's `#0b0c25` as its
install/startup default; it is not the user's preference source. Browser toolbar
support varies. Existing service-worker scopes, installation identity and preview
base paths remain unchanged.

`e2e/appearance.spec.ts` exercises selection, keyboard control, reload/navigation,
OS independence, preview isolation and representative rendered contrast/layout
checks in the inherited Chromium/WebKit projects. Automated browser scans do not
replace physical-device, installed-PWA or screen-reader release checks.
