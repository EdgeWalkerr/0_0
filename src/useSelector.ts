import { ISelector } from "./type";
import { useContext } from "react";
import Context from "./Context";

const useSelector: ISelector = (selector, deps = "") =>
	useContext(Context)(selector as any, (deps = ""));

export default useSelector;
