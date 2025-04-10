import { sdk } from '../sdk'
import { config } from './config'
import { setNetwork } from './setNetwork'

export const actions = sdk.Actions.of().addAction(setNetwork).addAction(config)
