import { sdk } from './sdk'
import { FileHelper, T } from '@start9labs/start-sdk'
import { bitcoindMountpoint, envDefaults, uiPort } from './utils'
import { envFile } from './file-models/env'
import { store } from './file-models/store.json'

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
      .mountVolume({
        volumeId: 'main',
        subpath: env.NETWORK,
        mountpoint: '/public-pool/DB',
        readonly: false,
      })
      .mountVolume({
        volumeId: 'main',
        subpath: '.env',
        mountpoint: '/public-pool/.env',
        readonly: true,
        type: 'file',
      })
      .mountDependency({
        dependencyId:
          env.NETWORK === 'mainnet' ? 'bitcoind' : 'bitcoind-testnet',
        volumeId: 'main',
        subpath: null,
        mountpoint: bitcoindMountpoint,
        readonly: true,
      }),
    'stratum',
  )

  await FileHelper.string(
    `${stratumSub.rootfs}${bitcoindMountpoint}/.cookie`,
  ).read.const(effects)

  // ** UI subcontainer **
  const uiSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'public-pool' },
    null,
    'ui',
  )
  // set desired Stratum URL for display in the UI
  const url = (await store.read.const(effects))?.stratumDisplayAddress || ''

  await uiSub.exec([
    'sh',
    '-c',
    `sed -i "s/<Stratum URL>/${url}/" "$(find /var/www/html/main.*.js)"`,
  ])

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
      command: [
        'sh',
        '-c',
        'cd /public-pool/ && /usr/local/bin/node dist/main.js',
      ],
      ready: {
        display: 'Stratum Server',
        fn: () =>
          sdk.healthCheck.checkPortListening(
            effects,
            Number(envDefaults.STRATUM_PORT),
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
