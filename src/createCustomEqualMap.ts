import { get } from 'lodash'
import { filter } from './filter'
import { IPath, IEqual, IAtomPath } from './type'

export const createCustomEqualMap = () => {
  const map: Record<string, Map<IEqual, Function[]>> = Object.create(null)
  const insertFunc = (path: IAtomPath, func: Function, equalFn: IEqual): void => {
    const pathFunc = map[path]
    if (pathFunc) {
      const pathEqualFunc = pathFunc.get(equalFn)
      if (pathEqualFunc) {
        pathEqualFunc.push(func)
      } else {
        pathFunc.set(equalFn, [func])
      }
    } else {
      map[path] = new Map([[equalFn, [func]]])
    }
  }
  const removeFunc = (path: IAtomPath, func: Function, equalFn: IEqual): void => {
    const pathFunc = map[path]
    if (pathFunc) {
      const pathEqualFunc = pathFunc.get(equalFn)
      if (pathEqualFunc) {
        filter(pathEqualFunc, func)
      }
    }
  }
  return {
    add: (path: IPath, func: Function, equalFn: IEqual) => {
      if (typeof path === 'string' || typeof path === 'number') {
        insertFunc(path, func, equalFn)
      } else {
        path.forEach(certainPath => {
          insertFunc(certainPath, func, equalFn)
        })
      }
    },
    remove: (path: IPath, func: Function, equalFn: IEqual) => {
      if (typeof path === 'string' || typeof path === 'number') {
        removeFunc(path, func, equalFn)
      } else {
        path.forEach(certainPath => {
          removeFunc(certainPath, func, equalFn)
        })
      }
    },
    collect: <T>(oldData: T, newData: T) => {
      const funcSet: Set<Function> = new Set()
      const resolvedPathSet: Set<IAtomPath> = new Set()
      Object.keys(map).forEach(path => {
        const oldDataCertainPathData = get(oldData, path)
        const newDataCertainPathData = get(newData, path)
        map[path].forEach((value, equalFn) => {
          if (!equalFn(oldDataCertainPathData, newDataCertainPathData)) {
            value.forEach(certainFunc => {
              funcSet.add(certainFunc)
            })
            resolvedPathSet.add(path)
          }
        })
      })
      return {
        funcSet,
        resolvedPathSet,
      }
    },
  }
}
