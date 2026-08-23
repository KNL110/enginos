import Link from "next/link"
import { projects } from "~/data/portfolio"
import ProjectCard from "~/components/ProjectCard"

export default function ProjectsSection() {
  const featured = projects.filter((p) => p.featured)

  return (
    <section id="projects" className="container-px mx-auto max-w-content scroll-mt-28 py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="section-heading">03. Projects</p>
        <Link href="/projects" className="font-mono text-xs text-ink-400 transition-colors hover:text-accent">
          View all {projects.length} projects &rarr;
        </Link>
      </div>

      <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
        {featured.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>

      <Link
        href="/projects"
        className="mt-8 flex w-full items-center justify-center rounded-md border border-ink-700 py-3 font-mono text-sm text-ink-200 transition-colors hover:border-accent/40 hover:text-accent"
      >
        View all projects
      </Link>
    </section>
  )
}
