import {AgencyTokenCapacityUsed} from "./AgencyTokenCapacityUsed";

export class AgencyTokenCapacityUsedFactory {

    constructor() {
        this.create = this.create.bind(this)
    }

    public create(data: any): any {
        const agencyTokenCapacityUsed: AgencyTokenCapacityUsed = new AgencyTokenCapacityUsed()

        agencyTokenCapacityUsed.capacityUsed = data.capacityUsed

        return agencyTokenCapacityUsed
    }
}
