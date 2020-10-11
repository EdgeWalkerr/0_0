import { range } from 'lodash'

const typeOf = (value) =>
	Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
export default function compareDeepSetShallow(data, newData) {
	// 使用层次遍历的方式来执行
	if (typeOf(data) === typeOf(newData)) {
		switch (typeOf(data)) {
			case 'object': {
				const currentData = Object.keys(newData).reduce((result, key) => { result[key] = compareDeepSetShallow(data[key], newData[key]); return result; }, {})
				return Object.keys(currentData).length === Object.keys(data).length && Object.keys(currentData).every((key) => currentData[key] === data[key]) ? data : currentData;
			}

			case 'array': {
				const currentData = range(newData.length).map((index) => compareDeepSetShallow(data[index], newData[index]))
				const a = currentData.length === data.length && currentData.every((_, index) => currentData[index] === data[index]) ? data : currentData;
				return a;
			}

			case 'map': {
				const currentData = getMapKeyList(newData).reduce((result, key) => {
					result.set(key, compareDeepSetShallow(data.get(key), newData.get(key)));
					return result;
				}, new Map());
				return getMapKeyList(currentData).length === getMapKeyList(data).length && getMapKeyList(currentData).every(key => currentData.get(key) === data.get(key)) ? data : currentData;
			}

			default:
				return newData;
		}
	}
	return newData
}

const getMapKeyList = (map) => {
	const keyList = [];
	map.forEach((_, key) => keyList.push(key));
	return keyList;
}
