import React, { memo, useContext } from "react";
import Context from "0i0";

function Num1() {
	console.log("i am rendering");
	const { useSelector } = useContext(Context);
	const num1 = useSelector((state: any) => state.num1);
	const setNum1 = useSelector((state: any) => state.setNum1);
	return (
		<div>
			{num1}
			<button onClick={() => setNum1((num: number) => num + 1)}> num1 add one </button>
		</div>
	);
}

export default memo(Num1);
