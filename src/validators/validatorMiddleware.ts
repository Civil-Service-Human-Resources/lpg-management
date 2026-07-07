import {NextFunction, Request, Response} from 'express'
import {ClassConstructor, plainToInstance} from 'class-transformer'
import {getLogger} from '../utils/logger'
import {validateAndMapErrors} from './util'
import {SubmittableForm} from '../controllers/models/submittableForm'

const logger = getLogger("ValidationMiddleware")

export interface ValidationOptions<T extends SubmittableForm> {
	dtoClass: ClassConstructor<T>,
	groups?: string[],
	onError: {
		behaviour: BehaviourOnError,
		path?: string,
		pageModelKey?: string,
		routerFunction?: (req: Request, res: Response, next: NextFunction) => void
	}
}

export enum BehaviourOnError {
	REDIRECT, /* Redirect to a specific endpoint */
	RENDER_TEMPLATE /* Render a template */,
	SET_LOCALS /* Set the pageModel and errors on the res.locals object and continue */,
	ROUTER_FUNCTION /* Set the pageModel and errors on the res.locals object and call a specific router function */
}

export const validateEndpoint = <T extends SubmittableForm> (opts: ValidationOptions<T>) => {
	return async function (req: Request & {i18n_texts: Object}, res: Response, next: NextFunction) {
		logger.debug(`Validating request body ${JSON.stringify(req.body)} against class ${opts.dtoClass.name}`)
		const output: T = plainToInstance(opts.dtoClass, req.body)
		if (req.body !== undefined) {
			const errors = await validateAndMapErrors(output, opts.groups)
			if (errors !== undefined) {
				logger.debug(errors)
				Object.keys(errors.fields).forEach(k => {
					const v = errors.fields[k]
					if (v.length > 1) {
						errors.fields[k] = [v[0]]
					}
				})

				const pageModelKey = opts.onError.pageModelKey ? opts.onError.pageModelKey : 'pageModel'
				output.errors = errors
				if (opts.onError.behaviour === BehaviourOnError.REDIRECT) {
					let redirect = req.originalUrl
					if (opts.onError.path !== undefined) {
						for (const param in req.params) {
							opts.onError.path = opts.onError.path.replace(`:${param}`, req.params[param])
						}
						redirect = opts.onError.path
					}
					req.session!.sessionFlash = {
						errors
					}
					req.session![pageModelKey] = output
					return req.session!.save(() => {
						res.redirect(redirect)
					})
				} else if (opts.onError.behaviour === BehaviourOnError.SET_LOCALS) {
					res.locals.input = output;
					next()
				} else if (opts.onError.behaviour === BehaviourOnError.ROUTER_FUNCTION) {
					res.locals.input = output;
					if (!opts.onError.routerFunction) {
						throw new Error(`Router function can't be blank when rendering after a validation error`)
					}
					opts.onError.routerFunction(req, res, next)
				} else {
					if (!opts.onError.path) {
						throw new Error(`Template can't be blank when rendering after a validation error`)
					}
					res.status(400)
					res.render(opts.onError.path, {errors, [pageModelKey]: output})
				}
			} else {
				logger.debug('Request body is valid')
				res.locals.input = output;
				next();
			}
		} else {
			logger.warn('Request body was null, skpping validation')
			next()
		}
	};
};
