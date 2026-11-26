export type moduleType = 'face-to-face' |'link' | 'video' | 'elearning' | 'file'
export type courseType = moduleType & 'blended' | 'unknown'