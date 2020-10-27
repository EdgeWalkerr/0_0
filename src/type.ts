export type ISelector = (
	selector: IPath | ((state: any) => any),
	equalFn?: (obj1: any, obj2: any) => boolean
) => any;

export type IPath = string | number | string[]