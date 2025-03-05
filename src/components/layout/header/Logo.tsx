import Link from 'next/link'
import Image from 'next/image'

export function Logo() {
  return (
    <Link 
      href="/" 
      className="group relative z-10 flex items-center"
    >
      <Image
        src="/images/Logo_web.png"
        alt="TruyenLight Logo"
        width={180}
        height={40}
        className="transition-transform duration-300 group-hover:scale-105"
        priority
      />
    </Link>
  )
} 