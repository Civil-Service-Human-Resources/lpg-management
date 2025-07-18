import { CacheableObject } from "lib/cacheableObject";
import { FormattedOrganisation } from "./FormattedOrganisation";

export class FormattedOrganisationList implements CacheableObject {
    constructor(
        public formattedOrganisationalUnitNames: FormattedOrganisation[]
    ) {}

    getId(): string {
        return this.formattedOrganisationalUnitNames.map(org => org.id).join(",");
    }
}