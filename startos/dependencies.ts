import { envFile } from './file-models/env'
import { sdk } from './sdk'
import { config as mainnetConfig } from 'bitcoind-startos/startos/actions/config/other'
// @TODO update testnet import when available
import { config as testnetConfig } from 'bitcoind-startos/startos/actions/config/other'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const NETWORK = await envFile.read((e) => e.NETWORK).const(effects)
  if (!NETWORK) {
    throw new Error('No NETWORK, cannot set dependencies')
  }

  await sdk.action.createTask(
    effects,
    NETWORK === 'mainnet' ? 'bitcoind' : 'bitcoind-testnet',
    NETWORK === 'mainnet' ? mainnetConfig : testnetConfig,
    'critical',
    {
      input: { kind: 'partial', value: { zmqEnabled: true } },
      reason: 'Must enable ZMQ in Bitcoin to use it with Public Pool',
      when: { condition: 'input-not-matches', once: false },
    },
  )

  return NETWORK === 'mainnet'
    ? {
        bitcoind: {
          kind: 'running',
          versionRange: '^28.1.0',
          healthChecks: ['sync-progress'],
        },
      }
    : {
        'bitcoind-testnet': {
          kind: 'running',
          versionRange: '^28.1.0',
          healthChecks: ['sync-progress'],
        },
      }
})
