import React, { useMemo, createContext, useContext, useState } from "react";
import create from "zustand";
import compareDeepSetShallow from "./compareDeepSetShallow";
type ISelector<T, U> = (
	selector: (state: U) => T,
	equalFn?: (obj1: T, obj2: T) => boolean
) => any;

const Context = createContext((() => ({})) as ISelector<any, any>);

export function Provider({ children, value, useCompareDeepSetShallow }: any) {
	const [{ useSelector, O_O }] = useState(() => createStore(value));
	O_O(value, useCompareDeepSetShallow);
	return useMemo(() => <Context.Provider value={useSelector}>{children}</Context.Provider>, [children]);
}
const isEqual = (obj1, obj2) => compareDeepSetShallow(obj1, obj2) === obj1
export const useSelector: ISelector<any, any> = (selector, equalFn = isEqual) => {
	return useContext(Context)(selector, equalFn);
};

export const connect: ISelector<any, any> = (selector, equalFn = isEqual) => (Component: any): any => {
	return function Consumer<T>(props: T) {
		const state = useContext(Context)(selector, equalFn);
		return <Component {...props} {...state} />
	}
};

function createStore<T>(data: T) {
	let set: Function = () => { };
	const useStore = create((propsSet) => {
		set = propsSet;
		return data as any;
	});
	return {
		useSelector: useStore,
		O_O: (data: Partial<T>, useCompareDeepSetShallow = true) => {
			const state = useStore();
			const oldData = Object.keys(data).reduce(
				(result, key) => ({ ...result, [key]: state[key] }),
				{}
			);
			const setData = useCompareDeepSetShallow
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
