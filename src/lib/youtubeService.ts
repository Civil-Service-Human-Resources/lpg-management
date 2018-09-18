import * as config from '../config'
import * as datetime from './datetime'
import {YoutubeConfig} from 'lib/youtubeConfig'
import * as log4js from 'log4js'
import axios, {AxiosInstance} from 'axios'

const logger = log4js.getLogger('learning-catalogue/service/restService')

export class YoutubeService {
	youtubeConfig: YoutubeConfig
	_http: AxiosInstance

	constructor(youtubeConfig: YoutubeConfig) {
		this.youtubeConfig = youtubeConfig

		this._http = axios.create()
	}

	async getYoutubeResponse(url: string) {
		try {
			return (await this._http.get(
				`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json&key=${
					config.YOUTUBE_API_KEY
				}`
			)).data
		} catch (err) {
			logger.error(`Error fetching metadata from YouTube: ${err}`)
		}
	}

	public checkYoutubeResponse(response: any): Boolean {
		if (response.type !== 'video' && response.html) {
			return false
		}

		const suffix = response.html.split('embed/')[1]
		if (!suffix) {
			return false
		}
		const id = suffix.split('?')[0]
		if (!id) {
			return false
		}

		return true
	}

	public getBasicYoutubeInfo(response: any) {
		const suffix = response.html.split('embed/')[1]
		const id = suffix.split('?')[0]

		return {
			height: response.height,
			id,
			thumbnail_height: response.thumbnail_height,
			thumbnail_url: response.thumbnail_url,
			thumbnail_width: response.thumbnail_width,
			title: response.title,
			width: response.width,
		}
	}

	async getDuration(videoID: string): Promise<number | undefined> {
		let response

		try {
			response = await this._http.get(
				`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoID}&key=${
					config.YOUTUBE_API_KEY
				}`
			)
		} catch (err) {
			logger.error(`Error fetching metadata from YouTube: ${err}`)
			return
		}

		if (response && response.data.items && response.data.items[0]) {
			return datetime.parseDuration(response.data.items[0].contentDetails.duration)
		}
	}
}
