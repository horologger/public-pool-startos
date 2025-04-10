import { setupExposeStore } from '@start9labs/start-sdk'

export type Store = {
  poolDisplayUrl: string | null
}

export const initStore: Store = {
  poolDisplayUrl: null,
}

export const exposedStore = setupExposeStore<Store>(() => [])
