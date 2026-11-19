import { fileURLToPath } from 'node:url'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'

const font = (p) =>
  readFileSync(new URL(`../node_modules/${p}`, import.meta.url))
const script = font(
  '@fontsource/mrs-saint-delafield/files/mrs-saint-delafield-latin-400-normal.woff',
)
const bodoni = font(
  '@fontsource/bodoni-moda/files/bodoni-moda-latin-400-normal.woff',
)

const portraitPng = await sharp(
  fileURLToPath(
    new URL('../src/assets/images/profile/kyla.webp', import.meta.url),
  ),
)
  .resize(360, 470, { fit: 'cover', position: 'top' })
  .png()
  .toBuffer()
const portrait = `data:image/png;base64,${portraitPng.toString('base64')}`

const el = (type, style, children, props = {}) => ({
  type,
  props: { style, children, ...props },
})

const tree = el(
  'div',
  {
    display: 'flex',
    width: 1200,
    height: 630,
    background: '#fbf6f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  el(
    'div',
    {
      display: 'flex',
      width: 1100,
      height: 530,
      background: '#fbe6e4',
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    [
      el(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          width: 680,
          marginLeft: 50,
        },
        [
          el(
            'div',
            {
              fontFamily: 'Mrs Saint Delafield',
              fontSize: 150,
              color: '#7a3646',
              lineHeight: 1,
            },
            'Kyla Belas',
          ),
          el(
            'div',
            {
              fontFamily: 'Bodoni Moda',
              fontSize: 30,
              color: '#2e2326',
              marginTop: 24,
              lineHeight: 1.3,
            },
            'Executive Virtual Assistant · Project Manager',
          ),
        ],
      ),
      el(
        'img',
        {
          width: 360,
          height: 470,
          borderRadius: 24,
          marginRight: 50,
          objectFit: 'cover',
        },
        undefined,
        {
          src: portrait,
          width: 360,
          height: 470,
        },
      ),
    ],
  ),
)

const svg = await satori(tree, {
  width: 1200,
  height: 630,
  fonts: [
    { name: 'Mrs Saint Delafield', data: script, weight: 400, style: 'normal' },
    { name: 'Bodoni Moda', data: bodoni, weight: 400, style: 'normal' },
  ],
})
const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
  .render()
  .asPng()
mkdirSync(new URL('../public/og/', import.meta.url), { recursive: true })
writeFileSync(new URL('../public/og/default.png', import.meta.url), png)
console.log('wrote public/og/default.png')
