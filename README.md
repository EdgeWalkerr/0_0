# 0i0

use redux like api, but achieve context like api nested in component

## demo

https://codesandbox.io/s/0i0-yq1n3

## how to use

### install

```bash
yarn add 0i0
```

#### it need a root just like Context

```tsx
import React, { useState } from "react";
import Num1 from "./num1";
import Num2 from "./num2";
import { Provider } from "0i0";

export default function App() {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  return (
    <Provider
      value={{
        num1,
        setNum1,
        num2,
        setNum2
      }}
    >
      <Num1 />
      <Num2 />
    </Provider>
  );
}
```

#### Select state in fuction component:

```tsx
import React, { memo } from "react";
import { useSelector } from "0i0";

function Num2() {
  console.log("i am rendering");
  const num2 = useSelector((state) => state.num2);
  const setNum2 = useSelector((state) => state.setNum2);
  return (
    <div>
      {num2}
      <button onClick={() => setNum2((num) => num + 1)}>num2 add one</button>
    </div>
  );
}

export default memo(Num2);
```

#### select state in class component:

```tsx
import React, { memo } from "react";
import { connect } from "0i0";

class Num1 extends React.Component {
  render() {
    console.log("i am rendering");
    const { num1, setNum1 } = this.props;
    return (
      <div>
        {num1}
        <button onClick={() => setNum1((num) => num + 1)}>
          {" "}
          num1 add one{" "}
        </button>
      </div>
    );
  }
}

export default memo(connect(({ num1, setNum1 }) => ({ num1, setNum1 }))(Num1));

```

### todo

- [ ] test case
- [ ] CICD
- [x] Fix  Cannot update a component problem

