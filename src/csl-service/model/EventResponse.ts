export class EventResponse {
	constructor (public message: string,
	public courseTitle: string,
	public moduleTitle: string,
	public courseId: string,
	public moduleId: string,
	public eventId: string,
	public eventTimestamp: Date) {}
}
