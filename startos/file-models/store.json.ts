import { matches, FileHelper } from '@start9labs/start-sdk'
const { object, string } = matches

const shape = object({
  stratumDisplayAddress: string.nullable().onMismatch(null),
})

export const store = FileHelper.json(
  '/media/startos/volumes/main/store.json',
  shape,
)
