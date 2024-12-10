import {Middleware} from './middleware'
import {Express} from 'express'
const appRoot = require('app-root-path')
const jsonpath = require('jsonpath')
import {ENV} from '../config'
import {DateTime} from '../lib/dateTime'
import {Duration} from 'moment'
import * as nunjucks from 'nunjucks'
import {OrganisationalUnit} from '../csrs/model/organisationalUnit'
import moment = require('moment')

export class NunjucksMiddleware extends Middleware {
    apply(app: Express): void {
		const env = nunjucks
			.configure([appRoot + '/views', appRoot + '/node_modules/govuk-frontend/govuk/', appRoot + '/node_modules/govuk-frontend/govuk/components'], {
				autoescape: true,
				noCache: ENV === 'development',
				express: app,
			})
		// Filters
		env.addFilter('jsonpath', function(path: string | string[], map: any) {
				return Object.is(path, undefined) ? undefined : Array.isArray(path) ? path.map(pathElem => jsonpath.value(map, pathElem)) : jsonpath.value(map, path)
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
		env.addFilter('formatDuration', function(duration: Duration) {
				let years = ''
				let months = ''
				if (duration.years()) {
					years = duration.years() + (duration.years() === 1 ? ' year ' : ' years ')
				}
				if (duration.months()) {
					months = duration.months() + (duration.months() === 1 ? ' month' : ' months')
				}

				return years + months
			})
		env.addFilter('parseOrganisation', function(organisationalUnits: OrganisationalUnit[], code: string) {
				return organisationalUnits.find(o => o.code === code)
			})
		env.addFilter('startsWith', (str: string, searchString: string) => {
				return str.startsWith(searchString)
			})

		// Globals
		env.addGlobal("datePlaceHolder", moment().format("DD MM YYYY"))

		app.set('view engine', 'html')
    }
    getName(): string {
        return 'NunjucksMiddleware'
    }

}
