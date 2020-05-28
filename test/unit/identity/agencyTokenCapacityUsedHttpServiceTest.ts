import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {AgencyTokenCapacityUsedHttpService} from '../../../src/identity/agencyTokenCapacityUsedHttpService'
import {AgencyTokenCapacityUsed} from '../../../src/identity/model/AgencyTokenCapacityUsed'
import {IdentityService} from '../../../src/identity/identityService'
import {IdentityConfig} from '../../../src/identity/identityConfig'
import {Auth} from '../../../src/identity/auth'
import {PassportStatic} from 'passport'
import {AuthConfig} from '../../../src/identity/authConfig'
import {describe, it} from 'mocha'
import {OauthRestService} from 'lib/http/oauthRestService'
import * as sinonChai from "sinon-chai";
//import {Identity} from "../../../src/identity/identity";
import {EntityService} from "../../../src/learning-catalogue/service/entityService";
//import {AgencyTokenCapacityUsedFactory} from "../../../src/identity/model/AgencyTokenCapacityUsedFactory";
import {Identity} from "../../../src/identity/identity";
//import {EntityService} from '../../../src/learning-catalogue/service/entityService'
import {AgencyTokenCapacityUsedFactory} from '../../../src/identity/model/AgencyTokenCapacityUsedFactory'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('AgencyTokenCapacityUsedHttpService tests...', function() {
    let auth: Auth
    let passportStatic: PassportStatic = <PassportStatic>{}
    let identityService: IdentityService = <IdentityService>{}
    let identityConfig: IdentityConfig = <IdentityConfig>{}
    let restService: OauthRestService
    let agencyTokenCapacityUsedHttpService: AgencyTokenCapacityUsedHttpService
    let _agencyTokenCapacityUsedHttpService: EntityService<AgencyTokenCapacityUsed>

    const clientId = 'clientId'
    const clientSecret = 'secret'
    const authenticationServiceUrl: string = 'authentication-service-url'
    const callbackUrl = 'callback-url'
    const authenticationPath = 'authentication-path'

    beforeEach(function() {
        //restService.auth.currentUser.accessToken = 'test-token'
      //  restService.get()
        _agencyTokenCapacityUsedHttpService = new EntityService<AgencyTokenCapacityUsed>(restService, new AgencyTokenCapacityUsedFactory())

        restService = <OauthRestService>{}
        identityConfig = new IdentityConfig(authenticationServiceUrl)
        const config = new AuthConfig(clientId, clientSecret, authenticationServiceUrl, callbackUrl, authenticationPath)
        auth = new Auth(config, passportStatic, identityService)
        auth.currentUser = new Identity('abc123', ['ROLE1', 'ROLE2'], 'test-token')
        agencyTokenCapacityUsedHttpService = new AgencyTokenCapacityUsedHttpService(identityConfig, auth)
    })

    describe('#getCapacityUsed', () => {
        it('should get capacity used data', async () => {
          //  const token: string = 'test-token'
            const data = new AgencyTokenCapacityUsed();
            data.capacityUsed = '5'
            _agencyTokenCapacityUsedHttpService.get = sinon.stub()
                /*.withArgs(`/oauth/resolve`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })*/
                .returns(data)

            const result = await agencyTokenCapacityUsedHttpService.getCapacityUsed('abc123')

            expect(_agencyTokenCapacityUsedHttpService.get).to.have.been.calledOnceWith('/agency/abc123')
            expect(result).to.eql(data)
        })
    })

})
