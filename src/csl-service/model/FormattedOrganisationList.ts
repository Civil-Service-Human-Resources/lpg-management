import { CacheableObject } from "lib/cacheableObject";
import { FormattedOrganisation } from "./FormattedOrganisation";
import {Type} from 'class-transformer'

export class FormattedOrganisationList implements CacheableObject {
    private _id: string
    @Type(() => FormattedOrganisation)
    public formattedOrganisations: FormattedOrganisation[]

    constructor(id: string, formattedOrganisations: FormattedOrganisation[]) {
        this._id = id
        this.formattedOrganisations = formattedOrganisations
    }

    getId(): string {
        return this._id
    }
}
