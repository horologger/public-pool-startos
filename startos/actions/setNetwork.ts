import { sdk } from '../sdk'
import { envFile } from '../file-models/env'
import { mainnet, testnet } from '../utils'

export const setNetwork = sdk.Action.withoutInput(
  // id
  'set-network',

  // metadata
  async ({ effects }) => {
    const { NETWORK } = (await envFile.read().const(effects))!
    const other = NETWORK === 'mainnet' ? 'testnet' : 'mainnet'

    return {
      name: `Switch to ${other}`,
      description: `Currently connected to ${NETWORK}. Run action to connect to ${other} instead`,
      warning: `Are you sure you want to switch to ${other}?`,
      allowedStatuses: 'any',
      group: null,
      visibility: 'enabled',
    }
  },

  // the execution function
  async ({ effects }) => {
    const { NETWORK } = (await envFile.read().const(effects))!
    const other = NETWORK === 'mainnet' ? 'testnet' : 'mainnet'

    await envFile.merge(effects, NETWORK === 'mainnet' ? testnet : mainnet)

    return {
      version: '1',
      title: 'Success',
      message: `Successfully switched to ${other}`,
      result: null,
    }
  },
)
