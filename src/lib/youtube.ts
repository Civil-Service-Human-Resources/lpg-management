import axios, {AxiosResponse} from 'axios'
import * as config from '../config'
import * as datetime from './datetime'

export interface BasicInfo {
	height: number
	id: string
	thumbnail_height: string
	thumbnail_url: string
	thumbnail_width: string
	title: string
	width: number
}

export async function getYoutubeResponse(url: string): Promise<AxiosResponse | undefined> {
	let response

	try {
		response = await axios.get(
			`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json&key=${config.YOUTUBE_API_KEY}`
		)
	} catch (err) {
		console.error(`Error fetching basic info from YouTube: ${err}`)
		return
	}

	return response
}

export function checkYoutubeResponse(response: AxiosResponse): Boolean {
	if (response.status !== 200) {
		return false
	}
	if (response.data.type !== 'video' && response.data.html) {
		return false
	}

	const suffix = response.data.html.split('embed/')[1]
	if (!suffix) {
		return false
	}
	const id = suffix.split('?')[0]
	if (!id) {
		return false
	}

	return true
}

export function getBasicYoutubeInfo(response: AxiosResponse): BasicInfo {
	const suffix = response.data.html.split('embed/')[1]
	const id = suffix.split('?')[0]

	return {
		height: response.data.height,
		id,
		thumbnail_height: response.data.thumbnail_height,
		thumbnail_url: response.data.thumbnail_url,
		thumbnail_width: response.data.thumbnail_width,
		title: response.data.title,
		width: response.data.width,
	}
}

export async function getDuration(videoID: string): Promise<number | undefined> {
	let resp
	try {
		resp = await axios.get(
			`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoID}&key=${
				config.YOUTUBE_API_KEY
			}`
		)
	} catch (err) {
		console.error(`Error fetching metadata from YouTube: ${err}`)
		return
	}
	if (resp.data && resp.data.items && resp.data.items[0]) {
		return datetime.parseDuration(resp.data.items[0].contentDetails.duration)
	}
}
