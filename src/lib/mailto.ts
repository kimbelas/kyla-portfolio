export interface ContactData {
  name: string
  email: string
  company?: string
  message: string
}

/** Builds the mailto: URL used when no Formspree form is configured. */
export function buildMailto(data: ContactData, to: string): string {
  const company = data.company?.trim()
  const subject = `Portfolio inquiry from ${data.name}${company ? ` (${company})` : ''}`
  const body = `${data.message}\n\n${data.name}\n${data.email}`
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
