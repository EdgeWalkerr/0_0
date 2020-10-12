import React, { createContext, useState, useMemo } from "react";
import create, { UseStore } from "zustand";
import compareDeepSetShallow from "./compareDeepSetShallow";
import produce from "immer";

const Context = createContext({
	useSelector: (() => { }) as UseStore<any>,
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
		O_O: (
			data: Partial<T> | ((state: T) => Partial<T>),
			useCompareDeepSetShallow?: boolean
		) => {
			// 如果是function， 则使用immer进行set
			const state = useStore();
			if (typeof data === "function") {
				const newData = produce(state, data);
				set(
					useCompareDeepSetShallow
						? compareDeepSetShallow(state, newData)
						: newData
				);
			} else {
				set(
					[undefined, true].includes(useCompareDeepSetShallow)
						? compareDeepSetShallow(state, { ...state, ...data })
						: { ...state, ...data }
				);
			}
		}
	};
}

export default Context;
