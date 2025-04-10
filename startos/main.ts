import { sdk } from './sdk'
import { T } from '@start9labs/start-sdk'
import { uiPort } from './utils'
import { envFile } from './file-models/env'

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

  // @TODO Remoco did the following, depending on network
  //   mkdir -p /public-pool-data/mainnet
  //   ln -s /public-pool-data/mainnet /public-pool/DB

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
  return sdk.Daemons.of(effects, started, additionalChecks).addDaemon(
    'primary',
    {
      subcontainer: { imageId: 'public-pool' },
      // @TODO command here is a mutant hybrid between github docs and Remco code in entrypoint. How to start the service with .nv location specified?
      command: [
        '/usr/local/bin/node',
        '/public-pool/dist/main.js',
        '-v',
        '.env:/public-pool/.env',
      ],
      mounts: sdk.Mounts.of()
        .addVolume('main', null, '/public-pool-data', false)
        .addDependency(
          env.NETWORK === 'mainnet' ? 'bitcoind' : 'bitcoind-testnet',
          'main',
          null,
          `/public-pool-data/${env.NETWORK}`,
          true,
        ),
      ready: {
        display: 'Web Interface',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: 'The web interface is ready',
            errorMessage: 'The web interface is not ready',
          }),
      },
      requires: [],
    },
  )
})
