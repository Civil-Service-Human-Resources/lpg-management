import { OrganisationalUnit } from "./organisationalUnit";

export class OrganisationalUnitTypeAheadElement {
    constructor(
        public formattedName: string,
        public id: number,
        public agencyDomains: string[]
    ) {}
    
    public static fromOrgnaisationalUnit(o: OrganisationalUnit) {
        const agencyDomains = o.agencyToken ? o.agencyToken.agencyDomains.map(a => a.domain) : []
        return new OrganisationalUnitTypeAheadElement(o.formattedName!, o.id, agencyDomains)
    } 
    
}