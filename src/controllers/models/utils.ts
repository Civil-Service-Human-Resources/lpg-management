import {TransformFnParams} from 'class-transformer'

export function stringToArrayTransformer() {
	return (params: TransformFnParams) => {
		if (typeof params.value === 'string') {
			return [params.value]
		} else {
			return [...params.value]
		}
	}
}
