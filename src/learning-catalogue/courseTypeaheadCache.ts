import { plainToClass } from 'class-transformer';

import { Cache } from '../lib/redisCache';
import {CourseTypeAhead} from './courseTypeAhead'

export class CourseTypeAheadCache extends Cache<CourseTypeAhead> {

    TYPEAHEAD_KEY = "typeahead"

    getBaseKey(): string {
        return "courses"
    }

	protected convert(cacheHit: string): CourseTypeAhead {
		return plainToClass(CourseTypeAhead, cacheHit)
	}

    async getTypeahead(): Promise<CourseTypeAhead | undefined> {
        return await this.get(this.TYPEAHEAD_KEY)
    }

    async setTypeahead(typeahead: CourseTypeAhead, ttlOverride?: number) {
        await this.set(this.TYPEAHEAD_KEY, typeahead, ttlOverride)
    }

}
