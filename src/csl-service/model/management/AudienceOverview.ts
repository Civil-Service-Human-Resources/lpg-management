export type audienceType = 'OPEN' | 'REQUIRED_LEARNING'

export class AudienceOverview {
	id: string
	type: audienceType
	organisations: string[]
	grades: string[]
	areasOfWork: string[]
	interests: string[]
	requiredBy: string
	frequency: string
	name: string
}