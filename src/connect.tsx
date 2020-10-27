import React, { useContext } from 'react'
import isEqual from './isEqual'
import { ISelector } from './type'
import Context from './Context'

const connect: ISelector = (selector, equalFn = isEqual) => (
	Component: any
): any =>
	function Consumer<T>(props: T) {
		const state = useContext(Context)(selector, equalFn);
		return <Component {...props} {...state} />;
	};

export default connect;