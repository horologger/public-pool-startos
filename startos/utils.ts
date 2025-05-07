import { Effects } from '@start9labs/start-sdk/base/lib/Effects'
import { sdk } from './sdk'

export const uiPort = 80
export const bitcoindMountpoint = '/mnt/bitcoind'

const MAINNET_BITCOIN_RPC_URL = 'bitcoind.startos' as const
const TESTNET_BITCOIN_RPC_URL = 'bitcoind-testnet.startos' as const

export const mainnet = {
  NETWORK: 'mainnet' as const,
  BITCOIN_RPC_COOKIEFILE: `${bitcoindMountpoint}/.cookie`,
  BITCOIN_RPC_URL: `http://${MAINNET_BITCOIN_RPC_URL}`,
  BITCOIN_RPC_PORT: 8332,
  BITCOIN_ZMQ_HOST: `tcp://${MAINNET_BITCOIN_RPC_URL}:28332`,
}

export const testnet = {
  NETWORK: 'testnet' as const,
  BITCOIN_RPC_COOKIEFILE: '',
  BITCOIN_RPC_URL: `http://${TESTNET_BITCOIN_RPC_URL}`,
  BITCOIN_RPC_PORT: 48332,
  BITCOIN_ZMQ_HOST: `tcp://${TESTNET_BITCOIN_RPC_URL}:28332`,
}

export const envDefaults = {
  ...mainnet,
  BITCOIN_RPC_TIMEOUT: 10000,
  API_PORT: 3334,
  STRATUM_PORT: 3333,
  API_SECURE: false, 
  /*
    If API_SECURE is set to true public pool crash loops with the below error:
    
    2025-05-06T23:12:32-06:00  node:fs:574
    2025-05-06T23:12:32-06:00    return binding.open(
    2025-05-06T23:12:32-06:00                   ^
    2025-05-06T23:12:32-06:00  Error: ENOENT: no such file or directory, open '/var/www/html/secrets/key.pem'
    2025-05-06T23:12:32-06:00      at Object.openSync (node:fs:574:18)
    2025-05-06T23:12:32-06:00      at readFileSync (node:fs:453:35)
    2025-05-06T23:12:32-06:00      at bootstrap (/public-pool/dist/main.js:22:44)
    2025-05-06T23:12:32-06:00      at Object.<anonymous> (/public-pool/dist/main.js:50:1)
    2025-05-06T23:12:32-06:00      at Module._compile (node:internal/modules/cjs/loader:1529:14)
    2025-05-06T23:12:32-06:00      at Module._extensions..js (node:internal/modules/cjs/loader:1613:10)
    2025-05-06T23:12:32-06:00      at Module.load (node:internal/modules/cjs/loader:1275:32)
    2025-05-06T23:12:32-06:00      at Module._load (node:internal/modules/cjs/loader:1096:12)
    2025-05-06T23:12:32-06:00      at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:164:12)
    2025-05-06T23:12:32-06:00      at node:internal/main/run_main_module:28:49 {
    2025-05-06T23:12:32-06:00    errno: -2,
    2025-05-06T23:12:32-06:00    code: 'ENOENT',
    2025-05-06T23:12:32-06:00    syscall: 'open',
    2025-05-06T23:12:32-06:00    path: '/var/www/html/secrets/key.pem'
    2025-05-06T23:12:32-06:00  }
  */
  POOL_IDENTIFIER: 'Public-Pool',
}

export function jsonToDotenv<
  T extends Record<string, string | number | boolean | undefined>,
>(jsonObj: T): string {
  return Object.entries(jsonObj)
    .map(([key, value]) => `${key.toUpperCase()}=${value}`)
    .join('\n')
}

export function dotenvToJson<
  T extends Record<string, string | number | boolean | undefined>,
>(dotenvStr: string): T {
  return (
    dotenvStr
      .split('\n')
      // ignore empty lines and comments
      .filter((line) => line.trim() && !line.startsWith('#'))
      .reduce((acc, line) => {
        const [key, value] = line.split('=')
        if (key && value !== undefined) {
          ;(acc as Record<string, string>)[key.trim()] = value.trim()
        }
        return acc
      }, {} as T)
  )
}

export async function getStratumIpv4Address(effects: Effects) {
  const stratumInterface = await sdk.serviceInterface
    .getOwn(effects, 'stratum')
    .const()

  const address = stratumInterface?.addressInfo?.ipv4Urls?.[0]

  if (!address) throw 'No IPv4 addresses'

  return address
}
