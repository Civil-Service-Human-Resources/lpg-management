import * as config from '../config'
import * as log4js from 'log4js'
import {Auth} from '../identity/auth'
import {YoutubeRestService} from './youtubeRestService'
import {YoutubeConfig} from './youtubeConfig'
import {DateTime} from '../lib/dateTime'

const logger = log4js.getLogger('learning-catalogue/service/restService')

export class YoutubeService {
	youtubeConfig: YoutubeConfig
	_restService: YoutubeRestService
	public auth: Auth

	constructor(youtubeConfig: YoutubeConfig, auth: Auth) {
		this.youtubeConfig = youtubeConfig
		this.auth = auth

		this._restService = new YoutubeRestService(youtubeConfig, this.auth)
	}

	async getYoutubeResponse(url: string) {
		try {
			return await this._restService.get(
				`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json&key=${
					config.YOUTUBE_API_KEY
				}`
			)
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
		let resp

		try {
			resp = await this._restService.get(
				`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoID}&key=${
					config.YOUTUBE_API_KEY
				}`
			)
		} catch (err) {
			logger.error(`Error fetching metadata from YouTube: ${err}`)
			return
		}

		if (resp && resp.items && resp.items[0]) {
			return DateTime.parseDuration(resp.items[0].contentDetails.duration)
		}
	}
}
