import {Middleware} from './middleware'
import {Express} from 'express'
import {ENV, NSG_URL} from '../config'
import {DateTime} from '../lib/dateTime'
import * as nunjucks from 'nunjucks'
import {levels} from '../learning-catalogue/model/courseLevel'

const appRoot = require('app-root-path')
const jsonpath = require('jsonpath')
import moment = require('moment')
import _ = require('lodash')

export class NunjucksMiddleware extends Middleware {
    apply(app: Express): void {
		const env = nunjucks
			.configure([appRoot + '/views', appRoot + '/node_modules/govuk-frontend/govuk/', appRoot + '/node_modules/govuk-frontend/govuk/components'], {
				autoescape: true,
				noCache: ENV === 'development',
				express: app,
			})
		const exampleYear = new Date(Date.now()).getFullYear() + 1
		env.addGlobal('exampleYear', exampleYear)
		// Filters
		env.addFilter('appendIdPrefix', (value: string, idPrefix?: string) => {
			if (idPrefix) {
				value = idPrefix + _.capitalize(value)
			}
			return value
		})
		env.addFilter('jsonpath', function(path: string | string[], map: any) {
				const resolve = (p: string) => {
					if (!p || typeof p !== 'string') {
						return p
					}
					try {
						return jsonpath.value(map, p) || p
					} catch (e) {
						return p
					}
				}
				return Object.is(path, undefined) ? undefined : Array.isArray(path) ? path.map(pathElem => resolve(pathElem)) : resolve(path)
			})
		env.addFilter('formatDate', function(date: Date) {
				return date
					? moment(date)
						.local()
						.format('D MMMM YYYY')
					: null
			})
		env.addFilter('formatDateShort', function(date: Date) {
				return date
					? moment(date)
						.local()
						.format('D MMM YYYY')
					: null
			})
		env.addFilter('dateWithMonthAsText', function(date: string) {
				return date ? DateTime.convertDate(date) : 'date unset'
			})
		env.addFilter('formatDuration', function(durationInSeconds: number) {
				return DateTime.formatDuration(durationInSeconds)
			})
		env.addFilter('startsWith', (str: string, searchString: string) => {
				return str.startsWith(searchString)
			})

		// Globals
		env.addGlobal("datePlaceHolder", moment().format("DD MM YYYY"))
		env.addGlobal('courseLevels', levels)
		app.engine('html', nunjucks.render);
		app.engine('njk', nunjucks.render);
		app.set('view engine', 'html')
		env.addGlobal('NSG_URL', NSG_URL)
    }
    getName(): string {
        return 'NunjucksMiddleware'
    }

}
