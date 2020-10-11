import create from 'zustand'
import compareDeepSetShallow from "./compareDeepSetShallow";
import produce from 'immer'

export default function createContext<T>(data: T) {
	let set: Function = () => { };
	const useStore = create((propsSet) => {
		set = propsSet;
		return data as any;
	});
	return {
		useSelector: useStore,
		O_O: (data: Partial<T> | ((state: T) => Partial<T>), useCompareDeepSetShallow?: boolean) => {
			// 如果是function， 则使用immer进行set
			const state = useStore();
			if (typeof data === 'function') {
				const newData = produce(state, data);
				set(useCompareDeepSetShallow ? compareDeepSetShallow(state, newData) : newData);
			} else {
				set([undefined, true].includes(useCompareDeepSetShallow) ? compareDeepSetShallow(state, { ...state, ...data }) : { ...state, ...data });
			}
		}
	}
}