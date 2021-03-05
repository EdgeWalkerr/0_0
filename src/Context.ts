import { createContext } from 'react'
import { ISelector } from './type'

const Context = createContext((() => ({})) as ISelector)

export default Context
