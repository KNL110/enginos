import { profile } from "~/data/portfolio"

export default function AboutSection() {
  return (
    <section id="about" className="container-px mx-auto max-w-content scroll-mt-28 py-20">
      <p className="section-heading">01. About</p>
      <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4 text-ink-300">
          <p>
            I&apos;m a third-year Mathematics and Computing undergraduate at{" "}
            <span className="text-ink-100">{profile.institute}</span>. I like problems that sit at the
            intersection of math and code — whether that&apos;s training a model to pick the right answer,
            designing a database-backed system from scratch, or building a virtual machine from bytecode up.
          </p>
          <p>
            Outside of coursework, I&apos;m a core member of IIT Goa&apos;s cybersecurity club (Infosec) and an
            architect in the Web Dev club, and I served as secretary of the Math and Finance club. I was also
            selected to represent IIT Goa at the Inter IIT Tech Meet in the High Prep AI/ML track.
          </p>
          <p>
            I&apos;m comfortable across the stack — from PyTorch model training to MERN full-stack apps to
            systems-y projects in C/C++ — and I&apos;m always looking for the next thing to build.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-4 rounded-lg border border-ink-800 bg-ink-900/50 p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-400">Quick facts</p>
          <ul className="space-y-3 text-sm text-ink-300">
            <li className="flex justify-between gap-4">
              <span className="text-ink-400">Institute</span>
              <span className="text-right">IIT Goa</span>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-ink-400">Program</span>
              <span className="text-right">B.Tech, Math &amp; Computing</span>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-ink-400">Year</span>
              <span className="text-right">2024 — Present</span>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-ink-400">Focus</span>
              <span className="text-right">ML, Full-Stack, Systems</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
