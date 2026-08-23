import type { Metadata } from "next"
import Link from "next/link"
import TheNavbar from "~/components/TheNavbar"
import TheFooter from "~/components/TheFooter"
import ProjectsGrid from "~/components/ProjectsGrid"
import { projects } from "~/data/portfolio"

export const metadata: Metadata = {
  title: "Projects — Krunal Asari",
}

export default function ProjectsPage() {
  return (
    <div className="min-h-screen">
      <TheNavbar />
      <main>
        <section className="container-px mx-auto max-w-content py-16 sm:py-20">
          <Link href="/#projects" className="font-mono text-xs text-ink-400 transition-colors hover:text-accent">
            &larr; Back to home
          </Link>

          <p className="section-heading mt-6">All Projects</p>
          <h1 className="text-3xl font-extrabold text-ink-100 sm:text-4xl">Everything I&apos;ve built</h1>
          <p className="mt-3 max-w-xl text-ink-300">
            {projects.length} projects spanning machine learning, full-stack web development, systems
            programming, and security tooling. Filter by domain below.
          </p>

          <ProjectsGrid />
        </section>
      </main>
      <TheFooter />
    </div>
  )
}
