import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database'

type Comment = Database['public']['Tables']['comments']['Row']

export type CommentWithReplies = Comment & {
  replies: CommentWithReplies[]
}

export async function getCommentsByPostId(postId: string): Promise<CommentWithReplies[]> {
  const supabase = await createClient()

  // Fetch all approved comments for this post
  const { data: comments, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })

  if (error || !comments || comments.length === 0) {
    return []
  }

  return buildCommentTree(comments)
}

function buildCommentTree(comments: Comment[]): CommentWithReplies[] {
  const commentMap = new Map<string, CommentWithReplies>()
  const rootComments: CommentWithReplies[] = []

  // First pass: create map with empty replies arrays
  comments.forEach(comment => {
    commentMap.set(comment.id, {
      ...comment,
      replies: []
    })
  })

  // Second pass: build tree structure
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)

    if (!commentWithReplies) return

    if (comment.parent_id) {
      // This is a reply - add it to parent's replies array
      const parent = commentMap.get(comment.parent_id)
      if (parent) {
        parent.replies.push(commentWithReplies)
      } else {
        // Parent not found (shouldn't happen with good data), treat as root
        rootComments.push(commentWithReplies)
      }
    } else {
      // This is a root comment
      rootComments.push(commentWithReplies)
    }
  })

  return rootComments
}
