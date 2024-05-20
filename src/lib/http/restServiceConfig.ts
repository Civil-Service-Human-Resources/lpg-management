export class RestServiceConfig {
	constructor(public url: string,
				public timeout: number,
				public detailedLogs: boolean = true) {
	}
}
