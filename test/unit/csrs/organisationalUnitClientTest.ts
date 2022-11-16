import { expect } from "chai"
import Sinon = require("sinon")
import { OrganisationalUnitClient } from "../../../src/csrs/client/organisationalUnitClient"
import { OauthRestService } from "../../../src/lib/http/oauthRestService"

function getMockGetOrganisationsResponse(totalPages: number, organisationalUnitId: number) {
    return {
        "_embedded": {
            "organisationalUnits": [
                {
                    "id": organisationalUnitId
                }
            ]
        },
        "page": {
            "totalPages": totalPages
        }
    }
}

describe('organisationalUnitClient tests', () => {
    const restService = Sinon.createStubInstance(OauthRestService)
    let organisationalUnitClient: OrganisationalUnitClient

    beforeEach(() => {
        organisationalUnitClient = new OrganisationalUnitClient(restService as any)
    })
    
    describe('getAllOrganisationalUnits tests', () => {
        it('Should correctly paginate requests when fetching all organisations', async () => {
            restService.getWithAuthAndConfig.withArgs("/organisationalUnits", {
                params: { size: 1, page: 0} }).resolves(getMockGetOrganisationsResponse(2, 1))
            restService.getWithAuthAndConfig.withArgs("/organisationalUnits", {
                params: { size: 200, page: 0} }).resolves(getMockGetOrganisationsResponse(2, 2))
            restService.getWithAuthAndConfig.withArgs("/organisationalUnits", {
                params: { size: 200, page: 1} }).resolves(getMockGetOrganisationsResponse(2, 3))
            const response = await organisationalUnitClient.getAllOrganisationalUnits()
            expect(response.map(o => o.id)).to.eql([2,3])
        })
    })
})