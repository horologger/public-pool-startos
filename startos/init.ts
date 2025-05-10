import { sdk } from './sdk'
import { setDependencies } from './dependencies'
import { setInterfaces } from './interfaces'
import { versions } from './versions'
import { actions } from './actions'
import { envFile } from './file-models/env'
import { envDefaults, getStratumIpv4Address } from './utils'
import { store } from './file-models/store.json'

// **** PreInstall ****
const preInstall = sdk.setupPreInstall(async ({ effects }) => {
  await envFile.write(effects, envDefaults)
  await store.write(effects, { stratumDisplayAddress: null })
})

// **** PostInstall ****
const postInstall = sdk.setupPostInstall(async ({ effects }) => {
  await store.merge(effects, {
    stratumDisplayAddress: await getStratumIpv4Address(effects),
  })
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
)
