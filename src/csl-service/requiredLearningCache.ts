import {plainToClass} from 'class-transformer'
import {CacheableObjectCache} from '../lib/cacheableObjectCache'

export class RequiredLearningCache extends CacheableObjectCache<any> {
    getBaseKey(): string {
        return 'requiredLearning'
    }

    protected convert(cacheHit: string): {} {
        return plainToClass(Object, cacheHit)
    }
}
