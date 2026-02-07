import Image from 'next/image'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-gray-800 to-red-950">
      <div className="w-full max-w-3xl px-6 py-12 text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image 
            src="/logo.png" 
            alt="Elham Abu Sarhad for Umrah Services" 
            width={400}
            height={166}
            className="w-full max-w-md h-auto drop-shadow-2xl"
            priority
          />
        </div>

        {/* Arabic Welcome Text */}
        <div className="space-y-4 mt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-balance" dir="rtl">
          قريباً... 
          </h1>

        </div>
      </div>
    </div>
  )
}
