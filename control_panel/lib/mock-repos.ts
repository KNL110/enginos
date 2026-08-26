// Placeholder data — there's no repo-connection feature yet, so this stands
// in for a real GitHub repo list. Shaped to match what that API response
// will need, so swapping this out later is a data-source change, not a UI
// rewrite.
export type RepoStatus = "ready" | "indexing" | "new" | "failed";

export interface MockRepo {
  id: string;
  owner: string;
  name: string;
  description: string | null;
  visibility: "public" | "private";
  status: RepoStatus;
  branch: string;
  language: string;
  chunks?: number;
}

export const MOCK_REPOS: MockRepo[] = [
  {
    id: "1",
    owner: "__dashtest",
    name: "devpilot-backend",
    description: "Express API — auth, sessions, and the RAG/pipeline services to come.",
    visibility: "private",
    status: "ready",
    branch: "main",
    language: "TypeScript",
    chunks: 128,
  },
  {
    id: "2",
    owner: "__dashtest",
    name: "devpilot-control-panel",
    description: "The dashboard you're looking at right now.",
    visibility: "private",
    status: "indexing",
    branch: "main",
    language: "TypeScript",
  },
  {
    id: "3",
    owner: "__dashtest",
    name: "portfolio",
    description: "Personal portfolio and CV site.",
    visibility: "public",
    status: "ready",
    branch: "main",
    language: "TypeScript",
    chunks: 42,
  },
  {
    id: "4",
    owner: "__dashtest",
    name: "dotfiles",
    description: "Shell, editor, and tooling config.",
    visibility: "public",
    status: "new",
    branch: "main",
    language: "Shell",
  },
  {
    id: "5",
    owner: "__dashtest",
    name: "infra-notes",
    description: "Private scratch notes on deploy targets and env setup.",
    visibility: "private",
    status: "new",
    branch: "main",
    language: "Markdown",
  },
  {
    id: "6",
    owner: "__dashtest",
    name: "old-experiments",
    description: null,
    visibility: "public",
    status: "failed",
    branch: "main",
    language: "Python",
  },
];
