import { positions, extracurriculars } from "~/data/portfolio"

export default function ActivitiesSection() {
  return (
    <section id="activities" className="container-px mx-auto max-w-content scroll-mt-28 py-20">
      <p className="section-heading">05. Beyond the Classroom</p>
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <h3 className="mb-4 font-mono text-sm font-semibold text-ink-100">Positions of Responsibility</h3>
          <ul className="space-y-4">
            {positions.map((pos) => (
              <li key={pos.role + pos.org} className="rounded-lg border border-ink-800 bg-ink-900/50 p-4">
                <p className="text-sm font-medium text-ink-100">{pos.role}</p>
                <p className="text-sm text-ink-400">{pos.org}</p>
                {pos.period && <p className="mt-1 font-mono text-xs text-accent">{pos.period}</p>}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-mono text-sm font-semibold text-ink-100">Extracurriculars</h3>
          <ul className="space-y-4">
            {extracurriculars.map((item) => (
              <li key={item.title} className="rounded-lg border border-ink-800 bg-ink-900/50 p-4">
                <p className="text-sm font-medium text-ink-100">{item.title}</p>
                <p className="mt-1 text-sm text-ink-400">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
