import { education } from "~/data/portfolio"

export default function EducationSection() {
  return (
    <section id="education" className="container-px mx-auto max-w-content scroll-mt-28 py-20">
      <p className="section-heading">04. Education</p>
      <div className="grid gap-6 sm:grid-cols-3">
        {education.map((item) => (
          <div key={item.school} className="rounded-lg border border-ink-800 bg-ink-900/50 p-6">
            <p className="font-mono text-xs text-accent">{item.period}</p>
            <h3 className="mt-2 font-semibold text-ink-100">{item.degree}</h3>
            <p className="mt-1 text-sm text-ink-300">{item.school}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
