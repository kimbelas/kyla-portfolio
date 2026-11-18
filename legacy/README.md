# Kyla Belas · Portfolio website

React + Tailwind CSS + Framer Motion, built with Vite.

## Update the content
Everything on the site (text, links, projects, testimonials, tools) lives in one file:

    src/data/content.js

Images live in `public/images/` (architecture, construction, marketing, reviews, profile).
To add a portfolio piece, drop the image in the right folder and add one line to `portfolio` in `content.js`.

## Run locally
    npm install
    npm run dev        # http://localhost:5173

## Build for deployment
    npm run build      # outputs the static site to dist/

`dist/` is a plain static site. Deploy it anywhere:
- Netlify: drag the `dist` folder onto app.netlify.com/drop
- Vercel: import the folder, framework "Vite", build command `npm run build`, output `dist`
- GitHub Pages or any web host: upload the contents of `dist`

## Contact form
The form works without a backend.
- By default it opens the visitor's email app with the message filled in, addressed to kylabelasss@gmail.com.
- To receive messages directly in your inbox instead, create a free form at https://formspree.io,
  copy its ID (the part after `/f/` in the endpoint) and paste it into `formspreeId` in `src/data/content.js`.
