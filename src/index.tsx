/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
	useMemo,
	createContext,
	useContext,
	useState,
	useRef,
	useEffect,
	useCallback,
	ReactNode
} from "react";
import compareDeepSetShallow from "./compareDeepSetShallow";

type ISelector = (
	selector: atomType | atomType[] | ((state: any) => any),
	equalFn?: (obj1: any, obj2: any) => boolean
) => any;

function usePersistRef<T>(value: T) {
	const ref = useRef(null as any);
	ref.current = value;
	return ref;
}

const isEqual = (obj1: any, obj2: any) =>
	compareDeepSetShallow(obj1, obj2) === obj1;

type atomType = string | number;

const getPathList = (selector: atomType | atomType[]) => {
	switch (typeof selector) {
		case "string":
			return selector.split(".");

		case "number":
			return [selector];

		default:
			return selector;
	}
};

const Context = createContext((() => ({})) as ISelector);
const noop = () => { };
const createSelector = (
	valueRef: React.MutableRefObject<any>,
	listenerListRef: React.MutableRefObject<IListener[]>
): ISelector => (
	selector: atomType | atomType[] | ((state: any) => any),
	equalFn = isEqual
) => {
		const [, setAccumulator] = useState(0);
		const forceUpdate = useCallback(() => {
			setAccumulator((n) => n + 1);
		}, []);
		const selectorRef = usePersistRef(
			typeof selector === "function"
				? selector
				: (state: any) =>
					(typeof selector === "string" || typeof selector === "number"
						? getPathList(selector)
						: selector
					).reduce((result, key) => result?.[key], state)
		);
		const stateRef = useRef(selectorRef.current(valueRef.current));
		const equalFnRef = usePersistRef(equalFn);
		useEffect(() => {
			const num = listenerListRef.current.length;
			listenerListRef.current[num] = (state) => {
				const newState = selectorRef.current(state);
				const newEqualFn = equalFnRef.current || isEqual;
				if (!newEqualFn(stateRef.current, newState)) {
					stateRef.current = newState;
					forceUpdate();
				}
			};
			return () => {
				listenerListRef.current[num] = noop;
			};
		}, [forceUpdate, equalFn, equalFnRef, selectorRef]);
		return stateRef.current;
	};

type IListener = (state: any) => any;

export function Provider({
	children,
	value,
	equalFn = isEqual
}: {
	children: ReactNode;
	value: any;
	equalFn?: (obj1: any, obj2: any) => boolean;
}) {
	const valueRef = useRef(value);
	const listenerListRef = useRef([] as IListener[]);
	const equalFnRef = usePersistRef(equalFn);
	useEffect(() => {
		if (!equalFnRef.current(valueRef.current, value)) {
			valueRef.current = value;
			listenerListRef.current.forEach((listener) => {
				listener(valueRef.current);
			});
		}
	}, [value, equalFnRef]);
	const useSelector = useMemo(
		() => createSelector(valueRef, listenerListRef),
		[]
	);
	return useMemo(
		() => <Context.Provider value={useSelector}>{children}</Context.Provider>,
		[children, useSelector]
	);
}

export const useSelector: ISelector = (selector, equalFn = isEqual) =>
	useContext(Context)(selector, equalFn);

export const connect: ISelector = (selector, equalFn = isEqual) => (
	Component: any
): any =>
	function Consumer<T>(props: T) {
		const state = useContext(Context)(selector, equalFn);
		return <Component {...props} {...state} />;
	};
