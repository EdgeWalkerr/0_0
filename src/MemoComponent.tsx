import compareDeepSetShallow from "./compareDeepSetShallow";
import { memo, ReactElement } from "react";

interface IPropType {
	children: ReactElement<any, any>;
	deps: any;
}

export const MemoComponent = memo(
	({ children }: IPropType) => children,
	({ deps: prevDeps }, { deps }) =>
		compareDeepSetShallow(deps, prevDeps) === deps
);
