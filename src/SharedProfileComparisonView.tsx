import {
  IconArrowsExchange,
  IconHeart,
  IconHelpCircle,
  IconPalette,
  IconShield,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import type {
  SharedCatalogItemComparison,
  SharedProfileComparison,
  SharedSemanticComplement,
} from "./lib/sharedProfileComparison";
import "./sharedProfileComparison.css";

type SharedProfileComparisonViewProps = {
  model: SharedProfileComparison;
  profileAName: string;
  profileBName: string;
};

const previewLimit = 6;

function CatalogMatchRow({
  item,
}: {
  item: SharedCatalogItemComparison;
}) {
  return (
    <article className="shared-match-row">
      <div className="shared-match-copy">
        <strong>{item.label}</strong>
        <span>{item.explanation}</span>
      </div>
    </article>
  );
}

function SemanticMatchRow({
  item,
  profileAName,
  profileBName,
}: {
  item: SharedSemanticComplement;
  profileAName: string;
  profileBName: string;
}) {
  return (
    <article className="shared-match-row shared-semantic-match">
      <div className="shared-semantic-pair" aria-label={item.explanation}>
        <span>
          <small>{profileAName}</small>
          <strong>{item.profileA.label}</strong>
        </span>
        <IconArrowsExchange size={17} stroke={1.8} aria-hidden="true" />
        <span>
          <small>{profileBName}</small>
          <strong>{item.profileB.label}</strong>
        </span>
      </div>
      <p>{item.explanation}</p>
    </article>
  );
}

function MoreRows({
  count,
  children,
}: {
  count: number;
  children: React.ReactNode;
}) {
  if (count <= 0) return null;

  return (
    <details className="shared-more">
      <summary>Show {count} more</summary>
      <div className="shared-more-list">{children}</div>
    </details>
  );
}

function CatalogSection({
  icon,
  eyebrow,
  title,
  description,
  items,
  emptyCopy,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  items: readonly SharedCatalogItemComparison[];
  emptyCopy: string;
}) {
  const visible = items.slice(0, previewLimit);
  const hidden = items.slice(previewLimit);

  return (
    <section className="shared-section panel">
      <header className="shared-section-heading">
        <span className="shared-section-icon" aria-hidden="true">
          {icon}
        </span>
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <strong className="shared-section-count">{items.length}</strong>
      </header>

      {visible.length > 0 ? (
        <div className="shared-match-list">
          {visible.map((item) => (
            <CatalogMatchRow key={item.catalogId} item={item} />
          ))}
          <MoreRows count={hidden.length}>
            {hidden.map((item) => (
              <CatalogMatchRow key={item.catalogId} item={item} />
            ))}
          </MoreRows>
        </div>
      ) : (
        <p className="shared-empty">{emptyCopy}</p>
      )}
    </section>
  );
}

export function SharedProfileComparisonView({
  model,
  profileAName,
  profileBName,
}: SharedProfileComparisonViewProps) {
  const mutual = model.catalogByState.mutual_positive;
  const directComplements = model.catalogByState.complementary;
  const explore = [
    ...model.catalogByState.mutual_curious,
    ...model.catalogByState.one_positive_one_curious,
  ];
  const different = model.catalogByState.different_context;
  const excluded = model.catalogByState.excluded;
  const unknown = model.catalogByState.unknown;
  const semanticPreview = model.semanticComplements.slice(0, previewLimit);
  const semanticHidden = model.semanticComplements.slice(previewLimit);
  const sharedFitCount =
    directComplements.length + model.semanticComplements.length;

  return (
    <section className="shared-comparison-stack">
      <header className="shared-comparison-hero panel">
        <div className="shared-comparison-title">
          <span className="shared-comparison-icon" aria-hidden="true">
            <IconUsers size={22} stroke={1.8} />
          </span>
          <div>
            <p className="eyebrow">Shared profile</p>
            <h1>
              {profileAName} <span>×</span> {profileBName}
            </h1>
            <p>
              This view compares two independent profiles. Shared results are
              derived for this pairing and never rewrite either person's
              profile.
            </p>
          </div>
        </div>

        <div className="shared-comparison-summary" aria-label="Comparison summary">
          <div>
            <strong>{mutual.length}</strong>
            <span>Both love / like</span>
          </div>
          <div>
            <strong>{sharedFitCount}</strong>
            <span>Complementary fits</span>
          </div>
          <div>
            <strong>{explore.length}</strong>
            <span>Maybe explore</span>
          </div>
          <div>
            <strong>{unknown.length}</strong>
            <span>Still unexplored</span>
          </div>
        </div>
      </header>

      <CatalogSection
        icon={<IconHeart size={20} stroke={1.8} />}
        eyebrow="Shared interest"
        title="We both love"
        description="Things both profiles directly marked as positive interests."
        items={mutual}
        emptyCopy="No mutual direct-positive interests yet. That can simply mean one or both profiles still need more direct preference data."
      />

      <section className="shared-section panel">
        <header className="shared-section-heading">
          <span className="shared-section-icon" aria-hidden="true">
            <IconArrowsExchange size={20} stroke={1.8} />
          </span>
          <div>
            <p className="eyebrow">Complementary fit</p>
            <h2>We fit together here</h2>
            <p>
              Direct activity-side matches plus validated headspace and dynamic
              relationships. A complement does not automatically assign a D/s
              orientation.
            </p>
          </div>
          <strong className="shared-section-count">{sharedFitCount}</strong>
        </header>

        {sharedFitCount > 0 ? (
          <div className="shared-fit-groups">
            {directComplements.length > 0 && (
              <div className="shared-fit-group">
                <span className="shared-fit-label">Activity matches</span>
                <div className="shared-match-list">
                  {directComplements.slice(0, previewLimit).map((item) => (
                    <CatalogMatchRow key={item.catalogId} item={item} />
                  ))}
                  <MoreRows
                    count={Math.max(0, directComplements.length - previewLimit)}
                  >
                    {directComplements.slice(previewLimit).map((item) => (
                      <CatalogMatchRow key={item.catalogId} item={item} />
                    ))}
                  </MoreRows>
                </div>
              </div>
            )}

            {model.semanticComplements.length > 0 && (
              <div className="shared-fit-group">
                <span className="shared-fit-label">Profile patterns</span>
                <div className="shared-match-list">
                  {semanticPreview.map((item) => (
                    <SemanticMatchRow
                      key={
                        item.mappingId +
                        ":" +
                        item.profileA.concept.id +
                        ":" +
                        item.profileB.concept.id
                      }
                      item={item}
                      profileAName={profileAName}
                      profileBName={profileBName}
                    />
                  ))}
                  <MoreRows count={semanticHidden.length}>
                    {semanticHidden.map((item) => (
                      <SemanticMatchRow
                        key={
                          item.mappingId +
                          ":" +
                          item.profileA.concept.id +
                          ":" +
                          item.profileB.concept.id
                        }
                        item={item}
                        profileAName={profileAName}
                        profileBName={profileBName}
                      />
                    ))}
                  </MoreRows>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="shared-empty">
            No complementary patterns are established yet. This is not a
            mismatch; the relevant sides or profile areas may simply be
            unexplored.
          </p>
        )}
      </section>

      <CatalogSection
        icon={<IconSparkles size={20} stroke={1.8} />}
        eyebrow="Possibilities"
        title="Maybe explore"
        description="Mutual curiosity and places where one person is positive while the other is curious."
        items={explore}
        emptyCopy="Nothing is currently in the shared exploration lane."
      />

      <CatalogSection
        icon={<IconPalette size={20} stroke={1.8} />}
        eyebrow="Different contexts"
        title="Different flavors"
        description="Both profiles have positive directional interest, but not in a directly complementary side pairing."
        items={different}
        emptyCopy="No different-context patterns are currently established."
      />

      <CatalogSection
        icon={<IconShield size={20} stroke={1.8} />}
        eyebrow="Boundaries"
        title="Not for shared suggestions"
        description="Anything explicitly excluded by either profile stays out of automatic shared suggestions."
        items={excluded}
        emptyCopy="No explicit shared-suggestion exclusions are currently established."
      />

      <section className="shared-unexplored panel">
        <details>
          <summary>
            <span className="shared-section-icon" aria-hidden="true">
              <IconHelpCircle size={20} stroke={1.8} />
            </span>
            <span>
              <strong>Still unexplored</strong>
              <small>
                Unknown means there is not enough direct evidence yet — not that
                the profiles disagree.
              </small>
            </span>
            <strong>{unknown.length}</strong>
          </summary>

          {unknown.length > 0 ? (
            <div className="shared-unexplored-list">
              {unknown.slice(0, 12).map((item) => (
                <CatalogMatchRow key={item.catalogId} item={item} />
              ))}
              {unknown.length > 12 && (
                <p className="shared-unexplored-note">
                  +{unknown.length - 12} more unknown items are intentionally
                  hidden here to keep comparison focused on useful signal.
                </p>
              )}
            </div>
          ) : (
            <p className="shared-empty">
              Both profiles currently have direct evidence across all compared
              catalog items.
            </p>
          )}
        </details>
      </section>
    </section>
  );
}
