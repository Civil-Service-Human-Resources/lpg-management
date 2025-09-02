import {Request} from 'express'
import {CourseCompletionsSession} from './model/courseCompletionsSession'
import {plainToInstance} from 'class-transformer'

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
