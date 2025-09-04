export class ReportType {
	constructor(public fileName: string) { }
}


export enum Report {
	BOOKING,
	LEARNER_RECORD,
	COURSE_COMPLETIONS,
	REGISTERED_LEARNERS
}
