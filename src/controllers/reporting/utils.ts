import {Request} from 'express'
import {CourseCompletionsSession} from './model/courseCompletionsSession'
import {plainToInstance} from 'class-transformer'

export function fetchCourseCompletionSessionObject(req: Request): CourseCompletionsSession | undefined {
	return req.session ? plainToInstance(CourseCompletionsSession,
		req.session.courseCompletions as CourseCompletionsSession) : undefined
}

export function saveCourseCompletionSessionObject(sessionObject: CourseCompletionsSession, req: Request, cb: () => void): void {
	req.session!.courseCompletions = sessionObject
	req.session!.save(() => {
		cb()
	})
}
