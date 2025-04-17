import { setupExposeStore } from '@start9labs/start-sdk'

export type Store = {
  stratumDisplayAddress: string | null
}

export const initStore: Store = {
  stratumDisplayAddress: null,
}

export const exposedStore = setupExposeStore<Store>(() => [])
