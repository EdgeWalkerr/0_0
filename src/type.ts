export type ISelector = (selector: ISelectorPath, equalFn?: IEqual) => any

export type IAtomPath = string | number

export type IPath = IAtomPath | IAtomPath[]

export type ISelectorPath = IPath | Record<string, IAtomPath>

export type IEqual = (a: any, b: any) => boolean

export interface INode {
  value: Function[]
  next: INode[]
  prev?: INode
  key: IAtomPath
}

export type IHashBidirectionalList = Record<IAtomPath, INode>
