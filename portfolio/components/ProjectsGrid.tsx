"use client"

import { useState } from "react"
import { projects, domains, type Domain } from "~/data/portfolio"
import ProjectCard from "~/components/ProjectCard"

export default function ProjectsGrid() {
  const [activeDomain, setActiveDomain] = useState<string>("All")

  const filters = ["All", ...domains]

  const filteredProjects =
    activeDomain === "All"
      ? projects
      : projects.filter((p) => p.domains.includes(activeDomain as Domain))

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`rounded-full border px-4 py-1.5 font-mono text-xs transition-colors ${
              activeDomain === filter
                ? "border-accent bg-accent/10 text-accent"
                : "border-ink-700 text-ink-300 hover:border-ink-600 hover:text-ink-100"
            }`}
            onClick={() => setActiveDomain(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <p className="mt-4 font-mono text-xs text-ink-500">
        {filteredProjects.length} project{filteredProjects.length === 1 ? "" : "s"}
      </p>

      <div className="mt-6 grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <p className="mt-10 text-center text-ink-400">No projects in this domain yet.</p>
      )}
    </>
  )
}
