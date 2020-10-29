import { IPath, IAtom } from "./type";

interface INode {
	value: Function[];
	next: INode[];
	prev: INode;
	key: IAtom;
}
const createNode = (value: Function[], key: IAtom): INode => {
	const emptyObject = Object.create(null);
	emptyObject.value = value;
	emptyObject.next = [];
	emptyObject.key = key;
	return emptyObject;
};

const split = (path: IAtom) => {
	if (typeof path === "number") {
		return {
			[path]: ""
		};
	} else {
		const splitPath = path.split(".");
		return splitPath.reduce(
			(result, _, index) => ({
				...result,
				[(index === 0 ? splitPath : splitPath.slice(0, -index)).join(".")]: ""
			}),
			{}
		);
	}
};

const createHashBidirectionalList = () => {
	const head = createNode([], "");
	const hashBidirectionalList: {
		bidirectionalList: INode;
		hashMap: Record<IAtom, INode>;
	} = {
		bidirectionalList: head,
		hashMap: {
			"": head
		}
	};

	const recursiveFindNode = (path: IAtom): INode => {
		if (path === "" || typeof path === "number") {
			return head;
		}
		if (hashBidirectionalList.hashMap[path]) {
			return hashBidirectionalList.hashMap[path];
		}
		return recursiveFindNode(path.split(".").slice(0, -1).join("."));
	};

	const insertNode = (path: IAtom, func: Function): void => {
		// 准确找到node, 如果没有则插入
		// 1. find the point to insert
		// 2. if the insert point has children, then need to check out if need to insert in one of these node
		if (hashBidirectionalList.hashMap[path]) {
			hashBidirectionalList.hashMap[path].value.push(func);
		} else {
			const newNode = createNode([func], path);
			hashBidirectionalList.hashMap[path] = newNode;
			const node = recursiveFindNode(path);
			const index = node.next.findIndex(({ key }) =>
				key.toString().includes(path.toString())
			);
			if (index === -1) {
				node.next.push(newNode);
			} else {
				const insertPoint = node.next[index];
				node[index] = newNode;
				newNode.next.push(insertPoint);
			}
		}
	};

	const deleteNode = (path: IAtom, func: Function): void => {
		// 准确找到node, 如果没有则插入
		// 1. find the point to insert
		// 2. if the insert point has children, then need to check out if need to insert in one of these node
		if (hashBidirectionalList.hashMap[path]) {
			const index = hashBidirectionalList.hashMap[path].value.findIndex(
				(certainFunc) => certainFunc === func
			);
			if (index !== -1) {
				hashBidirectionalList.hashMap[path].value.splice(index, 1);
			}
		}
	};

	const add = (path: IPath, func: Function): void => {
		if (typeof path === "string" || typeof path === "number") {
			insertNode(path, func);
		} else {
			path.forEach((certainPath) => {
				insertNode(certainPath, func);
			});
		}
	};
	const remove = (path: IPath, func: Function): void => {
		// 准确更具selector 找到相同的func， 并且删除
		if (typeof path === "string" || typeof path === "number") {
			deleteNode(path, func);
		} else {
			path.forEach((certainPath) => {
				deleteNode(certainPath, func);
			});
		}
	};

	// 给最终更改了state之后flush function 使用
	const collect = (pathList: IAtom[]): Function[] => {
		pathList = [
			...Object.keys(
				pathList.reduce(
					(result, certainPath) => ({ ...result, ...split(certainPath) }),
					{}
				)
			),
			""
		];
		return pathList.reduce((result, path) => {
			if (hashBidirectionalList.hashMap[path]?.value) {
				return [...result, ...hashBidirectionalList.hashMap[path].value];
			} else {
				return result;
			}
		}, []);
	};
	return {
		add,
		remove,
		collect
	};
};

export default createHashBidirectionalList;
