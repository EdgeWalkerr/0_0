import React, { useState } from "react";
import StaticValue from "./staticValue";
import Context from "0i0";

export default function App() {
	const [num, setNum] = useState(0);
	const [staticValue, setStaticValue] = useState(0);
	return (
		<Context.Store
			value={{
				staticValue,
				num
			}}
		>
			<h2>{num}</h2>
			<button
				onClick={() => {
					setNum((num) => num + 1);
				}}
			>
				add one
      </button>
			<button
				onClick={() => {
					setStaticValue((staticValue) => staticValue + 1);
				}}
			>
				staticValue add one
      </button>
			<StaticValue />
		</Context.Store>
	);
}
