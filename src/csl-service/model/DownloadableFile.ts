export class DownloadableFile {
	constructor(public filename: string, public data: Buffer) { }

	public getHeaders() {
		return {
			'Content-type': `application/${this.filename.split(".")[1]}`,
			'Content-disposition': `attachment;filename=${this.filename}`,
			'Content-length': this.data.length,
		}
	}
}
