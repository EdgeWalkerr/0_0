import typeOf from "./typeOf";

const compareDeepSetShallow = (data, newData) => {
	// 使用层次遍历的方式来执行
	if (data === newData) {
		return data;
	}
	if (typeOf(data) === typeOf(newData)) {
		switch (typeOf(data)) {
			case "object": {
				const currentData = Object.keys(newData).reduce((result, key) => {
					result[key] = compareDeepSetShallow(data[key], newData[key]);
					return result;
				}, {});
				return Object.keys(currentData).length === Object.keys(data).length &&
					Object.keys(currentData).every(
						(key) => currentData[key] === data[key]
					)
					? data
					: currentData;
			}

			case "array": {
				const currentData = newData.map((_, index) =>
					compareDeepSetShallow(data[index], newData[index])
				);
				return currentData.length === data.length &&
					currentData.every((_, index) => currentData[index] === data[index])
					? data
					: currentData;
			}

			default:
				return newData;
		}
	}
	return newData;
};

export default compareDeepSetShallow;
