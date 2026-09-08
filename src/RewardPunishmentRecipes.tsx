import { useEffect, useMemo, useState } from "react";
import { kinkCatalog } from "./data/kinkCatalog.generated";
import {
  getRewardPunishmentAction,
  getRewardPunishmentPrimitive,
  rewardPunishmentCategories,
  rewardPunishmentPrimitiveKey,
  rewardPunishmentPrimitives,
  type RewardPunishmentPrimitive,
} from "./lib/rewardPunishmentLibrary";
import type {
  RewardPunishmentContext,
  RewardPunishmentProfileState,
} from "./lib/rewardPunishmentProfile";
import {
  buildInferredContextProposals,
} from "./lib/rewardPunishmentInference";
import {
  deleteRewardPunishmentRecipe,
  duplicateRewardPunishmentRecipe,
  moveRewardPunishmentRecipeComponent,
  reconcileRewardPunishmentRecipeState,
  upsertRewardPunishmentRecipe,
  validateRewardPunishmentRecipe,
  type RewardPunishmentRecipe,
  type RewardPunishmentRecipeComponent,
  type RewardPunishmentRecipeKind,
} from "./lib/rewardPunishmentRecipes";
import {
  loadRewardPunishmentRecipeState,
  saveRewardPunishmentRecipeState,
} from "./lib/rewardPunishmentRecipeStorage";
import type { CatalogResultView } from "./lib/catalogResults";
import type { CanonicalSignalResult } from "./lib/overallProfileSignals";
import "./rewardPunishmentRecipes.css";

const catalogById = new Map<string, (typeof kinkCatalog)[number]>(
  kinkCatalog.map((item) => [item.id, item]),
);

function newId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function contextLabel(kind: RewardPunishmentRecipeKind) {
  return kind === "reward" ? "Reward" : "Punishment";
}

function newRecipe(kind: RewardPunishmentRecipeKind): RewardPunishmentRecipe {
  const now = new Date().toISOString();
  return {
    id: newId("recipe"),
    kind,
    name: "",
    components: [],
    randomEligible: false,
    createdAt: now,
    updatedAt: now,
  };
}

function primitiveDescription(primitive: RewardPunishmentPrimitive) {
  if (primitive.ref.kind === "catalog") {
    return catalogById.get(primitive.ref.id)?.description;
  }
  return getRewardPunishmentAction(primitive.ref.id)?.description;
}

function primitiveCategories(primitive: RewardPunishmentPrimitive) {
  return primitive.contextCategories
    .slice()
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 2)
    .map(
      (mapping) =>
        rewardPunishmentCategories.find(
          (category) => category.id === mapping.id,
        )?.label ?? mapping.id,
    );
}

function primitiveSearchText(primitive: RewardPunishmentPrimitive) {
  return [
    primitive.label,
    primitiveDescription(primitive),
    ...primitiveCategories(primitive),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
}

function componentLabel(component: RewardPunishmentRecipeComponent) {
  if (component.kind === "custom") return component.label;
  return (
    getRewardPunishmentPrimitive(component.ref)?.label ??
    `Missing: ${component.ref.kind}:${component.ref.id}`
  );
}

export function RewardPunishmentRecipes({
  profile,
  canonicalSignals,
  catalogResultView,
}: {
  profile: RewardPunishmentProfileState;
  canonicalSignals: readonly CanonicalSignalResult[];
  catalogResultView: CatalogResultView;
}) {
  const [recipeState, setRecipeState] = useState(() =>
    reconcileRewardPunishmentRecipeState(
      loadRewardPunishmentRecipeState(),
      profile,
    ),
  );
  const [draft, setDraft] = useState<RewardPunishmentRecipe | null>(null);
  const [search, setSearch] = useState("");
  const [customText, setCustomText] = useState("");
  const [sourceFilter, setSourceFilter] = useState<
    "all" | "catalog" | "action"
  >("all");
  const [savedMessage, setSavedMessage] = useState<string>();

  useEffect(() => {
    setRecipeState((current) => {
      const reconciled = reconcileRewardPunishmentRecipeState(
        current,
        profile,
      );
      if (reconciled !== current) {
        saveRewardPunishmentRecipeState(reconciled);
      }
      return reconciled;
    });
  }, [profile]);

  const proposals = useMemo(() => {
    if (!draft) return [];
    return buildInferredContextProposals(
      profile,
      draft.kind,
      canonicalSignals,
      catalogResultView,
    )
      .filter((proposal) => proposal.band !== "weak")
      .slice(0, 5);
  }, [canonicalSignals, catalogResultView, draft, profile]);

  const visiblePrimitives = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase();
    return rewardPunishmentPrimitives
      .filter(
        (primitive) =>
          sourceFilter === "all" || primitive.sourceType === sourceFilter,
      )
      .filter(
        (primitive) =>
          !normalized || primitiveSearchText(primitive).includes(normalized),
      )
      .slice()
      .sort((left, right) => left.label.localeCompare(right.label))
      .slice(0, 12);
  }, [search, sourceFilter]);

  const validation = draft
    ? validateRewardPunishmentRecipe(draft, profile)
    : undefined;

  const commitState = (
    next: typeof recipeState,
    message?: string,
  ) => {
    saveRewardPunishmentRecipeState(next);
    setRecipeState(next);
    setSavedMessage(message);
  };

  const start = (kind: RewardPunishmentRecipeKind) => {
    setDraft(newRecipe(kind));
    setSearch("");
    setCustomText("");
    setSourceFilter("all");
    setSavedMessage(undefined);
  };

  const edit = (recipe: RewardPunishmentRecipe) => {
    setDraft({
      ...recipe,
      components: recipe.components.map((component) =>
        component.kind === "custom"
          ? { ...component }
          : { ...component, ref: { ...component.ref } },
      ),
      tags: recipe.tags ? [...recipe.tags] : undefined,
    });
    setSearch("");
    setCustomText("");
    setSourceFilter("all");
    setSavedMessage(undefined);
  };

  const addPrimitive = (primitive: RewardPunishmentPrimitive) => {
    if (!draft) return;
    setDraft({
      ...draft,
      components: [
        ...draft.components,
        { kind: "primitive", ref: primitive.ref },
      ],
      updatedAt: new Date().toISOString(),
    });
  };

  const addCustom = () => {
    const label = customText.trim();
    if (!draft || !label) return;
    setDraft({
      ...draft,
      components: [
        ...draft.components,
        {
          kind: "custom",
          id: newId("custom"),
          label,
        },
      ],
      updatedAt: new Date().toISOString(),
    });
    setCustomText("");
  };

  const removeComponent = (index: number) => {
    if (!draft) return;
    setDraft({
      ...draft,
      components: draft.components.filter(
        (_, componentIndex) => componentIndex !== index,
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const moveComponent = (fromIndex: number, toIndex: number) => {
    if (!draft) return;
    setDraft({
      ...moveRewardPunishmentRecipeComponent(
        draft,
        fromIndex,
        toIndex,
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const saveDraft = () => {
    if (!draft || !validation?.canSave) return;

    const nextRecipe = {
      ...draft,
      randomEligible:
        validation.needsReview ? false : draft.randomEligible,
      updatedAt: new Date().toISOString(),
    };
    const next = upsertRewardPunishmentRecipe(recipeState, nextRecipe);
    commitState(next, `${contextLabel(nextRecipe.kind)} recipe saved.`);
    setDraft(null);
  };

  const duplicate = (recipe: RewardPunishmentRecipe) => {
    const copy = duplicateRewardPunishmentRecipe(recipe, {
      id: newId("recipe"),
    });
    const next = upsertRewardPunishmentRecipe(recipeState, copy);
    commitState(next, "Recipe duplicated.");
    edit(copy);
  };

  const removeRecipe = (recipe: RewardPunishmentRecipe) => {
    if (!window.confirm(`Delete “${recipe.name}”? This only deletes the saved recipe.`)) {
      return;
    }
    commitState(
      deleteRewardPunishmentRecipe(recipeState, recipe.id),
      "Recipe deleted.",
    );
  };

  const sortedRecipes = recipeState.recipes
    .slice()
    .sort(
      (left, right) =>
        right.updatedAt.localeCompare(left.updatedAt) ||
        left.name.localeCompare(right.name),
    );

  if (draft) {
    const tagsValue = (draft.tags ?? []).join(", ");

    return (
      <section className="rp-recipe-builder-stack">
        <section className="rp-recipe-builder-heading panel">
          <div>
            <p className="eyebrow">
              Build a {draft.kind}
            </p>
            <h2>Compose it in whatever order makes sense.</h2>
            <p>
              Primitive items stay linked to the M11 library. Custom text
              exists only inside this recipe.
            </p>
          </div>
          <button className="secondary" onClick={() => setDraft(null)}>
            Back to recipes
          </button>
        </section>

        <section className="rp-recipe-editor panel">
          <div className="rp-recipe-editor-fields">
            <label>
              <span>Name</span>
              <input
                value={draft.name}
                placeholder={
                  draft.kind === "reward"
                    ? "Good Girl Night"
                    : "Accountability Lines"
                }
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    name: event.target.value,
                    updatedAt: new Date().toISOString(),
                  })
                }
              />
            </label>

            <label>
              <span>Tags</span>
              <input
                value={tagsValue}
                placeholder="care, ritual, short"
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    tags: event.target.value.split(","),
                    updatedAt: new Date().toISOString(),
                  })
                }
              />
            </label>
          </div>

          <div className="rp-recipe-component-list">
            <div className="rp-recipe-section-heading">
              <div>
                <p className="eyebrow">Ordered components</p>
                <h3>
                  {draft.components.length} component
                  {draft.components.length === 1 ? "" : "s"}
                </h3>
              </div>
            </div>

            {draft.components.length === 0 ? (
              <div className="rp-recipe-components-empty">
                Add a primitive or custom step below.
              </div>
            ) : (
              draft.components.map((component, index) => {
                const issue = validation?.issues.find(
                  (candidate) => candidate.componentIndex === index,
                );
                const primitive =
                  component.kind === "primitive"
                    ? getRewardPunishmentPrimitive(component.ref)
                    : undefined;

                return (
                  <article
                    className={
                      issue?.severity === "review"
                        ? "rp-recipe-component is-review"
                        : issue?.severity === "warning"
                          ? "rp-recipe-component is-warning"
                          : "rp-recipe-component"
                    }
                    key={
                      component.kind === "primitive"
                        ? `${rewardPunishmentPrimitiveKey(component.ref)}:${index}`
                        : component.id
                    }
                  >
                    <span className="rp-recipe-component-order">
                      {index + 1}
                    </span>
                    <div className="rp-recipe-component-copy">
                      <div>
                        <strong>{componentLabel(component)}</strong>
                        <span>
                          {component.kind === "custom"
                            ? "Custom · recipe only"
                            : primitive?.sourceType === "catalog"
                              ? "Catalog primitive"
                              : primitive
                                ? "Action primitive"
                                : "Missing primitive"}
                        </span>
                      </div>
                      {issue && <small>{issue.message}</small>}
                    </div>
                    <div className="rp-recipe-component-actions">
                      <button
                        className="text-button"
                        disabled={index === 0}
                        onClick={() => moveComponent(index, index - 1)}
                        aria-label={`Move ${componentLabel(component)} up`}
                      >
                        ↑
                      </button>
                      <button
                        className="text-button"
                        disabled={index === draft.components.length - 1}
                        onClick={() => moveComponent(index, index + 1)}
                        aria-label={`Move ${componentLabel(component)} down`}
                      >
                        ↓
                      </button>
                      <button
                        className="text-button"
                        onClick={() => removeComponent(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="rp-recipe-add-grid">
            <section className="rp-recipe-add panel">
              <div className="rp-recipe-section-heading">
                <div>
                  <p className="eyebrow">Add from library</p>
                  <h3>Catalog + action primitives</h3>
                </div>
              </div>

              <div className="rp-recipe-search-row">
                <input
                  type="search"
                  value={search}
                  placeholder="Search components…"
                  onChange={(event) => setSearch(event.target.value)}
                />
                <select
                  value={sourceFilter}
                  onChange={(event) =>
                    setSourceFilter(
                      event.target.value as
                        | "all"
                        | "catalog"
                        | "action",
                    )
                  }
                >
                  <option value="all">All sources</option>
                  <option value="catalog">Catalog</option>
                  <option value="action">Actions</option>
                </select>
              </div>

              <div className="rp-recipe-picker-list">
                {visiblePrimitives.map((primitive) => (
                  <button
                    type="button"
                    className="rp-recipe-picker-row"
                    key={rewardPunishmentPrimitiveKey(primitive.ref)}
                    onClick={() => addPrimitive(primitive)}
                  >
                    <div>
                      <strong>{primitive.label}</strong>
                      <span>
                        {primitive.sourceType === "catalog"
                          ? "Catalog"
                          : "Action"}
                        {primitiveCategories(primitive).length > 0
                          ? ` · ${primitiveCategories(primitive).join(" · ")}`
                          : ""}
                      </span>
                    </div>
                    <span>Add</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rp-recipe-add panel">
              <div className="rp-recipe-section-heading">
                <div>
                  <p className="eyebrow">Custom component</p>
                  <h3>Recipe-local text</h3>
                </div>
              </div>
              <p className="rp-recipe-helper-copy">
                This becomes one step in this recipe only. It does not create
                a new global catalog/action item.
              </p>
              <div className="rp-recipe-custom-row">
                <input
                  value={customText}
                  placeholder="e.g. verbal check-in afterward"
                  onChange={(event) => setCustomText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addCustom();
                    }
                  }}
                />
                <button
                  className="secondary compact"
                  disabled={!customText.trim()}
                  onClick={addCustom}
                >
                  Add
                </button>
              </div>

              <div className="rp-recipe-proposals">
                <div className="rp-recipe-section-heading compact">
                  <div>
                    <p className="eyebrow">Suggested to explore</p>
                    <h3>Profile-informed possibilities</h3>
                  </div>
                </div>

                {proposals.length === 0 ? (
                  <p className="rp-recipe-helper-copy">
                    No strong inferred suggestions right now.
                  </p>
                ) : (
                  proposals.map((proposal) => {
                    const primitive = getRewardPunishmentPrimitive(
                      proposal.ref,
                    );
                    if (!primitive) return null;
                    return (
                      <button
                        type="button"
                        className="rp-recipe-proposal"
                        key={rewardPunishmentPrimitiveKey(proposal.ref)}
                        onClick={() => addPrimitive(primitive)}
                      >
                        <div>
                          <strong>{primitive.label}</strong>
                          <span>
                            {proposal.band === "likely"
                              ? "Likely"
                              : "Possible"}
                            {" · "}
                            {Math.round(proposal.score * 100)}% fit
                          </span>
                        </div>
                        <span>Add</span>
                      </button>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          <label className="rp-recipe-notes">
            <span>Notes</span>
            <textarea
              value={draft.notes ?? ""}
              placeholder="Optional context for how this combination should work…"
              onChange={(event) =>
                setDraft({
                  ...draft,
                  notes: event.target.value,
                  updatedAt: new Date().toISOString(),
                })
              }
            />
          </label>

          <label className="rp-recipe-random">
            <input
              type="checkbox"
              checked={draft.randomEligible}
              disabled={validation?.needsReview}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  randomEligible: event.target.checked,
                  updatedAt: new Date().toISOString(),
                })
              }
            />
            <span>
              Allow this recipe in its random pool once recipe
              randomization is enabled
            </span>
          </label>

          {validation && validation.issues.length > 0 && (
            <div className="rp-recipe-validation">
              {validation.needsReview && (
                <strong>Needs review</strong>
              )}
              {validation.issues.map((issue, index) => (
                <p key={issue.code + ":" + index}>{issue.message}</p>
              ))}
            </div>
          )}

          <div className="rp-recipe-save-actions">
            <button
              className="primary"
              disabled={!validation?.canSave}
              onClick={saveDraft}
            >
              Save {draft.kind}
            </button>
            <button className="text-button" onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </section>
      </section>
    );
  }

  return (
    <section className="rp-recipes-stack">
      <section className="rp-recipes-heading panel">
        <div>
          <p className="eyebrow">Saved combinations</p>
          <h2>Build once. Reuse the shape later.</h2>
          <p>
            Recipes are definitions only. Nothing here tracks whether one was
            assigned, earned, owed, or completed.
          </p>
        </div>

        <div className="rp-recipes-build-actions">
          <button className="primary" onClick={() => start("reward")}>
            Build a reward
          </button>
          <button className="secondary" onClick={() => start("punishment")}>
            Build a punishment
          </button>
        </div>
      </section>

      {savedMessage && (
        <div className="rp-recipe-saved-message" role="status">
          {savedMessage}
        </div>
      )}

      {sortedRecipes.length === 0 ? (
        <section className="rp-recipes-empty panel">
          <p className="eyebrow">No saved recipes yet</p>
          <h2>Combine a few pieces into something reusable.</h2>
          <p>
            You can mix catalog items, M11 action ideas, and custom recipe-only
            text in any order.
          </p>
        </section>
      ) : (
        <div className="rp-recipe-card-grid">
          {sortedRecipes.map((recipe) => {
            const recipeValidation = validateRewardPunishmentRecipe(
              recipe,
              profile,
            );
            const componentPreview = recipe.components
              .slice(0, 4)
              .map(componentLabel);

            return (
              <article className="rp-recipe-card panel" key={recipe.id}>
                <div className="rp-recipe-card-top">
                  <span className="rp-source-badge">Recipe</span>
                  <span>{contextLabel(recipe.kind)}</span>
                </div>

                <h2>{recipe.name}</h2>

                {recipeValidation.needsReview && (
                  <div className="rp-recipe-review-badge">
                    Needs review
                  </div>
                )}

                <ol>
                  {componentPreview.map((label, index) => (
                    <li key={index}>{label}</li>
                  ))}
                </ol>
                {recipe.components.length > componentPreview.length && (
                  <p className="rp-recipe-more">
                    +{recipe.components.length - componentPreview.length} more
                  </p>
                )}

                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="rp-recipe-tags">
                    {recipe.tags.slice(0, 4).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                )}

                <div className="rp-recipe-card-actions">
                  <button className="secondary compact" onClick={() => edit(recipe)}>
                    Edit
                  </button>
                  <button className="text-button" onClick={() => duplicate(recipe)}>
                    Duplicate
                  </button>
                  <button className="text-button" onClick={() => removeRecipe(recipe)}>
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
