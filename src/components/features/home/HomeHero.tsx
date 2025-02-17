import Image from 'next/image'

export function HomeHero() {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.2] bg-grid-8" />
      <div className="relative flex flex-col md:flex-row items-center justify-between p-8 md:p-12">
        <div className="text-white max-w-xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Khám Phá Thế Giới Truyện Chữ
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8">
            Nền tảng đọc truyện bản quyền hàng đầu Việt Nam với hàng ngàn tác phẩm chất lượng
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Khám phá ngay
            </button>
            <button className="px-6 py-3 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors">
              Tìm hiểu thêm
            </button>
          </div>
        </div>
        
        <div className="relative w-full md:w-1/2 mt-8 md:mt-0 aspect-[4/3] md:aspect-square">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/50 to-transparent md:hidden" />
          <Image
            src="/images/hero-illustration.png"
            alt="Hero illustration"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </section>
  )
} 