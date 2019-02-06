import {NextFunction, Request, Response} from 'express'
import {FormController} from './formController'

export function Validate(validationArgs: {fields: string[]; redirect: string}) {
	const substituteParams = (redirect: string, params: any) => {
		for (const param in params) {
			redirect = redirect.replace(`:${param}`, params[param])
		}

		return redirect
	}

	return (target: FormController, propertyKey: string, descriptor: any) => {
		const originalMethod = descriptor.value

		descriptor.value = function(...args: any[]) {
			const callback = originalMethod.apply(this, args)
			const validator = this.validator

			return async (request: Request, response: Response, next: NextFunction) => {
				const errors = await validator.check(request.body, validationArgs.fields)

				if (errors.size) {
					request.session!.sessionFlash = {
						errors,
						form: request.body,
					}

					return request.session!.save(() => {
						response.redirect(substituteParams(validationArgs.redirect, request.params))
					})
				} else {
					try {
						return await callback(request, response, next)
					} catch (e) {
						return next(e)
					}
				}
			}
		}

		return descriptor
	}
}
