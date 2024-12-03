import {plainToClass} from 'class-transformer'
import {CacheableObjectCache} from '../lib/cacheableObjectCache'
import {Profile} from './model/profile'

export class ProfileCache extends CacheableObjectCache<Profile> {
	getBaseKey(): string {
		return 'civilServants'
	}

	protected convert(cacheHit: string): Profile {
		return plainToClass(Profile, cacheHit)
	}
}
