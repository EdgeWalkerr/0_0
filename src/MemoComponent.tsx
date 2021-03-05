import { memo, ReactElement } from 'react'
import { IEqual } from './type'

interface IPropType {
  children: ReactElement<any, any>
  deps: Record<string, any>
  equalFn?: IEqual
}

export const MemoComponent = memo(
  ({ children }: IPropType) => children,
  ({ deps: prevDeps = {} }, { deps = {}, equalFn = Object.is }) =>
    Object.keys(prevDeps).length === Object.keys(deps).length &&
    Object.keys(prevDeps).every(key => equalFn(prevDeps[key], deps[key]))
)
