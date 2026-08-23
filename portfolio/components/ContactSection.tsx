import { profile } from "~/data/portfolio"

export default function ContactSection() {
  return (
    <section id="contact" className="container-px mx-auto max-w-content scroll-mt-28 py-28 text-center">
      <p className="section-heading inline-flex w-full justify-center">06. What&apos;s Next?</p>
      <h2 className="text-3xl font-extrabold text-ink-100 sm:text-4xl">Get In Touch</h2>
      <p className="mx-auto mt-4 max-w-md text-ink-300">
        I&apos;m always open to chatting about ML, systems, or interesting problems — or hearing about
        internship and collaboration opportunities. My inbox is open.
      </p>
      {profile.availableForFreelance && (
        <p className="mx-auto mt-2 max-w-md font-mono text-sm text-accent">
          Currently available for freelance work.
        </p>
      )}
      <a
        href={`mailto:${profile.email}`}
        className="mt-8 inline-block rounded-md border border-accent px-8 py-3 font-mono text-sm text-accent transition-colors hover:bg-accent/10"
      >
        Say Hello
      </a>
    </section>
  )
}
