import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { load } from 'js-yaml'
import { envFile } from '../../file-models/env'
import { readFile, rm } from 'fs/promises'
import {
  envDefaults,
  getStratumIpv4Address,
  mainnet,
  testnet,
} from '../../utils'
import { store } from '../../file-models/store.json'

export const v_0_2_4_1 = VersionInfo.of({
  version: '0.2.4:1-alpha.1',
  releaseNotes: 'Revamped for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {
      // get old config.yaml
      const {
        'pool-identifier': POOL_IDENTIFIER,
        bitcoind: { type },
      } = load(
        await readFile(
          '/media/startos/volumes/main/start9/config.yaml',
          'utf-8',
        ),
      ) as {
        'pool-identifier': string
        bitcoind: {
          type: 'mainnet' | 'testnet'
        }
      }

      const ipv4Address = await getStratumIpv4Address(effects)

      // migrate to new structure
      await Promise.all([
        envFile.write(effects, {
          ...envDefaults,
          ...(type === 'mainnet' ? mainnet : testnet),
          POOL_IDENTIFIER,
        }),
        store.merge(effects, { stratumDisplayAddress: ipv4Address }),
      ])

      // remove old start9 dir
      await rm('/media/startos/volumes/main/start9', { recursive: true }).catch(
        console.error,
      )
    },
    down: IMPOSSIBLE,
  },
})
