import { ReactNode, memo } from 'react'
import { useSelector } from '@/utils/0i0'
import { isArray, isPlainObject } from 'lodash'
import { IEqual, ISelectorPath } from '@/utils/0i0/type'

interface IPropType {
  children?: (props: any) => ReactNode
  selector: ISelectorPath
  equalFn?: IEqual
}

export const ContextComponent = memo(({ children, selector, equalFn }: IPropType) => {
  const params = useSelector(selector, equalFn)
  if (children === undefined && (isArray(selector) || isPlainObject(selector))) {
    console.warn(
      'ContextComponent: please do not use type array or object as path while children exist!'
    )
    return null
  }
  if (children) {
    return children(params)
  }

  return params
})
