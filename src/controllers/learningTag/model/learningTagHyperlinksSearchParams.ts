import {learningTagContentType} from '../learningTagController'
import {ContentSearchParams} from './contentSearchParams'

export class LearningTagHyperlinksSearchParams extends ContentSearchParams {
    getContentType(): learningTagContentType {
        return 'hyperlinks'
    }
}
