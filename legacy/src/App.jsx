import { MotionConfig } from 'framer-motion'
import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Expertise from './components/Expertise'
import Recordings from './components/Recordings'
import Portfolio from './components/Portfolio'
import Experience from './components/Experience'
import Testimonials from './components/Testimonials'
import Tools from './components/Tools'
import Contact from './components/Contact'
import { site } from './data/content'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Nav />
      <main>
        <Hero />
        <About />
        <Expertise />
        <Recordings />
        <Portfolio />
        <Experience />
        <Testimonials />
        <Tools />
        <Contact />
      </main>
      <footer className="border-t border-line">
        <div className="gutter mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 py-8 text-[0.85rem] text-muted sm:flex-row">
          <span className="font-script text-2xl text-rose-deep">{site.name}</span>
          <span>
            {site.title} · {site.location}
          </span>
          <span className="tabular-nums">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </MotionConfig>
  )
}
