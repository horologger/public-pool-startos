import { sdk } from '../sdk'
import { envFile } from '../file-models/env'
import { mainnet, testnet } from '../utils'

export const setNetwork = sdk.Action.withoutInput(
  // id
  'set-network',

  // metadata
  async ({ effects }) => {
    const { NETWORK } = (await envFile.read.const(effects))!
    const other = NETWORK === 'mainnet' ? 'testnet' : 'mainnet'

    return {
      name: `Switch to ${other}`,
      description: `Currently connected to ${NETWORK}. Run action to connect to ${other} instead`,
      warning: `Are you sure you want to switch to ${other}?`,
      allowedStatuses: 'only-running',
      group: null,
      visibility: 'enabled',
    }
  },

  // the execution function
  async ({ effects }) => {
    const { NETWORK, BITCOIN_ZMQ_HOST } = (await envFile.read.const(effects))!
    const other = NETWORK === 'mainnet' ? 'testnet' : 'mainnet'

    const toSave: typeof mainnet | typeof testnet =
      NETWORK === 'mainnet' ? testnet : mainnet

    await envFile.merge(effects, {
      ...toSave,
      BITCOIN_ZMQ_HOST: BITCOIN_ZMQ_HOST ? toSave.BITCOIN_ZMQ_HOST : undefined,
    })

    return {
      version: '1',
      title: 'Success',
      message: `Successfully switched to ${other}`,
      result: null,
    }
  },
)
