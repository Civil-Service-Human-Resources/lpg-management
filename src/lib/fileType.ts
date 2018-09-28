export function getFileModuleType(filename: string): string {
	if (filename.endsWith('.mp4')) {
		return 'video'
	} else if (filename.endsWith('.zip')) {
		return 'elearning'
	} else {
		return 'file'
	}
}
