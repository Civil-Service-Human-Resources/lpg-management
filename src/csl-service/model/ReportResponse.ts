import {DownloadableFile} from './DownloadableFile'

export class ReportResponse {
	constructor(public code: number, public file: DownloadableFile | null) { }
}
