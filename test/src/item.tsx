import React, { useState } from "react";
import Num1 from "./num1";
import Num2 from "./num2";
import Context from "0i0";

export default function App() {
	const [num1, setNum1] = useState(0);
	const [num2, setNum2] = useState(0);
	return (
		<Context.Store
			value={{
				num1,
				setNum1,
				num2,
				setNum2
			}}
		>
			<div style={{ display: 'flex' }}>
				<Num1 />
				<Num2 />
			</div>
		</Context.Store>
	);
}
