import { ISelector } from './type'
import isEqual from './isEqual'
import { useContext } from 'react'
import Context from './Context'

const useSelector: ISelector = (selector, equalFn = isEqual) =>
	useContext(Context)(selector, equalFn);

export default useSelector