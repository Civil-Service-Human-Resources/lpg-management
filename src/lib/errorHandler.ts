import {NextFunction, Request, Response} from 'express'
import * as log4js from 'log4js'

const logger = log4js.getLogger('controllers/home')

export async function handleError(error: Error, request: Request, response: Response, next: NextFunction) {
	try {
		logger.error('Error handling request for', request.method, request.url, request.body, '\n', error.stack)

		response.status(500)

		response.render('page/error')
	} catch (e) {
		console.error('Error handling error', error, e)
		next(e)
	}
}
