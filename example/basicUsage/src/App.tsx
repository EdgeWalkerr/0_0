import React from "react";
import Item from "./item";

export default function App() {
  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <div>
        <Item />
        <Item />
      </div>
    </div>
  );
}
