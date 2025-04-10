import { envFile } from './file-models/env'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const network = (await envFile.read.const(effects))?.NETWORK || 'mainnet'

  return network === 'mainnet'
    ? {
        bitcoind: {
          kind: 'running',
          versionRange: '>28.1.0',
          healthChecks: ['synced'],
        },
      }
    : {
        'bitcoind-testnet': {
          kind: 'running',
          versionRange: '>28.1.0',
          healthChecks: ['synced'],
        },
      }
})
