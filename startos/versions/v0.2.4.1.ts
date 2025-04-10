import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { load } from 'js-yaml'
import { envFile } from '../file-models/env'
import { readFile, rmdir } from 'fs/promises'
import { envDefaults, mainnet, testnet } from '../utils'
import { sdk } from '../sdk'

export const v_0_2_4_1 = VersionInfo.of({
  version: '0.2.4:1',
  releaseNotes: 'Revamped for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {
      // get old config.yaml
      const {
        'zmq-enabled': zmqEnabled,
        'pool-identifier': POOL_IDENTIFIER,
        'pool-address': poolDisplayUrl,
        bitcoind: { type },
      } = load(await readFile('/root/start9/config.yaml', 'utf-8')) as {
        'zmq-enabled': boolean
        'pool-identifier': string
        'pool-address': string | null
        bitcoind: {
          type: 'mainnet' | 'testnet'
        }
      }

      // migrate to new structure
      await Promise.all([
        envFile.write(effects, {
          ...envDefaults,
          ...(type === 'mainnet' ? mainnet : testnet),
          BITCOIN_ZMQ_HOST: zmqEnabled
            ? type === 'mainnet'
              ? mainnet.BITCOIN_ZMQ_HOST
              : testnet.BITCOIN_ZMQ_HOST
            : undefined,
          POOL_IDENTIFIER,
        }),
        sdk.store.setOwn(effects, sdk.StorePath.poolDisplayUrl, poolDisplayUrl),
      ])

      // remove old start9 dir
      await rmdir('/data/start9')
    },
    down: IMPOSSIBLE,
  },
})
