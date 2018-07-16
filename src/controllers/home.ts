import {Request, Response} from 'express'

export class HomeController {
	public index() {
		return (request: Request, response: Response) => {
			response.render('page/index')
		}
	}
}
