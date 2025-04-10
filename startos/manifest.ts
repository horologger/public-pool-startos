import { setupManifest } from '@start9labs/start-sdk'

export const manifest = setupManifest({
  id: 'public-pool',
  title: 'Public Pool',
  license: 'GPL',
  wrapperRepo: 'https://github.com/remcoros/public-pool-startos',
  upstreamRepo: 'https://github.com/benjamin-wilson/public-pool',
  supportSite: 'https://github.com/benjamin-wilson/public-pool/issues',
  marketingSite: 'https://web.public-pool.io',
  donationUrl: 'https://web.public-pool.io',
  description: {
    short: 'Open source Bitcoin mining pool.',
    long: 'Open source Bitcoin mining pool.',
  },
  volumes: ['main'],
  images: {
    'public-pool': {
      source: {
        dockerBuild: {},
      },
    },
  },
  hardwareRequirements: {},
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {
    bitcoind: {
      description: 'Used to subscribe to new block events',
      optional: true,
      s9pk: 'https://github.com/Start9Labs/bitcoind-startos/releases/download/v28.1.0.0-alpha.2/bitcoind.s9pk',
    },
    'bitcoind-testnet': {
      description: 'Used to subscribe to new block events',
      optional: true,
      // @TODO replace with testnet when available
      s9pk: 'https://github.com/Start9Labs/bitcoind-startos/releases/download/v28.1.0.0-alpha.2/bitcoind.s9pk',
    },
  },
})
