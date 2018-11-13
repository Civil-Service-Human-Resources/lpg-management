import {Invite} from '../invite'
import {LearnerRecordEventFactory} from './learnerRecordEventFactory'

export class InviteFactory {
	eventFactory: LearnerRecordEventFactory

	constructor(eventFactory: LearnerRecordEventFactory) {
		this.eventFactory = eventFactory

		this.create = this.create.bind(this)
	}

	create(data: any) {
		let invite: Invite = new Invite()

		invite.id = data.id
		invite.event = data.event
		invite.learnerEmail = data.learnerEmail

		return invite
	}
}
