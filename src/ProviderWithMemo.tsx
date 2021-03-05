import React, { ReactComponentElement } from 'react'
import { Provider } from '.'
import { MemoComponent } from './MemoComponent'
import { IEqual } from './type'

export default function ProviderWithMemo({
  children,
  value,
  ...restProps
}: {
  children: ReactComponentElement<any, any>
  value: any
  equalFn?: IEqual
  deps: Record<string, any>
}) {
  return (
    <Provider value={value}>
      <MemoComponent {...restProps}>{children}</MemoComponent>
    </Provider>
  )
}
