import { VersionGraph } from '@start9labs/start-sdk'
import { current, other } from './versions'
import { envDefaults } from '../utils'
import { envFile } from '../file-models/env'
import { store } from '../file-models/store.json'

export const versionGraph = VersionGraph.of({
  current,
  other,
  preInstall: async (effects) => {
    await envFile.write(effects, envDefaults)
    await store.write(effects, { stratumDisplayAddress: null })
  },
})
