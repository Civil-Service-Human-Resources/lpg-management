import { OrganisationalUnit } from "../../../src/csrs/model/organisationalUnit"

export function getOrg(orgName: string, formattedName: string, id: number, parentId?: number) {
    const org = new OrganisationalUnit()
    org.name = orgName
    org.formattedName = formattedName
    org.id = id
    if (parentId) {
        org.parentId = parentId
    }
    return org
}