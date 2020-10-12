import React, { memo, useContext } from "react";
import Context from "0i0";

function Num2() {
	console.log("i am rendering");
	const { useSelector } = useContext(Context);
	const num2 = useSelector((state: any) => state.num2);
	const setNum2 = useSelector((state: any) => state.setNum2);
	return (
		<div>
			{num2}
			<button onClick={() => setNum2((num: number) => num + 1)}>num2 add one</button>
		</div>
	);
}

export default memo(Num2);
