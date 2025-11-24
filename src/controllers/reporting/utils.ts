import {Request} from 'express'
import {CourseCompletionsSession} from './model/courseCompletionsSession'
import {ClassConstructor, plainToInstance} from 'class-transformer'
import {ChooseOrganisationSession} from './model/chooseOrganisationSession'
import {getLogger} from '../../utils/logger'

const logger = getLogger("utils")

export class SessionableObjectService<T> {
	constructor(
		public key: string,
		public clazz: ClassConstructor<T>
	) {}
	fetchObjectFromSession(req: Request): T | undefined {
		logger.debug(`Fetching session object with key '${this.key}'`)
		return plainToInstance(this.clazz, req.session![this.key] as T)
	}

	saveObjectToSession(req: Request, object: T) {
		logger.debug(`Saving session object ${JSON.stringify(object)} with key '${this.key}'`)
		req.session![this.key] = object
	}

	deleteObjectFromSession(req: Request) {
		logger.debug(`Deleting session object with key '${this.key}'`)
		delete req.session![this.key]
	}
}

export function fetchCourseCompletionSessionObject(req: Request): CourseCompletionsSession {

	const completionsSession = req.session!.courseCompletions
	return completionsSession ? plainToInstance(CourseCompletionsSession,
		completionsSession as CourseCompletionsSession) : CourseCompletionsSession.create(req.user)
}

export function saveCourseCompletionSessionObject(sessionObject: CourseCompletionsSession, req: Request, cb: () => void): void {
	req.session!.courseCompletions = sessionObject
	req.session!.save(() => {
		cb()
	})
}

export function fetchChooseOrganisationSessionObject(req: Request): ChooseOrganisationSession {

	const chooseOrganisationsSession = req.session!.chooseOrganisations
	return chooseOrganisationsSession ? plainToInstance(ChooseOrganisationSession,
		chooseOrganisationsSession as ChooseOrganisationSession) : new ChooseOrganisationSession(req.user!.username, req.user!.fullName, req.user!.uid)
}

export function saveChooseOrganisationSessionObject(sessionObject: ChooseOrganisationSession, req: Request, cb: () => void): void {
	req.session!.chooseOrganisations = sessionObject
	req.session!.save(() => {
		cb()
	})
}
