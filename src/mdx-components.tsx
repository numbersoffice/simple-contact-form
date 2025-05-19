import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allows customizing built-in components, e.g. to add styling.
    h1: ({ children }) => <h1 className="text-4xl font-semibold mt-12 mb-6">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-semibold mt-12 mb-4">{children}</h2>,
    p: ({ children }) => <p className="mb-4">{children}</p>,
    a: ({ children, href }) => (
      <a href={href} className="text-blue-500 underline">
        {children}
      </a>
    ),
    table: ({ children }) => (
      <div className="overflow-scroll max-w-full">
        <table>{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-gray-200">{children}</thead>,
    th: ({ children }) => <th className="text-start p-2">{children}</th>,
    td: ({ children }) => <td className="p-2 border-[1px]">{children}</td>,
    tr: ({ children }) => <tr className="text-start">{children}</tr>,

    ...components,
  }
}
