import { sdk } from './sdk'
import { envDefaults, uiPort } from './utils'

const { STRATUM_PORT } = envDefaults

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  // ** UI Multi **
  const uiMulti = sdk.MultiHost.of(effects, 'ui-multi')
  const uiMultiOrigin = await uiMulti.bindPort(uiPort, {
    protocol: 'http',
  })
  const ui = sdk.createInterface(effects, {
    name: 'Web UI',
    id: 'ui',
    description: 'Personal web user interface for Public Pool',
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    search: {},
  })
  const uiReceipt = await uiMultiOrigin.export([ui])

  // ** Stratum Multi **
  const stratumMulti = sdk.MultiHost.of(effects, 'stratum-multi')
  // Stratum
  const stratumMultiOrigin = await stratumMulti.bindPort(STRATUM_PORT, {
    protocol: null,
    addSsl: null,
    preferredExternalPort: STRATUM_PORT,
    secure: { ssl: false },
  })
  const stratum = sdk.createInterface(effects, {
    name: 'Stratum Server',
    id: 'stratum',
    description: 'Your Stratum server',
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    search: {},
  })
  const stratumReceipt = await stratumMultiOrigin.export([stratum])

  return [uiReceipt, stratumReceipt]
})
