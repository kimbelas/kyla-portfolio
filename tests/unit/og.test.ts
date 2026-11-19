import sharp from 'sharp'
import { expect, test } from 'vitest'

test('og image is 1200x630 png', async () => {
  expect(await sharp('public/og/default.png').metadata()).toMatchObject({
    width: 1200,
    height: 630,
    format: 'png',
  })
})
