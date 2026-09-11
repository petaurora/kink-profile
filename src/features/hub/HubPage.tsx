import ProfileAppRoot from "../../ProfileAppRoot";

// The Hub now has a first-class feature-owned route boundary. Its current
// presentation remains delegated to App until M18.3 moves quiz orchestration
// out of the legacy screen state machine; this avoids duplicating quiz state.
export function HubPage() {
  return <ProfileAppRoot initialScreen="hub" />;
}
