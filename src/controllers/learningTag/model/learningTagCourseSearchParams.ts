import {learningTagContentType} from '../learningTagController'
import {ContentSearchParams} from './contentSearchParams'

export class LearningTagCourseSearchParams extends ContentSearchParams {
    getContentType(): learningTagContentType {
        return 'courses'
    }
}