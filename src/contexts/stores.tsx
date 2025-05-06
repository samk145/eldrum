import React, { type ComponentType } from 'react'
import type { Stores } from '../stores'

const StoresContext = React.createContext<Stores>({} as Stores)

interface IStoresProviderProps {
  stores: Stores
}

export const StoresProvider: React.FC<IStoresProviderProps & { children: React.ReactNode }> = ({
  children,
  stores
}) => {
  return <StoresContext.Provider value={stores}>{children}</StoresContext.Provider>
}

export const useStores = () => React.useContext(StoresContext)

export const useGameStore = () => {
  const { play } = useStores()

  if (!play.game) throw new Error('Game store is not initialized')

  return play.game
}

export const useConfig = () => {
  const { settings } = useStores()

  return settings.config
}

export type TWithStores = <P>(Component: ComponentType<P>) => (props: P) => JSX.Element

export const withStores: TWithStores = Component => props => {
  return <Component {...props} stores={useStores()} />
}

export const withGameStore: TWithStores = Component => props => {
  return <Component {...props} game={useGameStore()} />
}
