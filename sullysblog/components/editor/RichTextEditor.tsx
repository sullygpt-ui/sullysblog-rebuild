'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { useState, useRef } from 'react'

type RichTextEditorProps = {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  postId?: string
}

export function RichTextEditor({ content, onChange, placeholder, postId }: RichTextEditorProps) {
  const [showHtml, setShowHtml] = useState(false)
  const [htmlContent, setHtmlContent] = useState(content)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showImageMenu, setShowImageMenu] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setHtmlContent(html)
      onChange(html)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[400px] px-4 py-2',
      },
    },
  })

  const addImageFromUrl = () => {
    const url = window.prompt('Enter image URL:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
    setShowImageMenu(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    setUploadingImage(true)
    setShowImageMenu(false)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (postId) {
        formData.append('postId', postId)
      }

      const response = await fetch('/api/admin/upload-post-image', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload image')
      }

      editor.chain().focus().setImage({ src: result.url }).run()
    } catch (err: any) {
      console.error('Image upload error:', err)
      alert(err.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
    }
  }

  const triggerImageUpload = () => {
    imageInputRef.current?.click()
    setShowImageMenu(false)
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const handleHtmlChange = (newHtml: string) => {
    setHtmlContent(newHtml)
    if (editor) {
      editor.commands.setContent(newHtml)
    }
    onChange(newHtml)
  }

  if (!editor) {
    return <div>Loading editor...</div>
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-2 flex flex-wrap gap-1">
        {/* View Toggle */}
        <button
          type="button"
          onClick={() => setShowHtml(!showHtml)}
          className={`px-3 py-1 rounded text-sm font-medium ${
            showHtml
              ? 'bg-gray-700 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {showHtml ? 'Visual' : 'HTML'}
        </button>

        <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {!showHtml && (
          <>
            {/* Text Formatting */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`px-3 py-1 rounded text-sm font-bold ${
                editor.isActive('bold')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              B
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`px-3 py-1 rounded text-sm italic ${
                editor.isActive('italic')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              I
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`px-3 py-1 rounded text-sm line-through ${
                editor.isActive('strike')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              S
            </button>

            <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

            {/* Headings */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`px-3 py-1 rounded text-sm font-bold ${
                editor.isActive('heading', { level: 1 })
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`px-3 py-1 rounded text-sm font-bold ${
                editor.isActive('heading', { level: 2 })
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`px-3 py-1 rounded text-sm font-bold ${
                editor.isActive('heading', { level: 3 })
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              H3
            </button>

            <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

            {/* Lists */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`px-3 py-1 rounded text-sm ${
                editor.isActive('bulletList')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              • List
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`px-3 py-1 rounded text-sm ${
                editor.isActive('orderedList')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              1. List
            </button>

            <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

            {/* Blocks */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`px-3 py-1 rounded text-sm ${
                editor.isActive('blockquote')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Quote
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`px-3 py-1 rounded text-sm font-mono ${
                editor.isActive('codeBlock')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Code
            </button>

            <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

            {/* Insert */}
            <button
              type="button"
              onClick={addLink}
              className={`px-3 py-1 rounded text-sm ${
                editor.isActive('link')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Link
            </button>
            <div className="relative">
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => setShowImageMenu(!showImageMenu)}
                disabled={uploadingImage}
                className="px-3 py-1 rounded text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                {uploadingImage ? 'Uploading...' : 'Image'}
              </button>
              {showImageMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-[140px]">
                  <button
                    type="button"
                    onClick={triggerImageUpload}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                  >
                    Upload Image
                  </button>
                  <button
                    type="button"
                    onClick={addImageFromUrl}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                  >
                    From URL
                  </button>
                </div>
              )}
            </div>

            <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

            {/* Undo/Redo */}
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="px-3 py-1 rounded text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="px-3 py-1 rounded text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Redo
            </button>
          </>
        )}
      </div>

      {/* Editor Content */}
      <div className="bg-white dark:bg-gray-900">
        {showHtml ? (
          <textarea
            value={htmlContent}
            onChange={(e) => handleHtmlChange(e.target.value)}
            className="w-full min-h-[400px] p-4 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none"
            placeholder="Enter HTML..."
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
        {showHtml ? 'Editing raw HTML' : 'Rich text editor - Click "HTML" to edit raw code'}
      </div>
    </div>
  )
}
