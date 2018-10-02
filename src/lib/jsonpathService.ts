const jsonpath = require('jsonpath')

export class JsonpathService {
	static setValue(json: any, path: string, value: any) {
		jsonpath.value(json, path, value)
	}

	static query(json: any, path: string) {
		return jsonpath.query(json, path)
	}

	static queryWithLimit(json: any, path: string, limit: number) {
		return jsonpath.query(json, path, limit)
	}
}
