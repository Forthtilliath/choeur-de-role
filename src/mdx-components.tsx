import type { MDXComponents } from "mdx/types"

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-3xl font-medium mb-6">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-medium mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-medium mb-3">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="mb-4 leading-relaxed">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
    ),
    a: ({ href, children }) => (
      <a href={href} className="underline hover:opacity-70">
        {children}
      </a>
    ),
    ...components,
  }
}