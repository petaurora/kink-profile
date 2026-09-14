export const PROFILE_BOUNDARY_STATE_STORAGE_KEY = "pet-profile-boundary-state-v1";

export type BoundarySummaryAssertion = {
  kind: "none";
  updatedAt: string;
};

export type ProfileBoundaryState = {
  schemaVersion: 1;
  limits?: BoundarySummaryAssertion;
};

export type BoundaryStateStorageLike = Pick<Storage, "getItem" | "setItem">;

export function createEmptyProfileBoundaryState(): ProfileBoundaryState {
  return { schemaVersion: 1 };
}

function browserStorage(): BoundaryStateStorageLike | undefined {
  return typeof localStorage === "undefined" ? undefined : localStorage;
}

export function loadProfileBoundaryState(
  storage: BoundaryStateStorageLike | undefined = browserStorage(),
): ProfileBoundaryState {
  if (!storage) return createEmptyProfileBoundaryState();

  try {
    const raw = storage.getItem(PROFILE_BOUNDARY_STATE_STORAGE_KEY);
    if (!raw) return createEmptyProfileBoundaryState();

    const parsed = JSON.parse(raw) as Partial<ProfileBoundaryState> & {
      limits?: Partial<BoundarySummaryAssertion>;
    };
    if (parsed.schemaVersion !== 1) return createEmptyProfileBoundaryState();

    const limits =
      parsed.limits?.kind === "none" && typeof parsed.limits.updatedAt === "string"
        ? { kind: "none" as const, updatedAt: parsed.limits.updatedAt }
        : undefined;

    return { schemaVersion: 1, ...(limits ? { limits } : {}) };
  } catch {
    return createEmptyProfileBoundaryState();
  }
}

export function saveProfileBoundaryState(
  state: ProfileBoundaryState,
  storage: BoundaryStateStorageLike | undefined = browserStorage(),
) {
  if (!storage) return;
  storage.setItem(PROFILE_BOUNDARY_STATE_STORAGE_KEY, JSON.stringify(state));
}

export function affirmNoLimits(
  state: ProfileBoundaryState,
  updatedAt = new Date().toISOString(),
): ProfileBoundaryState {
  return {
    ...state,
    schemaVersion: 1,
    limits: { kind: "none", updatedAt },
  };
}

export function clearLimitsAssertion(
  state: ProfileBoundaryState,
): ProfileBoundaryState {
  if (!state.limits) return state;
  const { limits: _limits, ...rest } = state;
  return rest;
}
