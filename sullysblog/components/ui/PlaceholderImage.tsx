import Image from 'next/image'

type PlaceholderImageProps = {
  className?: string
}

export function PlaceholderImage({ className = '' }: PlaceholderImageProps) {
  return (
    <div className={`bg-gray-700 flex items-center justify-center ${className}`}>
      <Image
        src="/logo-dark.png"
        alt="SullysBlog.com"
        width={200}
        height={50}
        className="opacity-70 max-w-[60%] h-auto"
      />
    </div>
  )
}
