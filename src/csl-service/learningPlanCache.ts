import {plainToClass} from 'class-transformer'
import {CacheableObjectCache} from '../lib/cacheableObjectCache'

export class LearningPlanCache extends CacheableObjectCache<any> {
	getBaseKey(): string {
		return 'learningPlan'
	}

	protected convert(cacheHit: string): {} {
		return plainToClass(Object, cacheHit)
	}
}
