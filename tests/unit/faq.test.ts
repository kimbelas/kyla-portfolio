import { describe, expect, test } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import Faq from '../../src/components/home/Faq.astro'

const render = async (items: unknown[]) =>
  (await AstroContainer.create()).renderToString(Faq, { props: { items } })

describe('Faq', () => {
  test('renders nothing for an empty list', async () => {
    expect((await render([])).trim()).toBe('')
  })

  test('renders one details per entry with the question as summary', async () => {
    const html = await render([
      { id: 'a', question: 'Who?', answer: 'Kyla.', approved: true },
      { id: 'b', question: 'Where?', answer: 'Pampanga.', approved: true },
    ])
    expect(html.match(/<details/g)).toHaveLength(2)
    expect(html.replace(/<[^>]+>/g, '')).toContain('Questions, answered')
    expect(html).toMatch(/<summary[^>]*>[\s\S]*Who\?[\s\S]*<\/summary>/)
    expect(html).toContain('Pampanga.')
  })
})
