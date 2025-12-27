import styles from './PostContent.module.css'

type PostContentProps = {
  content: string
}

export function PostContent({ content }: PostContentProps) {
  return (
    <article
      className={styles.article}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
