import type { TActor } from '../models/character/t-actor'
import React, { createContext } from 'react'

export const ActorContext = createContext<TActor | undefined>(undefined)

export type ActorContextProps<T extends TActor> = {
  actor: T
}

export const useActor = () => React.useContext(ActorContext)
