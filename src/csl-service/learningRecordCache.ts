import {plainToClass} from 'class-transformer'
import {CacheableObjectCache} from '../lib/cacheableObjectCache'

export class LearningRecordCache extends CacheableObjectCache<any> {
    getBaseKey(): string {
        return 'learningRecord'
    }

    protected convert(cacheHit: string): {} {
        return plainToClass(Object, cacheHit)
    }
}
