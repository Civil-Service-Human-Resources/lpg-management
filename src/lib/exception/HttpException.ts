export class HttpException  extends Error {
	constructor(readonly url: string, readonly statusCode: number) {
		super(`Resource with URL ${url} failed with a status code ${statusCode}`)
	}
}
