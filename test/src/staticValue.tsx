import React, { memo, useContext } from "react";
import Context from "0i0";

function StaticValue() {
	console.log("i am rendering");
	const { useSelector } = useContext(Context);
	const staticValue = useSelector((state: any) => state.staticValue);
	return <div>{staticValue}</div>;
}

export default memo(StaticValue);
