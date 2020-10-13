import React, { memo } from "react";
import { useSelector } from "0i0";

function Num1() {
	console.log("i am rendering");
	const num1 = useSelector((state) => state.num1);
	const setNum1 = useSelector((state) => state.setNum1);
	return (
		<div>
			{num1}
			<button onClick={() => setNum1((num: number) => num + 1)}> num1 add one </button>
		</div>
	);
}

export default memo(Num1);
