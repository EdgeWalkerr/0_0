import { get, isEqual, set } from 'lodash'
import { IPath, IAtomPath, INode, IHashBidirectionalList } from './type'
import { filter } from './filter'
import typeOf from './typeOf'

export const recursiveFindNode = (
  hashBidirectionalList: IHashBidirectionalList,
  path: IAtomPath
): INode => {
  const splitPath = path.toString().split('.')
  while (path !== '') {
    if (hashBidirectionalList[path]) {
      return hashBidirectionalList[path]
    }
    splitPath.pop()
    path = splitPath.join('.')
  }
  return hashBidirectionalList['']
}

const createNode = ({ func, key }: { func?: Function; key: IAtomPath }): INode => {
  const emptyObject = Object.create(null)
  if (func) {
    emptyObject.value = [func]
  } else {
    emptyObject.value = []
  }
  emptyObject.next = []
  emptyObject.key = key
  return emptyObject
}

const createHashBidirectionalList = () => {
  const hashBidirectionalList: IHashBidirectionalList = {
    '': createNode({ key: '' }),
  }
  const insertNode = (path: IAtomPath, func: Function): void => {
    const node = hashBidirectionalList[path]
    // 如果有equalFn 然后是list的情况
    // 如果有equalFn 有default的情况
    // 如果没有equalFn, 是list的情况
    // 如果没有equalFn, 有default的情况
    if (node) {
      ;(node.value as Function[]).push(func)
    } else {
      const newNode = createNode({ func, key: path })
      const node = recursiveFindNode(hashBidirectionalList, path)
      hashBidirectionalList[path] = newNode
      const nodeList: INode[] = []
      node.next = node.next.filter(node => {
        if (node.key.toString().includes(path.toString())) {
          nodeList.push(node)
          return false
        }
        return true
      })
      if (nodeList.length === 0) {
        newNode.prev = node
        node.next.push(newNode)
      } else {
        node.next.push(newNode)
        newNode.prev = node
        newNode.next = nodeList
        nodeList.forEach(node => {
          node.prev = newNode
        })
      }
    }
  }

  const deleteNode = (path: IAtomPath, func: Function): void => {
    // 准确找到node, 如果没有则插入
    // 1. find the point to insert
    // 2. if the insert point has children, then need to check out if need to insert in one of these node
    if (hashBidirectionalList[path]) {
      const node = hashBidirectionalList[path]
      filter(node.value, func)
      if (node.value.length === 0) {
        const parent = hashBidirectionalList[path].prev
        if (parent !== undefined) {
          parent.next = parent.next.filter(({ key }) => key.toString() !== path.toString())
          hashBidirectionalList[path].next.forEach(node => {
            parent.next.push(node)
            node.prev = parent
          })
        }
        delete hashBidirectionalList[path]
      }
    }
  }

  const add = (path: IPath, func: Function): void => {
    if (typeof path === 'string' || typeof path === 'number') {
      insertNode(path, func)
    } else {
      path.forEach(certainPath => {
        insertNode(certainPath, func)
      })
    }
  }
  const remove = (path: IPath, func: Function): void => {
    // 准确更具selector 找到相同的func， 并且删除
    if (typeof path === 'string' || typeof path === 'number') {
      deleteNode(path, func)
    } else {
      path.forEach(certainPath => {
        deleteNode(certainPath, func)
      })
    }
  }

  // 给最终更改了state之后flush function 使用
  const collect = <T>(
    _oldData: T,
    _newData: T,
    resolvedPathSet: Set<IAtomPath>,
    funcSet: Set<Function>
  ): Set<Function> => {
    // 去除resolvedPathList中的内容，最后再组装到newData上
    // 每一次比较都将中间内容进行比较
    // 1.比较所有的分支， 将所有的中间分支合并起来赋值为
    const restore = removePath(_oldData, _newData, resolvedPathSet, path => {
      const node = recursiveFindNode(hashBidirectionalList, path)
      return node.next.length === 0
    })
    const nodeResolvedPathSet: Set<IAtomPath> = new Set()
    const collectHelper = <P>(oldData: P, newData: P, node: INode) => {
      if (oldData === newData) {
        return
      }
      if (node.next.length !== 0 && typeOf(oldData) === typeOf(newData)) {
        const restore = removePath(
          _oldData,
          _newData,
          new Set(node.next.map(({ key }) => key)),
          () => true
        )
        if (!isEqual(newData, oldData)) {
          // 将上方所有的path加进来
          while (node.prev) {
            nodeResolvedPathSet.add(node.prev.key)
            node = node.prev
          }
        }
        restore()
        node.next.forEach(certainNode => {
          const certainNodeOldData = get(_oldData, certainNode.key)
          const certainNodeNewData = get(_newData, certainNode.key)
          collectHelper(certainNodeOldData, certainNodeNewData, certainNode)
        })
      } else if (!isEqual(oldData, newData)) {
        nodeResolvedPathSet.add(node.key)
        const currentNode = node
        while (node.prev) {
          nodeResolvedPathSet.add(node.prev.key)
          node = node.prev
        }
        const resolveNextPath = (nodeList: INode[]): void => {
          if (nodeList.length === 0) {
            return
          }
          const _nodeList: INode[] = []
          nodeList.forEach(certainNode => {
            nodeResolvedPathSet.add(certainNode.key)
            _nodeList.push(...certainNode.next)
          })
          return resolveNextPath(_nodeList)
        }
        resolveNextPath([currentNode])
      }
    }
    collectHelper(_oldData, _newData, hashBidirectionalList[''])
    restore()
    nodeResolvedPathSet.forEach(path => {
      hashBidirectionalList[path].value.forEach(func => {
        funcSet.add(func)
      })
    })
    return funcSet
  }
  return {
    add,
    remove,
    collect,
  }
}

const removePath = (
  oldData: any,
  newData: any,
  pathSet: Set<IAtomPath>,
  judge: (path: IAtomPath) => boolean
) => {
  const reservedNewDataPathList: [IAtomPath, any][] = []
  const reservedOldDataPathList: [IAtomPath, any][] = []
  pathSet.forEach(path => {
    if (judge(path)) {
      reservedNewDataPathList.push([path, get(newData, path)])
      reservedOldDataPathList.push([path, get(oldData, path)])
      set(newData, path, undefined)
      set(oldData, path, undefined)
    }
  })
  return () => {
    reservedNewDataPathList.forEach(([path, value]) => {
      set(newData, path, value)
    })
    reservedOldDataPathList.forEach(([path, value]) => {
      set(oldData, path, value)
    })
  }
}

export default createHashBidirectionalList
