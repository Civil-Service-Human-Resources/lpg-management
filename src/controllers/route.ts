import { Request, Response, NextFunction } from 'express'
import {validateEndpoint, ValidationOptions} from '../validators/validatorMiddleware'
const { xss } = require('express-xss-sanitizer')
import * as asyncHandler from 'express-async-handler'

export enum Method {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	DELETE = 'DELETE'
}

export interface Route {
	path: string
	method: Method
	handler: (req: Request, res: Response, next: NextFunction) => void | Promise<void>
	localMiddleware: ((req: Request, res: Response, next: NextFunction) => void)[]
}

export const basicRequest = (path: string,
							 method: Method,
							 handler: (req: Request, res: Response, next: NextFunction) => void,
							 middleware: ((req: Request, res: Response, next: NextFunction) => void)[] = [],
							 isAsync: boolean = true) => {
	const localMiddleware = [xss(), ...middleware]
	if (isAsync) {
		handler = asyncHandler(handler)
	}
	return {
		path,
		method,
		handler,
		localMiddleware
	}
}

export const getRequest = (path: string,
							handler: (req: Request, res: Response, next: NextFunction) => void,
							additionalMiddleware: ((req: Request, res: Response, next: NextFunction) => void)[] = [],
							isAsync: boolean = true): Route => {
	return basicRequest(path, Method.GET, handler, additionalMiddleware, isAsync)
}

export const postRequest = <T> (path: string,
									  handler: (req: Request, res: Response, next: NextFunction) => void,
									  validationOptions: ValidationOptions<T>,
									  additionalMiddleware: ((req: Request, res: Response, next: NextFunction) => void)[] = [],
									  isAsync: boolean = true): Route => {
	return basicRequest(path, Method.POST, handler,
		[
			validateEndpoint(validationOptions),
			...additionalMiddleware
		], isAsync)
}
