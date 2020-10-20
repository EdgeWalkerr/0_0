import React, {
	useMemo,
	createContext,
	useContext,
	useState,
	useRef,
	useEffect,
	useCallback
} from "react";
import compareDeepSetShallow from "./compareDeepSetShallow";
type ISelector<T, U> = (
	selector: (state: U) => T,
	equalFn?: (obj1: T, obj2: T) => boolean
) => any;

const isEqual = (obj1: any, obj2: any) =>
	compareDeepSetShallow(obj1, obj2) === obj1;

const Context = createContext((() => ({})) as ISelector<any, any>);
const noop = () => { };
const selector = (
	valueRef: React.MutableRefObject<any>,
	listenerListRef: React.MutableRefObject<IListener[]>
): ISelector<any, any> => (selector: any, equalFn: any) => {
	const [, setAccumulator] = useState(0);
	const forceUpdate = useCallback(() => {
		setAccumulator((n) => n + 1);
	}, []);
	const stateRef = useRef(selector(valueRef.current));
	const selectorRef = useRef(noop as any);
	selectorRef.current = selector;
	const equalFnRef = useRef(noop as any);
	equalFnRef.current = equalFn;
	useEffect(() => {
		const num = listenerListRef.current.length;
		listenerListRef.current[num] = (state) => {
			const newState = selectorRef.current(state);
			const newEqaulFn = equalFnRef.current || isEqual;
			if (!newEqaulFn(stateRef.current, newState)) {
				stateRef.current = newState;
				forceUpdate();
			}
		};
		return () => {
			listenerListRef.current[num] = noop;
		};
	}, [forceUpdate, equalFn]);
	return stateRef.current;
};

type IListener = (state: any) => any;

export function Provider({ children, value }: any) {
	const valueRef = useRef(value);
	const listenerListRef = useRef([] as IListener[]);
	useEffect(() => {
		if (compareDeepSetShallow(valueRef.current, value) !== valueRef.current) {
			valueRef.current = value;
			listenerListRef.current.forEach((listener) => {
				listener(valueRef.current);
			});
		}
	}, [value]);
	const useSelector = useMemo(() => selector(valueRef, listenerListRef), []);
	return useMemo(
		() => <Context.Provider value={useSelector}>{children}</Context.Provider>,
		[children, useSelector]
	);
}

export const useSelector: ISelector<any, any> = (
	selector,
	equalFn = isEqual
) => {
	return useContext(Context)(selector, equalFn);
};

export const connect: ISelector<any, any> = (selector, equalFn = isEqual) => (
	Component: any
): any => {
	return function Consumer<T>(props: T) {
		const state = useContext(Context)(selector, equalFn);
		return <Component {...props} {...state} />;
	};
};
