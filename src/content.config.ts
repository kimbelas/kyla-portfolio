import { defineCollection } from 'astro:content'
import { file } from 'astro/loaders'
import {
  clientSchema,
  experienceSchema,
  expertiseSchema,
  faqSchema,
  metricSchema,
  portfolioSchema,
  profileSchema,
  recordingSchema,
  reviewSchema,
} from './content/schemas'

export const collections = {
  profile: defineCollection({
    loader: file('src/content/profile.yaml'),
    schema: profileSchema,
  }),
  metrics: defineCollection({
    loader: file('src/content/metrics.yaml'),
    schema: metricSchema,
  }),
  expertise: defineCollection({
    loader: file('src/content/expertise.yaml'),
    schema: expertiseSchema,
  }),
  experience: defineCollection({
    loader: file('src/content/experience.yaml'),
    schema: experienceSchema,
  }),
  clients: defineCollection({
    loader: file('src/content/clients.yaml'),
    schema: clientSchema,
  }),
  recordings: defineCollection({
    loader: file('src/content/recordings.yaml'),
    schema: recordingSchema,
  }),
  portfolio: defineCollection({
    loader: file('src/content/portfolio.yaml'),
    schema: ({ image }) => portfolioSchema(image),
  }),
  reviews: defineCollection({
    loader: file('src/content/reviews.yaml'),
    schema: ({ image }) => reviewSchema(image),
  }),
  faq: defineCollection({
    loader: file('src/content/faq.yaml'),
    schema: faqSchema,
  }),
}
