import { sdk } from '../sdk'
import { envFile } from '../file-models/env'
import { utils } from '@start9labs/start-sdk'
import { store } from '../file-models/store.json'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
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
  async ({ effects }) => ({
    POOL_IDENTIFIER: (await envFile.read.const(effects))?.POOL_IDENTIFIER,
    poolDisplayUrl:
      (await store.read.const(effects))?.stratumDisplayAddress || undefined,
  }),

  // the execution function
  async ({ effects, input }) => {
    await Promise.all([
      envFile.merge(effects, {
        POOL_IDENTIFIER: input.POOL_IDENTIFIER,
      }),
      store.merge(effects, { stratumDisplayAddress: input.poolDisplayUrl }),
    ])
  },
)
