import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database'

type Comment = Database['public']['Tables']['comments']['Row']

export type CommentWithReplies = Comment & {
  replies: CommentWithReplies[]
}

export type CommentSortOption = 'newest' | 'oldest' | 'most_replies' | 'most_votes'

export async function getCommentsByPostId(
  postId: string,
  sortBy: CommentSortOption = 'newest'
): Promise<CommentWithReplies[]> {
  const supabase = await createClient()

  // Fetch all approved comments for this post
  const { data: comments, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .eq('status', 'approved')
    .order('created_at', { ascending: sortBy === 'oldest' })

  if (error || !comments || comments.length === 0) {
    return []
  }

  return buildCommentTree(comments, sortBy)
}

export async function getPostAuthorEmail(postId: string): Promise<string | null> {
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', postId)
    .single()

  if (!post?.author_id) return null

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', post.author_id)
    .single()

  if (!profile) return null

  // Get email from auth.users via admin client
  // For now, return null - author identification handled client-side
  return null
}

function buildCommentTree(comments: Comment[], sortBy: CommentSortOption = 'newest'): CommentWithReplies[] {
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

  // Sort root comments based on sortBy option
  const sortComments = (a: CommentWithReplies, b: CommentWithReplies): number => {
    // Pinned comments always first
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1

    // Best comments second
    if (a.is_best && !b.is_best) return -1
    if (!a.is_best && b.is_best) return 1

    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'most_replies':
        return (b.reply_count || 0) - (a.reply_count || 0)
      case 'most_votes':
        return ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0))
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  }

  rootComments.sort(sortComments)

  // Sort replies within each thread (always chronological for readability)
  const sortReplies = (comment: CommentWithReplies) => {
    comment.replies.sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    comment.replies.forEach(sortReplies)
  }
  rootComments.forEach(sortReplies)

  return rootComments
}
