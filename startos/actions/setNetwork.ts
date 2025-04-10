import { sdk } from '../sdk'
import { envFile } from '../file-models/env'
import { mainnet, testnet } from '../utils'
import { Effects } from '@start9labs/start-sdk/base/lib/Effects'

export const setNetwork = sdk.Action.withoutInput(
  // id
  'set-network',

  // metadata
  async ({ effects }) => {
    const [network, other] = await getNetworks(effects)

    return {
      name: `Switch to ${other}`,
      description: `Currently connected to ${network}. Run action to connect to ${other} instead`,
      warning: `Are you sure you want to switch to ${other}?`,
      allowedStatuses: 'only-running',
      group: null,
      visibility: 'enabled',
    }
  },

  // the execution function
  async ({ effects }) => {
    const [network, other] = await getNetworks(effects)

    await envFile.merge(effects, network === 'mainnet' ? testnet : mainnet)

    return {
      version: '1',
      title: 'Success',
      message: `Successfully switched to ${other}`,
      result: null,
    }
  },
)

async function getNetworks(effects: Effects) {
  const network = (await envFile.read.const(effects))?.NETWORK || 'mainnet'
  const other = network === 'mainnet' ? 'testnet' : 'mainnet'

  return [network, other]
}
