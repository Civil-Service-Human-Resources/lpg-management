export class HttpException extends Error {
	readonly data?: any
	readonly response?: { data?: any; status?: number }

	constructor(readonly url: string, readonly statusCode: number, data?: any) {
		super(`Resource with URL ${url} failed with a status code ${statusCode}`)
		this.data = data
		if (data !== undefined) {
			this.response = {
				status: statusCode,
				data,
			}
		}
	}
}
