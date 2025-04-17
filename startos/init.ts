import { sdk } from './sdk'
import { exposedStore, initStore } from './store'
import { setDependencies } from './dependencies'
import { setInterfaces } from './interfaces'
import { versions } from './versions'
import { actions } from './actions'
import { envFile } from './file-models/env'
import { envDefaults, getStratumIpv4Address } from './utils'

// **** PreInstall ****
const preInstall = sdk.setupPreInstall(async ({ effects }) => {
  await envFile.write(effects, envDefaults)
})

// **** PostInstall ****
const postInstall = sdk.setupPostInstall(async ({ effects }) => {
  const ipv4Address = await getStratumIpv4Address(effects)

  sdk.store.setOwn(effects, sdk.StorePath.stratumDisplayAddress, ipv4Address)
})

// **** Uninstall ****
const uninstall = sdk.setupUninstall(async ({ effects }) => {})

/**
 * Plumbing. DO NOT EDIT.
 */
export const { packageInit, packageUninit, containerInit } = sdk.setupInit(
  versions,
  preInstall,
  postInstall,
  uninstall,
  setInterfaces,
  setDependencies,
  actions,
  initStore,
  exposedStore,
)
