import {approvedV2Slice} from "./approvedSlice";
import {reviewedCatalogExpansion} from "./reviewedExpansion";
import {additionalReviewedCatalog} from "./additionalReviewed";
import {composeCatalogV2,validateCatalogV2} from "./model";
import {withReviewedReferenceMetadata} from "./referenceMetadata";

/** One composed canonical universe supplies services, migration and validation. */
export const curatedCatalog=withReviewedReferenceMetadata(composeCatalogV2(
 approvedV2Slice,reviewedCatalogExpansion,additionalReviewedCatalog,
));
const errors=validateCatalogV2(curatedCatalog);
if(errors.length)throw new Error(`Invalid composed Catalog V2: ${errors.join("; ")}`);
