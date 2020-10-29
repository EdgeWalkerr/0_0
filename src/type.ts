export type ISelector = (
	selector: ISelectorPath | ((state: any) => any),
	deps?: IPath
) => any;

export type IAtom = string | number;

export type IPath = IAtom | IAtom[]

export type ISelectorPath = IPath | Record<string, IAtom>
