import type { Project } from "~/data/portfolio"

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group rounded-lg border border-ink-800 bg-ink-900/50 p-6 transition-colors hover:border-accent/40 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-ink-100 transition-colors group-hover:text-accent">
            {project.title}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {project.domains.map((domain) => (
              <span key={domain} className="rounded-full bg-accent/10 px-2.5 py-0.5 font-mono text-[11px] text-accent">
                {domain}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {project.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1.5 font-mono text-xs text-ink-400 transition-colors hover:text-accent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.08.78 2.17 0 1.57-.01 2.83-.01 3.22 0 .32.21.67.8.56A10.52 10.52 0 0 0 23.5 12c0-6.27-5.23-11.5-11.5-11.5Z" />
              </svg>
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-300">{project.description}</p>

      <ul className="mt-4 space-y-1.5">
        {project.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-2 text-sm text-ink-400">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-accent"></span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-ink-800 px-3 py-1 font-mono text-[11px] text-ink-300">
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}
