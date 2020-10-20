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
type ISelector<T, U> = (
	selector: (state: U) => T,
	equalFn?: (obj1: T, obj2: T) => boolean
) => any;

function usePersistRef<T>(value: T) {
	const ref = useRef(null as any);
	ref.current = value;
	return ref;
}

const isEqual = (obj1: any, obj2: any) =>
	compareDeepSetShallow(obj1, obj2) === obj1;

const Context = createContext((() => ({})) as ISelector<any, any>);
const noop = () => { };
const selector = (
	valueRef: React.MutableRefObject<any>,
	listenerListRef: React.MutableRefObject<IListener[]>
): ISelector<any, any> => (selector: any, equalFn = isEqual) => {
	const [, setAccumulator] = useState(0);
	const forceUpdate = useCallback(() => {
		setAccumulator((n) => n + 1);
	}, []);
	const stateRef = useRef(selector(valueRef.current));
	const selectorRef = usePersistRef(selector);
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
