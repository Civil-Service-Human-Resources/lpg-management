import {SearchFilterQuery} from '../../../controllers/models/searchFilterQuery'

export type costType = 'free'
export type typesType = 'face-to-face' | 'link' | 'online' | 'video'
export type statusType = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'
export type visibilityType = 'PRIVATE' | 'PUBLIC'

export class CourseSearchParams {
	constructor(
		public page: number,
		public size: number,
		public status?: statusType[],
		public visibility?: visibilityType[],
		public query?: string,
		public areasOfWork?: string[],
		public departments?: string[],
		public interests?: string[],
		public cost?: costType,
		public types?: typesType[]
	) {}
}

export function buildParams(query: SearchFilterQuery) {
	return new CourseSearchParams(
		query.p,
		10,
		query.status,
		query.visibility,
		query.q,
		[],
		[],
		[],
		query.cost,
		query.courseType
	)
}
