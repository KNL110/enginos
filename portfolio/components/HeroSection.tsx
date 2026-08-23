import Image from "next/image"
import { profile } from "~/data/portfolio"

export default function HeroSection() {
  return (
    <section
      id="top"
      className="container-px mx-auto grid max-w-content items-center gap-16 py-24 sm:py-32 lg:min-h-[85vh] lg:grid-cols-[1fr_1.3fr] lg:gap-12"
    >
      <div className="flex flex-col justify-center gap-6 lg:order-2">
        {profile.availableForFreelance && (
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-xs text-accent-soft">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
            </span>
            Available for freelance work
          </div>
        )}
        <p className="font-mono text-sm text-accent">Hi, my name is</p>
        <h1 className="text-4xl font-extrabold leading-tight text-ink-100 sm:text-6xl xl:text-7xl">
          {profile.name}.
        </h1>
        <h2 className="text-3xl font-extrabold leading-tight text-ink-400 sm:text-5xl xl:text-6xl">
          I am a {profile.fieldOfStudy} Undergraduate at IIT Goa.
        </h2>
        <p className="max-w-xl text-base leading-relaxed text-ink-300 sm:text-lg">
          {profile.tagline}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <a
            href="#projects"
            className="rounded-md border border-accent bg-accent/10 px-6 py-3 font-mono text-sm text-accent transition-colors hover:bg-accent/20"
          >
            View my projects
          </a>
          <a
            href={profile.resume}
            target="_blank"
            rel="noopener"
            className="rounded-md border border-ink-700 px-6 py-3 font-mono text-sm text-ink-200 transition-colors hover:border-ink-600 hover:text-ink-100"
          >
            Download résumé
          </a>
        </div>

        <div className="mt-6 flex items-center gap-5 text-ink-400">
          <a href={profile.links.github} target="_blank" rel="noopener" aria-label="GitHub" className="transition-colors hover:text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
              <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.08.78 2.17 0 1.57-.01 2.83-.01 3.22 0 .32.21.67.8.56A10.52 10.52 0 0 0 23.5 12c0-6.27-5.23-11.5-11.5-11.5Z" />
            </svg>
          </a>
          <a href={profile.links.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn" className="transition-colors hover:text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.446-2.136 2.94v5.666H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.56V9h3.554v11.452z" />
            </svg>
          </a>
          <a href={profile.links.kaggle} target="_blank" rel="noopener" aria-label="Kaggle" className="transition-colors hover:text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
              <path d="M18.825 23.859c-.022.092-.117.141-.281.141h-3.139c-.187 0-.351-.082-.492-.248l-5.178-6.589-1.448 1.374v5.111c0 .235-.117.352-.351.352H5.505c-.236 0-.353-.117-.353-.352V.353c0-.233.117-.353.353-.353h2.431c.234 0 .351.12.351.353v14.343l6.203-6.272c.165-.165.328-.246.492-.246h3.239c.144 0 .239.06.284.179.045.12.021.234-.071.343l-6.577 6.427 6.966 8.541c.075.09.104.196.075.318l.001-.127Z" />
            </svg>
          </a>
          <a href={`mailto:${profile.email}`} aria-label="Email" className="transition-colors hover:text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
            </svg>
          </a>
        </div>
      </div>

      <div className="relative mx-auto hidden aspect-square w-full max-w-sm lg:order-1 lg:block">
        <div className="absolute inset-0 rounded-2xl bg-accent/20 blur-3xl"></div>
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-ink-700 bg-ink-900">
          <Image src="/profile.jpg" alt={profile.name} fill sizes="384px" className="object-cover" priority />
        </div>
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-[220px] lg:hidden">
        <div className="absolute inset-0 rounded-2xl bg-accent/20 blur-2xl"></div>
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-ink-700 bg-ink-900">
          <Image src="/profile.jpg" alt={profile.name} fill sizes="220px" className="object-cover" />
        </div>
      </div>
    </section>
  )
}
