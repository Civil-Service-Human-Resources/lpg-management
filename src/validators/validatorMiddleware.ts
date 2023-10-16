import {NextFunction, Request, Response} from 'express'
import {plainToInstance, ClassConstructor} from 'class-transformer'
import {validate} from 'class-validator'
import {ValidationErrorMapper} from '../learning-catalogue/validator/validationErrorMapper'
import {getLogger} from '../utils/logger'

const logger = getLogger("ValidationMiddleware")

export interface ValidationOptions<T> {
	dtoClass: ClassConstructor<T>,
	onError: {
		behaviour: BehaviourOnError,
		path?: string
	}
}

export enum BehaviourOnError {
	REDIRECT = 'REDIRECT',
	RENDER_TEMPLATE = 'RENDER_TEMPLATE'
}

export const validateEndpoint = <T> (opts: ValidationOptions<T>) => {
	return function (req: Request, res: Response, next: NextFunction) {
		logger.debug(`Validating request body ${JSON.stringify(req.body)} against class ${opts.dtoClass.name}`)
		const output: any = plainToInstance(opts.dtoClass, req.body)
		validate(output, { skipMissingProperties: true }).then(validationErrors => {
			if (validationErrors.length > 0) {
				logger.debug(validationErrors)
				const errors = ValidationErrorMapper.map(validationErrors)
				Object.keys(errors.fields).forEach(k => {
					const v = errors.fields[k]
					if (v.length > 1) {
						errors.fields[k] = [v[0]]
					}
				})

				if (opts.onError.behaviour === BehaviourOnError.REDIRECT) {
					let redirect = req.originalUrl
					if (opts.onError.path !== undefined) {
						for (const param in req.params) {
							redirect = redirect.replace(`:${param}`, req.params[param])
						}
					}
					req.session!.sessionFlash = {
						errors,
						form: req.body,
					}
					return req.session!.save(() => {
						res.redirect(redirect)
					})
				} else {
					if (!opts.onError.path) {
						throw new Error(`Template can't be blank when rendering after a validation error`)
					}
					res.status(400)
					res.render(opts.onError.path, {errors, form: req.body})
				}
			} else {
				console.log("No errors")
				res.locals.input = output;
				next();
			}
		});
	};
};
