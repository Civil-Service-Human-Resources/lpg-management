export const levels = ['AWARENESS', 'WORKING', 'PRACTITIONER', 'EXPERT'] as const

export type courseLevel =  typeof levels[number]