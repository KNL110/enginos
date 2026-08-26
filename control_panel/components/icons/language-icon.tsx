import type { IconType } from "react-icons";
import {
    SiC,
    SiCmake,
    SiCplusplus,
    SiCss,
    SiDart,
    SiDocker,
    SiElixir,
    SiGnubash,
    SiGo,
    SiHaskell,
    SiHtml5,
    SiJavascript,
    SiJupyter,
    SiKotlin,
    SiLua,
    SiMake,
    SiPhp,
    SiPostgresql,
    SiPython,
    SiRuby,
    SiRust,
    SiSass,
    SiScala,
    SiSvelte,
    SiSwift,
    SiTypescript,
    SiVuedotjs,
} from "react-icons/si";
import { FileCode2 } from "lucide-react";

interface LanguageMeta {
    icon: IconType;
    color: string;
}

// Approximate GitHub linguist colors, matched to the closest Simple Icons
// brand mark — not exhaustive, unmapped languages fall back to a generic
// file icon rather than guessing at a logo.
const LANGUAGE_MAP: Record<string, LanguageMeta> = {
    TypeScript: { icon: SiTypescript, color: "#3178c6" },
    JavaScript: { icon: SiJavascript, color: "#f1e05a" },
    Python: { icon: SiPython, color: "#3572A5" },
    Go: { icon: SiGo, color: "#00ADD8" },
    Rust: { icon: SiRust, color: "#dea584" },
    C: { icon: SiC, color: "#555555" },
    "C++": { icon: SiCplusplus, color: "#f34b7d" },
    PHP: { icon: SiPhp, color: "#4F5D95" },
    Ruby: { icon: SiRuby, color: "#701516" },
    Swift: { icon: SiSwift, color: "#F05138" },
    Kotlin: { icon: SiKotlin, color: "#A97BFF" },
    HTML: { icon: SiHtml5, color: "#e34c26" },
    CSS: { icon: SiCss, color: "#563d7c" },
    SCSS: { icon: SiSass, color: "#c6538c" },
    Shell: { icon: SiGnubash, color: "#89e051" },
    Dockerfile: { icon: SiDocker, color: "#384d54" },
    "Jupyter Notebook": { icon: SiJupyter, color: "#DA5B0B" },
    PLpgSQL: { icon: SiPostgresql, color: "#336790" },
    CMake: { icon: SiCmake, color: "#DA3434" },
    Makefile: { icon: SiMake, color: "#427819" },
    Vue: { icon: SiVuedotjs, color: "#41b883" },
    Svelte: { icon: SiSvelte, color: "#ff3e00" },
    Lua: { icon: SiLua, color: "#000080" },
    Dart: { icon: SiDart, color: "#00B4AB" },
    Scala: { icon: SiScala, color: "#c22d40" },
    Haskell: { icon: SiHaskell, color: "#5e5086" },
    Elixir: { icon: SiElixir, color: "#6e4a7e" },
};

export function languageColor(language: string): string {
    return LANGUAGE_MAP[language]?.color ?? "var(--muted-foreground)";
}

export function LanguageIcon({ language, className }: { language: string; className?: string }) {
    const meta = LANGUAGE_MAP[language];
    const Icon = meta?.icon ?? FileCode2;
    return <Icon className={className} style={{ color: meta?.color ?? "var(--muted-foreground)" }} />;
}
