import { sdk } from '../sdk'
import { envFile } from '../file-models/env'
import { utils } from '@start9labs/start-sdk'
import { mainnet, testnet } from '../utils'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  zmqEnabled: Value.toggle({
    name: 'Enable ZeroMQ',
    description:
      'Recommended. Use ZeroMQ for new block notifications, this is generally faster than polling over RPC',
    default: true,
  }),
  POOL_IDENTIFIER: Value.text({
    name: 'Pool Identifier',
    description: 'The pool identifier to include in the Coinbase transactions',
    required: true,
    default: 'Public-Pool',
    placeholder: 'Public-Pool',
    maxLength: 100,
    patterns: [utils.Patterns.ascii],
  }),
  poolDisplayUrl: Value.dynamicSelect(async ({ effects }) => {
    const stratumInterface = await sdk.serviceInterface
      .getOwn(effects, 'stratum')
      .const()

    const urls = stratumInterface?.addressInfo?.urls || []

    return {
      name: 'Server Display URL',
      description:
        'The IP address or hostname to show on your Public Pool homepage',
      values: urls.reduce(
        (obj, url) => ({
          ...obj,
          [url]: url,
        }),
        {} as Record<string, string>,
      ),
      default: urls[0],
    }
  }),
})

export const config = sdk.Action.withInput(
  // id
  'config',

  // metadata
  async ({ effects }) => ({
    name: 'Configure',
    description: 'Customize your Public Pool instance',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // optionally pre-fill the input form
  async ({ effects }) => {
    const env = await envFile.read.const(effects)

    return {
      ...env,
      zmqEnabled: !!env?.BITCOIN_ZMQ_HOST,
    }
  },

  // the execution function
  async ({ effects, input }) => {
    const { NETWORK } = (await envFile.read.const(effects))!

    await Promise.all([
      envFile.merge(effects, {
        POOL_IDENTIFIER: input.POOL_IDENTIFIER,
        BITCOIN_ZMQ_HOST: input.zmqEnabled
          ? NETWORK === 'mainnet'
            ? mainnet.BITCOIN_ZMQ_HOST
            : testnet.BITCOIN_ZMQ_HOST
          : undefined,
      }),
      sdk.store.setOwn(
        effects,
        sdk.StorePath.stratumDisplayAddress,
        input.poolDisplayUrl,
      ),
    ])
  },
)
