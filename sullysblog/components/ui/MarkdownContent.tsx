'use client'

import ReactMarkdown from 'react-markdown'
import Image from 'next/image'

type MarkdownContentProps = {
  content: string
  className?: string
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  return (
    <div className={`prose prose-lg dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          // Custom image renderer to use Next.js Image component
          img: ({ node, src, alt, ...props }) => {
            if (!src) return null

            // For uploaded images (Supabase storage), use regular img tag
            // because we don't know the dimensions
            return (
              <span className="block my-6">
                <img
                  src={src}
                  alt={alt || ''}
                  className="rounded-lg max-w-full h-auto mx-auto"
                  loading="lazy"
                  {...props}
                />
              </span>
            )
          },
          // Ensure links open in new tab for external URLs
          a: ({ node, href, children, ...props }) => {
            const isExternal = href?.startsWith('http')
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-blue-600 dark:text-blue-400 hover:underline"
                {...props}
              >
                {children}
              </a>
            )
          },
          // Style paragraphs
          p: ({ node, children, ...props }) => (
            <p className="text-gray-700 dark:text-gray-300 mb-4" {...props}>
              {children}
            </p>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
