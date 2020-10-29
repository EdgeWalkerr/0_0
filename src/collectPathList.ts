import typeOf from "./typeOf";
import { IAtom } from "./type";

const collectPathList = (data, newData, path = ""): string[] => {
	// 使用层次遍历的方式来执行
	if (data === newData) {
		return [];
	}
	if (typeOf(data) === typeOf(newData)) {
		switch (typeOf(data)) {
			case "object":
				return Object.keys(newData)
					.map((key) =>
						collectPathList(data[key], newData[key], concatPath(key, path))
					)
					.flat();

			case "array":
				return newData
					.map((_, index) =>
						collectPathList(
							data[index],
							newData[index],
							concatPath(index, path)
						)
					)
					.flat();

			default:
				return [path];
		}
	}
	return [path];
};

const concatPath = (key: IAtom, path: IAtom): string => {
	if (path === "") {
		return key.toString();
	} else {
		return `${path}.${key}`;
	}
};

export default collectPathList;
