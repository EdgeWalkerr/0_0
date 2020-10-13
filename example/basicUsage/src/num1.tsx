import React, { memo } from "react";
import { connect } from "0i0";

class Num1 extends React.Component {
	render() {
		console.log("i am rendering");
		const { num1, setNum1 }: {
			num1: number, setNum1: (fn: (num: number) => number) => number
		} = this.props as any;
		return (
			<div>
				{num1}
				<button onClick={() => setNum1((num: number) => num + 1)}>
					num1 add one
				</button>
			</div>
		);
	}
}

export default memo(connect(({ num1, setNum1 }) => ({ num1, setNum1 }))(Num1));
