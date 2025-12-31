import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Generate a consistent voter identifier from IP
function getVoterIdentifier(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.SUPABASE_SERVICE_KEY).digest('hex').substring(0, 32)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { commentId, voteType } = body

    if (!commentId || !voteType || !['up', 'down'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
               headersList.get('x-real-ip') ||
               'unknown'
    const voterIdentifier = getVoterIdentifier(ip)

    // Check if vote exists
    const { data: existingVote } = await supabase
      .from('comment_votes')
      .select('id, vote_type')
      .eq('comment_id', commentId)
      .eq('voter_identifier', voterIdentifier)
      .single()

    if (existingVote) {
      // Update existing vote
      if (existingVote.vote_type !== voteType) {
        await supabase
          .from('comment_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id)
      }
    } else {
      // Insert new vote
      await supabase
        .from('comment_votes')
        .insert({
          comment_id: commentId,
          voter_identifier: voterIdentifier,
          vote_type: voteType
        })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { commentId } = body

    if (!commentId) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
               headersList.get('x-real-ip') ||
               'unknown'
    const voterIdentifier = getVoterIdentifier(ip)

    await supabase
      .from('comment_votes')
      .delete()
      .eq('comment_id', commentId)
      .eq('voter_identifier', voterIdentifier)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Vote delete error:', error)
    return NextResponse.json(
      { error: 'Failed to remove vote' },
      { status: 500 }
    )
  }
}
