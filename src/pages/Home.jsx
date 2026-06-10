import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import Services from '../components/Services.jsx'
import About from '../components/About.jsx'
import Accounting from '../components/Accounting.jsx'
import FAQ from '../components/FAQ.jsx'
import CTA from '../components/CTA.jsx'
import Footer from '../components/Footer.jsx'

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-white text-ink-900 font-sans">
      <Navbar theme="light" />
      <main className="overflow-x-clip overflow-y-clip">
        <Hero />
        <Services />
        <About />
        <Accounting />
        <FAQ />
        <CTA />
        <Footer />
      </main>
    </div>
  )
}
