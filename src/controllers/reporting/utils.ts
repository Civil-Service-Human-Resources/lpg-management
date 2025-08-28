import {Request} from 'express'
import {CourseCompletionsSession} from './model/courseCompletionsSession'
import {plainToInstance} from 'class-transformer'
import {ChooseOrganisationSession} from './model/chooseOrganisationSession'

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
		chooseOrganisationsSession as ChooseOrganisationSession) : new ChooseOrganisationSession()
}

export function saveChooseOrganisationSessionObject(sessionObject: ChooseOrganisationSession, req: Request, cb: () => void): void {
	req.session!.chooseOrganisations = sessionObject
	req.session!.save(() => {
		cb()
	})
}
