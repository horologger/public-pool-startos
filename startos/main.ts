import { sdk } from './sdk'
import { T } from '@start9labs/start-sdk'
import { bitcoindMountpoint, envDefaults, uiPort } from './utils'
import { envFile } from './file-models/env'
import * as fs from 'node:fs/promises'

export const main = sdk.setupMain(async ({ effects, started }) => {
  /**
   * ======================== Setup (optional) ========================
   *
   * In this section, we fetch any resources or run any desired preliminary commands.
   */
  console.info('Starting Public Pool!')

  const depResult = await sdk.checkDependencies(effects)
  depResult.throwIfNotSatisfied()

  const env = (await envFile.read.const(effects))!

  // ** Stratum subcontainer **
  const stratumSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'public-pool' },
    sdk.Mounts.of()
      .addVolume('main', env.NETWORK, '/public-pool/DB', false)
      .addDependency(
        // @TODO watch bitcoind's .cookie file and re-run public-pool setupMain if it changes (bitcoind re-writes the .cookie file on restart) - but how?
        env.NETWORK === 'mainnet' ? 'bitcoind' : 'bitcoind-testnet',
        'main',
        'public',
        bitcoindMountpoint,
        true,
      ),
    'stratum',
  )
  // copy .env to proper place
  // @TODO while this puts .env in the "correct" location according to the upstream docs, it isn't recognized and the stratum server is never reachable as a result.
  await fs.cp(envFile.path, `${stratumSub.rootfs}/public-pool/.env`)

  // ** UI subcontainer **
  const uiSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'public-pool' },
    null,
    'ui',
  )
  // set desired Stratum URL for display in the UI
  sdk.store
    .getOwn(effects, sdk.StorePath.stratumDisplayAddress)
    .onChange(async (url) => {
      await uiSub.exec([
        'sh',
        '-c',
        `sed -i "s/<Stratum URL>/${url}/" "$(find /var/www/html/main.*.js)"`,
      ])
    })

  /**
   * ======================== Additional Health Checks (optional) ========================
   *
   * In this section, we define *additional* health checks beyond those included with each daemon (below).
   */
  const additionalChecks: T.HealthCheck[] = []

  /**
   * ======================== Daemons ========================
   *
   * In this section, we create one or more daemons that define the service runtime.
   *
   * Each daemon defines its own health check, which can optionally be exposed to the user.
   */
  return sdk.Daemons.of(effects, started, additionalChecks)
    .addDaemon('stratum', {
      subcontainer: stratumSub,
      command: ['/usr/local/bin/node', '/public-pool/dist/main.js'],
      env: Object.fromEntries(
        Object.entries(env).map(([key, value]) => [key, String(value)]),
      ),
      ready: {
        display: 'Stratum Server',
        fn: () =>
          sdk.healthCheck.checkPortListening(
            effects,
            envDefaults.STRATUM_PORT,
            {
              successMessage: 'Stratum server is ready',
              errorMessage: 'Stratum server is not ready',
            },
          ),
      },
      requires: [],
    })
    .addDaemon('ui', {
      subcontainer: uiSub,
      command: ['nginx', '-g', 'daemon off;'],
      ready: {
        display: 'Web Interface',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: 'The web interface is ready',
            errorMessage: 'The web interface is not ready',
          }),
      },
      requires: [],
    })
})
