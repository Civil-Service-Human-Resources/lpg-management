import { Cache } from '../lib/cache/redisCache';
import {BasicCourse, CourseTypeAhead} from './courseTypeAhead'
import {FetchedRedisCache} from '../lib/cache/fetchedRedisCache'
import {EntityService} from './service/entityService'
import {Course} from './model/course'
import {DefaultPageResults} from './model/defaultPageResults'

export class CourseTypeAheadCache extends FetchedRedisCache<CourseTypeAhead> {

	constructor(cache: Cache<CourseTypeAhead>, private learningCatalogueClient: EntityService<Course>) {
		super(cache, "typeahead")
	}

	private async listPublishedCourses(page: number = 0, size: number = 10): Promise<DefaultPageResults<Course>> {
		return await this.learningCatalogueClient.listAllWithPagination(`/courses?page=${page}&size=${size}&visibility=PRIVATE&visibility=PUBLIC&status=PUBLISHED`)
	}

	async fetchResource(): Promise<CourseTypeAhead> {
		const courses: Course[] = []
		const response = await this.listPublishedCourses(0, 1)
		if (response.totalResults >= 1) {
			const totalPages = Math.ceil(response.totalResults / 200)
			const requests: any[] = []
			for (let page = 0; page < totalPages; page++) {
				requests.push(this.listPublishedCourses(page, 200)
					.then((data) => {
						courses.push(...data.results)
					}))
			}
			await Promise.all(requests)
		}
		return CourseTypeAhead.createAndSort(courses.map(c => new BasicCourse(c.id, c.title)))
    }

	async updateCourse(course: Course) {
		await this.update((typeahead: CourseTypeAhead) => {
			typeahead.updateCourse(course)
		})
	}

	async addCourse(course: Course) {
		await this.update((typeahead: CourseTypeAhead) => {
			typeahead.addCourse(course)
		})
	}

	async removeCourse(courseId: string) {
		await this.update((typeahead: CourseTypeAhead) => {
			typeahead.removeCourse(courseId)
		})
	}

}
