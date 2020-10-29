import React, { ElementType, useContext } from 'react'
import { ISelector } from './type'
import Context from './Context'

const connect: ISelector = (selector, deps = '') => (
	Component: ElementType<any>
): ElementType<any> =>
	function Consumer<T>(props: T) {
		const state = useContext(Context)(selector as any, deps);
		return <Component {...props} {...state} />;
	};

export default connect;