import { skills } from "~/data/portfolio"

export default function SkillsSection() {
  return (
    <section id="skills" className="container-px mx-auto max-w-content scroll-mt-28 py-20">
      <p className="section-heading">02. Skills</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(skills).map(([group, items]) => (
          <div key={group} className="rounded-lg border border-ink-800 bg-ink-900/50 p-6">
            <h3 className="mb-4 font-mono text-sm font-semibold text-ink-100">{group}</h3>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <span key={item} className="rounded-full border border-ink-700 px-3 py-1 text-xs text-ink-300">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
