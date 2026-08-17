import {TransformFnParams} from 'class-transformer'

export const transformStringArray = (params: TransformFnParams) => {
	if (typeof params.value === "string") {
		return [params.value]
	} else {
		return [...params.value]
	}
}