import React, { ReactComponentElement, ReactNode } from "react";
import { Provider } from ".";
import { MemoComponent } from "./MemoComponent";

export default function ProviderWithMemo({
	deps,
	children,
	...providerProps
}: {
	children: ReactComponentElement<any, any>;
	value: any;
	equalFn?: (obj1: any, obj2: any) => boolean;
	deps: any
}) {
	return (
		<Provider {...providerProps}>
			<MemoComponent deps={deps}>
				{children}
			</MemoComponent>
		</Provider>
	)
}