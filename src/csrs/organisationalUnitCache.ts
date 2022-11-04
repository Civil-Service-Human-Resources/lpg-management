import { plainToClass, plainToInstance } from 'class-transformer';

import { Cache } from '../lib/redisCache';
import { OrganisationalUnit } from './model/organisationalUnit';
import { OrganisationalUnitTypeAhead } from './model/organisationalUnitTypeAhead';
import { OrganisationalUnitTypeAheadElement } from './model/organisationalUnitTypeAheadElement';

export class OrganisationalUnitCache extends Cache<OrganisationalUnit> {

    getBaseKey(): string {
        return "organisationalUnits"
    }

	protected convert(cacheHit: string): OrganisationalUnit {
		return plainToClass(OrganisationalUnit, cacheHit)
	}

    private getTypeaheadKey() {
        return `${this.getBaseKey()}:typeahead`
    }

    async removeFromTypeahead(organisationalUnitId: number) {
        const serialisedTypeahead = await this.getTypeaheadList()
        serialisedTypeahead.removeElement(organisationalUnitId)
        await this.setTypeaheadList(serialisedTypeahead)
    }

    async resetCache(orderedElems: OrganisationalUnit[]) {
        await this.redisClient.del(this.getTypeaheadKey())
        await Promise.all(orderedElems.map(async o => await this.set(o.id, o)))
        const typeahead = OrganisationalUnitTypeAhead.fromOrganisationalUnits(orderedElems)
        await this.setTypeaheadList(typeahead)
    }

    async insertToTypeahead(elementToAdd: OrganisationalUnitTypeAheadElement) {
        const serialisedTypeahead = await this.getTypeaheadList()
        serialisedTypeahead.insertAndSort(elementToAdd)
        await this.setTypeaheadList(serialisedTypeahead)
    }

    async setTypeaheadList(typeahead: OrganisationalUnitTypeAhead) {
        await this.redisClient.set(this.getTypeaheadKey(), JSON.stringify(typeahead))
    }

    async getTypeaheadList(): Promise<OrganisationalUnitTypeAhead> {
        const key = this.getTypeaheadKey()
        const existingTypeAhead = await this.redisClient.get(key)
        if (existingTypeAhead === null) {
            throw Error(`cache entry with key ${key} does not exist`)
        }
        return plainToInstance(OrganisationalUnitTypeAhead, existingTypeAhead)
    }

    // private async getAllTypeaheadKeys() {
    //     return await this.redisClient.lRange(this.getTypeaheadKey(), 0, -1)
    // }

    // async removeFromTypeahead(organisationalUnitId: number) {
    //     await this.redisClient.lRem(this.getTypeaheadKey(), 1, this.getFormattedKey(organisationalUnitId))
    // }

    // async resetCache(orderedElems: OrganisationalUnit[]) {
    //     await this.redisClient.del(this.getTypeaheadKey())
    //     await Promise.all(orderedElems.map(async o => await this.set(o.id, o)))
    //     const keysToinsert = orderedElems.map(o => this.getFormattedKey(o.id))
    //     for (let i = 0; i < keysToinsert.length; i+=50) {
    //         const chunk = keysToinsert.slice(i +50)
    //         await this.redisClient.lPush(this.getTypeaheadKey(), chunk)
    //     }
    // }
    
    // async addToTypeahead(elementToAdd: OrganisationalUnit) {
    //     const existingListKeys = await this.getAllTypeaheadKeys()
    //     for (let i = 0; i < existingListKeys.length; i++) {
    //         const key = existingListKeys[i]
    //         const organisation = await this.get(key)
    //         if (elementToAdd.formattedName!.localeCompare(organisation!.formattedName!) === -1) {
    //             await this.redisClient.lInsert(this.getTypeaheadKey(), "BEFORE", key, this.getFormattedKey(elementToAdd.id))
    //             break
    //         }
    //         if (i === existingListKeys.length-1) {
    //             await this.redisClient.lInsert(this.getTypeaheadKey(), "AFTER", key, this.getFormattedKey(elementToAdd.id))
    //             break
    //         }
    //     }

    // }

    // async getTypeahead(): Promise<OrganisationalUnitTypeAheadElement[] | undefined> {
    //     const typeahead: OrganisationalUnitTypeAheadElement[] = []
    //     const existingListKeys = await this.getAllTypeaheadKeys()
    //     for (let i = 0; i < existingListKeys.length; i++) {
    //         const key = existingListKeys[i]
    //         const organisation = await this.get(key)
    //         if (organisation === undefined) {
    //             return undefined
    //         }
    //         typeahead.push(OrganisationalUnitTypeAheadElement.fromOrgnaisationalUnit(organisation))
    //     }
    //     return typeahead
    // }

    async getOrgHierarchy (
        organisationId: number,
        hierarchy: OrganisationalUnit[] = []
    ): Promise<OrganisationalUnit[] | undefined> {
        const currentOrg = await this.get(organisationId)
        if (currentOrg !== undefined) {
            hierarchy.push(currentOrg)
            if (currentOrg.parentId && currentOrg.parentId !== 0) {
                return await this.getOrgHierarchy(currentOrg.parentId, hierarchy)
            }
            return hierarchy
        } else {
            return undefined
        }
    }
}
