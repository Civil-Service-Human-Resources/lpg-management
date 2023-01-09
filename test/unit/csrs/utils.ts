import { OrganisationalUnit } from "../../../src/csrs/model/organisationalUnit"

export function getOrg(orgName: string, formattedName: string, id: number, parentId?: number, abbrev?: string) {
    const org = new OrganisationalUnit()
    org.name = orgName
    org.formattedName = formattedName
    org.id = id
    if (parentId) {
        org.parentId = parentId
    }
    if (abbrev) {
        org.abbreviation = abbrev
    }
    return org
}