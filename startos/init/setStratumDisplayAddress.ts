import { store } from '../file-models/store.json'
import { sdk } from '../sdk'
import { getStratumIpv4Address } from '../utils'

export const setStratumDisplayAddress = sdk.setupOnInit(async (effects) => {
  await store.merge(effects, {
    stratumDisplayAddress: await getStratumIpv4Address(effects),
  })
})
