/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactComponentElement,
} from 'react'
import { usePersistCallback } from '@binance/hooks'
import { ISelector, IPath, IAtomPath, IEqual } from './type'
import Context from './Context'
import createHashBidirectionalList from './createHashBidirectionalList'
import typeOf from './typeOf'
import { createCustomEqualMap } from './createCustomEqualMap'

function usePersistRef<T>(value: T) {
  const ref = useRef(null as any)
  ref.current = value
  return ref
}

const getPathList = (selector: string | number): string[] => {
  if (typeof selector === 'string') {
    return selector.split('.')
  }
  return [selector.toString()]
}

const createSelector = (
  valueRef: React.MutableRefObject<any>,
  add: (path: IPath, func: Function, equalFn?: IEqual) => void,
  remove: (path: IPath, func: Function, equalFn?: IEqual) => void
): ISelector => (selector, equalFn) => {
  const [, setAccumulator] = useState(0)
  const forceUpdate = useCallback(() => {
    setAccumulator(n => n + 1)
  }, [])
  const selectorRef = usePersistRef(
    (() => {
      switch (typeOf(selector)) {
        case 'string':
        case 'number':
          return (state: any) =>
            (getPathList(selector.toString()) as string[]).reduce(
              (result, key) => result?.[key],
              state
            )
        case 'object':
          return (state: any) =>
            Object.keys(selector).reduce((result, key) => {
              result[key] = getPathList((selector as any)[key]).reduce(
                (result, key) => result?.[key],
                state
              )
              return result
            }, {} as Record<string, any>)

        default:
          return (state: any) =>
            (selector as IAtomPath[]).map(certainSelector =>
              getPathList(certainSelector).reduce((result, key) => result?.[key], state)
            )
      }
    })()
  )
  const stateRef = useRef(selectorRef.current(valueRef.current))
  useEffect(() => {
    const path = typeOf(selector) === 'object' ? Object.values(selector) : (selector as IPath)
    const func = (state: any) => {
      stateRef.current = selectorRef.current(state)
      forceUpdate()
    }
    add(path, func, equalFn)
    return () => {
      remove(path, func, equalFn)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceUpdate, selectorRef])
  return stateRef.current
}

export default function Provider({
  children,
  value,
}: {
  children: ReactComponentElement<any, any> | ReactComponentElement<any, any>[]
  value: any
}) {
  const valueRef = useRef(value)
  const hashBidirectionalList = useMemo(createHashBidirectionalList, [])
  const customEqualMap = useMemo(createCustomEqualMap, [])
  if (valueRef.current !== value) {
    const { funcSet, resolvedPathSet } = customEqualMap.collect(valueRef.current, value)
    const finalFuncSet = hashBidirectionalList.collect(
      valueRef.current,
      value,
      resolvedPathSet,
      funcSet
    )
    valueRef.current = value
    finalFuncSet.forEach(func => {
      func(valueRef.current)
    })
  }
  const add = usePersistCallback((path: IPath, func: Function, equalFn?: IEqual) => {
    if (equalFn) {
      return customEqualMap.add(path, func, equalFn)
    }
    return hashBidirectionalList.add(path, func)
  })
  const remove = usePersistCallback((path: IPath, func: Function, equalFn?: IEqual) => {
    if (equalFn) {
      return customEqualMap.remove(path, func, equalFn)
    }
    return hashBidirectionalList.remove(path, func)
  })
  const useSelector = usePersistCallback(createSelector(valueRef, add, remove))
  return useMemo(() => <Context.Provider value={useSelector}>{children}</Context.Provider>, [
    children,
    useSelector,
  ])
}
