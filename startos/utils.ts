export const uiPort = 80

const MAINNET_BITCOIN_RPC_URL = 'bitcoind.startos' as const
const TESTNET_BITCOIN_RPC_URL = 'bitcoind-testnet.startos' as const

export const mainnet = {
  NETWORK: 'mainnet' as const,
  BITCOIN_RPC_COOKIEFILE: '',
  BITCOIN_RPC_URL: MAINNET_BITCOIN_RPC_URL,
  BITCOIN_RPC_PORT: 8332,
  BITCOIN_ZMQ_HOST: `${MAINNET_BITCOIN_RPC_URL}:28332`,
}

export const testnet = {
  NETWORK: 'testnet' as const,
  BITCOIN_RPC_COOKIEFILE: '',
  BITCOIN_RPC_URL: TESTNET_BITCOIN_RPC_URL,
  BITCOIN_RPC_PORT: 48332,
  BITCOIN_ZMQ_HOST: `${TESTNET_BITCOIN_RPC_URL}:28332`,
}

export const envDefaults = {
  ...mainnet,
  BITCOIN_RPC_TIMEOUT: 10000,
  API_PORT: 3334,
  STRATUM_PORT: 3333,
  API_SECURE: true,
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
