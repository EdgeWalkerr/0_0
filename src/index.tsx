import React, { createContext, useState, useMemo } from "react";
import create, { UseStore } from "zustand";
import compareDeepSetShallow from "./compareDeepSetShallow";

const Context = createContext({
	useSelector: (() => { }) as UseStore<any>
});

Context.Store = function ({ children, value, useCompareDeepSetShallow }: any) {
	const [{ useSelector, O_O }] = useState(createStore(value));
	O_O(value, useCompareDeepSetShallow);
	const newValue = useMemo(() => ({ useSelector }), []);
	return <Context.Provider value={newValue}>{children}</Context.Provider>;
} as any;

function createStore<T>(data: T) {
	let set: Function = () => { };
	const useStore = create((propsSet) => {
		set = propsSet;
		return data as any;
	});
	return {
		useSelector: useStore,
		O_O: (data: Partial<T>, useCompareDeepSetShallow?: boolean) => {
			const state = useStore();
			const oldData = Object.keys(data).reduce(
				(result, key) => ({ ...result, [key]: state[key] }),
				{}
			);
			const setData = [undefined, true].includes(useCompareDeepSetShallow)
				? compareDeepSetShallow(oldData, data)
				: data;
			if (
				Object.keys(oldData).length !== Object.keys(setData).length ||
				Object.keys(oldData).some((key) => oldData[key] !== setData[key])
			) {
				set({ ...state, ...setData });
			}
		}
	};
}

export default Context;