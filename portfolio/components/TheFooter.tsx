import { profile } from "~/data/portfolio"

export default function TheFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="container-px mx-auto max-w-content border-t border-ink-800 py-8 text-center">
      <p className="font-mono text-xs text-ink-400">
        Built by {profile.name} &middot; &copy; {year}
      </p>
    </footer>
  )
}
