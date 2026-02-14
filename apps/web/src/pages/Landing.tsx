import { Background } from "../components/Background";
import { Footer } from "../components/Footer";
import { Hero } from "../components/Hero";
import { Navbar } from "../components/Navbar";
import { ScrollProgress } from "../components/ScrollProgress";
import { CTA } from "../sections/CTA";
import { FAQ } from "../sections/FAQ";
import { Features } from "../sections/Features";
import { Pricing } from "../sections/Pricing";
import { Process } from "../sections/Process";
import { Solution } from "../sections/Solution";
import { Testimonials } from "../sections/Testimonials";
import { UseCases } from "../sections/UseCases";

export function Landing() {
  const onCta = () => {
    document.getElementById("form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative min-h-screen">
      <ScrollProgress />
      <Background />
      <Navbar onCta={onCta} />

      <main className="relative">
        <Hero />
        <Solution />
        <Features />
        <Process />
        <UseCases />
        <Testimonials />
        <Pricing />
        <CTA />
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
