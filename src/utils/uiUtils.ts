const jsonpath = require('jsonpath')
import {Request} from 'express'

export function geti18n(request: Request, root: string, path: string) {
	const fullPath = `${root}.${path}`
	let result = 'UNKNOWN'
	try {
		// @ts-ignore
		result =  jsonpath.value(request.i18n_texts, fullPath) || 'UNKNOWN'
	} catch (e) {
		return result
	}
}