import { compileMDX } from "next-mdx-remote/rsc";
import path from "node:path";
import { promises as fs } from "node:fs";

async function loadGuidesContent() {
  const filePath = path.join(process.cwd(), "app", "(public)", "guides", "page.mdx");
  const source = await fs.readFile(filePath, "utf8");
  const { content } = await compileMDX({ source });
  return content;
}

export default async function GuidesPage() {
  const content = await loadGuidesContent();
  return <article className="prose prose-slate max-w-none">{content}</article>;
}
