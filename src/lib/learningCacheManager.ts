import { RequiredLearningCache } from 'src/csl-service/requiredLearningCache'
import { LearningPlanCache } from 'src/csl-service/learningPlanCache'
import { LearningRecordCache } from 'src/csl-service/learningRecordCache'

export class LearningCacheManager {
    private requiredLearningCache: RequiredLearningCache
    private learningPlanCache: LearningPlanCache
    private learningRecordCache: LearningRecordCache

    constructor(requiredLearningCache: RequiredLearningCache,
                learningPlanCache: LearningPlanCache,
                learningRecordCache: LearningRecordCache) {
        this.requiredLearningCache = requiredLearningCache
        this.learningPlanCache = learningPlanCache
        this.learningRecordCache = learningRecordCache
    }

    clearLearningCache(){
        this.requiredLearningCache.deleteAllIds()
		this.learningPlanCache.deleteAllIds()
		this.learningRecordCache.deleteAllIds()
    }
}