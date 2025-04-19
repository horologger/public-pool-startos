import { envFile } from './file-models/env'
import { sdk } from './sdk'
import { config as mainnetConfig } from 'bitcoind-startos/startos/actions/config/config'
// @TODO update testnet import when available
import { config as testnetConfig } from 'bitcoind-startos/startos/actions/config/config'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const { NETWORK, BITCOIN_ZMQ_HOST } = (await envFile.read.const(effects))!

  if (BITCOIN_ZMQ_HOST) {
    await sdk.action.request(
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
  }

  return NETWORK === 'mainnet'
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
