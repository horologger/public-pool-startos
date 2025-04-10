import { matches, FileHelper } from '@start9labs/start-sdk'
import {
  dotenvToJson,
  jsonToDotenv,
  envDefaults,
  mainnet,
  testnet,
} from '../utils'

const { object, string, literal, oneOf, allOf } = matches

const {
  BITCOIN_RPC_TIMEOUT,
  API_PORT,
  STRATUM_PORT,
  POOL_IDENTIFIER,
  API_SECURE,
} = envDefaults

const shape = allOf(
  object({
    BITCOIN_RPC_TIMEOUT:
      literal(BITCOIN_RPC_TIMEOUT).onMismatch(BITCOIN_RPC_TIMEOUT),
    API_PORT: literal(API_PORT).onMismatch(API_PORT),
    STRATUM_PORT: literal(STRATUM_PORT).onMismatch(STRATUM_PORT),
    API_SECURE: literal(API_SECURE).onMismatch(API_SECURE),
    POOL_IDENTIFIER: string.onMismatch(POOL_IDENTIFIER),
  }),
  oneOf(
    object({
      NETWORK: literal(mainnet.NETWORK).onMismatch(mainnet.NETWORK),
      BITCOIN_RPC_URL: literal(mainnet.BITCOIN_RPC_URL).onMismatch(
        mainnet.BITCOIN_RPC_URL,
      ),
      BITCOIN_RPC_PORT: literal(mainnet.BITCOIN_RPC_PORT).onMismatch(
        mainnet.BITCOIN_RPC_PORT,
      ),
      BITCOIN_RPC_COOKIEFILE: literal(
        mainnet.BITCOIN_RPC_COOKIEFILE,
      ).onMismatch(mainnet.BITCOIN_RPC_COOKIEFILE),
      BITCOIN_ZMQ_HOST: literal(mainnet.BITCOIN_ZMQ_HOST)
        .optional()
        .onMismatch(mainnet.BITCOIN_ZMQ_HOST),
    }),
    object({
      NETWORK: literal(testnet.NETWORK).onMismatch(testnet.NETWORK),
      BITCOIN_RPC_URL: literal(testnet.BITCOIN_RPC_URL).onMismatch(
        testnet.BITCOIN_RPC_URL,
      ),
      BITCOIN_RPC_PORT: literal(testnet.BITCOIN_RPC_PORT).onMismatch(
        testnet.BITCOIN_RPC_PORT,
      ),
      BITCOIN_RPC_COOKIEFILE: literal(
        testnet.BITCOIN_RPC_COOKIEFILE,
      ).onMismatch(testnet.BITCOIN_RPC_COOKIEFILE),
      BITCOIN_ZMQ_HOST: literal(testnet.BITCOIN_ZMQ_HOST)
        .optional()
        .onMismatch(testnet.BITCOIN_ZMQ_HOST),
    }),
  ).onMismatch(mainnet),
)

export type EnvType = typeof shape._TYPE

export const envFile = FileHelper.raw(
  '/media/startos/volumes/main/public-pool/.env',
  jsonToDotenv<typeof shape._TYPE>,
  dotenvToJson<typeof shape._TYPE>,
  (obj) => shape.unsafeCast(obj),
)
