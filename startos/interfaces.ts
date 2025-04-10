import { sdk } from './sdk'
import { envDefaults, uiPort } from './utils'

const { STRATUM_PORT, API_PORT } = envDefaults

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  // ** UI **
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

  // ** Stratum **
  const stratumMulti = sdk.MultiHost.of(effects, 'stratum-multi')
  const stratumMultiOrigin = await stratumMulti.bindPort(STRATUM_PORT, {
    // @TODO Aiden confirm
    protocol: null,
    addSsl: { preferredExternalPort: API_PORT, alpn: null },
    preferredExternalPort: STRATUM_PORT,
    secure: null,
  })
  const stratum = sdk.createInterface(effects, {
    name: 'Stratum Server',
    id: 'stratum',
    description: 'Personal web user interface for Public Pool',
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
