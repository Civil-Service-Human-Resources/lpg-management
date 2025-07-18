import { plainToClass } from "class-transformer";
import {CacheableObjectCache} from '../lib/cacheableObjectCache'
import { FormattedOrganisationList } from "../csl-service/model/FormattedOrganisationList"

export class FormattedOrganisationListCache extends CacheableObjectCache<FormattedOrganisationList>{
    
    getBaseKey(): string {
        return "formattedOrganisationList";
    }

    async set(id: string | number, formattedOrganisationList: FormattedOrganisationList, ttlOverride?: number) {
        super.set(id, formattedOrganisationList, ttlOverride)
    }

    protected convert(cacheHit: string): FormattedOrganisationList {
        return plainToClass(FormattedOrganisationList, cacheHit)
    }
}