import { sdk } from './sdk'
import { exposedStore, initStore } from './store'
import { setDependencies } from './dependencies'
import { setInterfaces } from './interfaces'
import { versions } from './versions'
import { actions } from './actions'
import { envFile } from './file-models/env'
import { envDefaults } from './utils'

// **** Install ****
const install = sdk.setupInstall(
  // ** Post install **
  async ({ effects }) => {
    await envFile.write(effects, envDefaults)
  },
  // ** Pre install **
  async ({ effects }) => {},
)

// **** Uninstall ****
const uninstall = sdk.setupUninstall(async ({ effects }) => {})

/**
 * Plumbing. DO NOT EDIT.
 */
export const { packageInit, packageUninit, containerInit } = sdk.setupInit(
  versions,
  install,
  uninstall,
  setInterfaces,
  setDependencies,
  actions,
  initStore,
  exposedStore,
)
