import { buildMailto } from '../lib/mailto'

export type ContactResult = 'sent' | 'mailto' | 'error' | 'spam' | 'invalid'

export interface ContactDeps {
  fetch: typeof fetch
  formspreeId: string
  to: string
  navigate: (url: string) => void
}

const MIN_MESSAGE = 10

const inFlight = new WeakMap<HTMLFormElement, Promise<ContactResult>>()

/**
 * Sends the form to Formspree (JSON), or opens a mailto: when no id is set.
 * A call made while a send is in flight returns that same promise and sends nothing.
 */
export function submitContact(
  form: HTMLFormElement,
  deps: ContactDeps,
): Promise<ContactResult> {
  const pending = inFlight.get(form)
  if (pending) return pending
  const run = send(form, deps).finally(() => inFlight.delete(form))
  inFlight.set(form, run)
  return run
}

async function send(
  form: HTMLFormElement,
  deps: ContactDeps,
): Promise<ContactResult> {
  const fd = new FormData(form)
  if (String(fd.get('_gotcha') ?? '') !== '') return 'spam'
  for (const el of form.elements) {
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      el.setCustomValidity('')
    }
  }
  if (!form.checkValidity()) {
    form.reportValidity()
    return 'invalid'
  }
  const data = {
    name: String(fd.get('name') ?? '').trim(),
    email: String(fd.get('email') ?? '').trim(),
    company: String(fd.get('company') ?? '').trim(),
    message: String(fd.get('message') ?? '').trim(),
  }
  const blank = (['name', 'message'] as const).find((k) => data[k] === '')
  const short = data.message.length < MIN_MESSAGE
  if (blank || short) {
    const field = form.elements.namedItem(blank ?? 'message') as
      HTMLInputElement | HTMLTextAreaElement
    field.setCustomValidity(
      blank
        ? 'Please fill in this field.'
        : `Please write at least ${MIN_MESSAGE} characters.`,
    )
    form.reportValidity()
    return 'invalid'
  }
  if (!deps.formspreeId) {
    deps.navigate(buildMailto(data, deps.to))
    return 'mailto'
  }
  try {
    const res = await deps.fetch(`https://formspree.io/f/${deps.formspreeId}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return res.ok ? 'sent' : 'error'
  } catch {
    return 'error'
  }
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

const STATUS_KEY: Record<ContactResult, 'sent' | 'mailto' | 'error' | null> = {
  sent: 'sent',
  spam: 'sent',
  mailto: 'mailto',
  error: 'error',
  invalid: null,
}

/** Progressive enhancement: async submit, status messages and the copy button. */
export function initContact(form: HTMLFormElement): void {
  const root = form.closest<HTMLElement>('[data-contact]') ?? form
  const status = root.querySelector<HTMLElement>('[data-status]')
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')
  const formspreeId = form.dataset.formspreeId ?? ''
  const to = form.dataset.to ?? ''

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (button) button.disabled = true
    const result = await submitContact(form, {
      fetch: window.fetch.bind(window),
      formspreeId,
      to,
      navigate: (url) => window.location.assign(url),
    })
    if (button) button.disabled = false
    const key = STATUS_KEY[result]
    if (status) {
      status.textContent = key ? (status.dataset[key] ?? '') : ''
      status.dataset.state = key ?? ''
    }
    if (result === 'sent' || result === 'spam') form.reset()
  })

  const copy = root.querySelector<HTMLButtonElement>('[data-copy]')
  const feedback = root.querySelector<HTMLElement>('[data-copy-status]')
  copy?.addEventListener('click', async () => {
    const ok = await copyText(copy.dataset.copy ?? '')
    if (feedback) feedback.textContent = ok ? 'Copied' : 'Copy failed'
    window.setTimeout(() => {
      if (feedback) feedback.textContent = ''
    }, 2500)
  })
}
