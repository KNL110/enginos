import TheNavbar from "~/components/TheNavbar"
import HeroSection from "~/components/HeroSection"
import AboutSection from "~/components/AboutSection"
import SkillsSection from "~/components/SkillsSection"
import ProjectsSection from "~/components/ProjectsSection"
import EducationSection from "~/components/EducationSection"
import ActivitiesSection from "~/components/ActivitiesSection"
import ContactSection from "~/components/ContactSection"
import TheFooter from "~/components/TheFooter"

export default function Home() {
  return (
    <div className="min-h-screen">
      <TheNavbar />
      <main>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <EducationSection />
        <ActivitiesSection />
        <ContactSection />
      </main>
      <TheFooter />
    </div>
  )
}
