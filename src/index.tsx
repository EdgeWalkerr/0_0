import React, { createContext, useState, useMemo } from "react";
import create, { UseStore } from "zustand";
import compareDeepSetShallow from "./compareDeepSetShallow";
import produce from "immer";

export const Context = createContext({
	useSelector: (() => { }) as UseStore<any>,
	O_O: (() => { }) as (
		data: Object | ((state: Object) => Object),
		useCompareDeepSetShallow?: boolean
	) => void
});

Context.Store = function ({ children, value }: any) {
	const [{ useSelector, O_O }] = useState(createStore(value));
	O_O(value, true);
	const newValue = useMemo(() => ({ useSelector, O_O }), []);
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
