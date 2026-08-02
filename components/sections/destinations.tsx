"use client"

import Image from "next/image"
import {
  Hotel,
  Plane,
  FileCheck,
  Map,
  Shield,
  Headphones,
} from "lucide-react"
import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import { useEffect, useState, useRef } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

const HERO_VIDEOS = [
  "/images/homepage.mp4",
  "/images/homepage2.mp4",
  "/images/homepage3.mp4",
]

const services = [
  {
    icon: FileCheck,
    key: "feature.easyVisa",
    descKey: "feature.easyVisa.desc",
    image: "images/visa2.jpeg",
  },
  {
    icon: Hotel,
    key: "feature.luxuryHotel",
    descKey: "feature.luxuryHotel.desc",
    image: "images/hotel.jpeg",
  },
  {
    icon: Plane,
    key: "feature.vipPlanes",
    descKey: "feature.vipPlanes.desc",
    image: "images/bus.jpeg",
  },
  {
    icon: Map,
    key: "feature.roadmapGuide",
    descKey: "feature.roadmapGuide.desc",
    image: "images/tourism.jpg",
  },
]

export function DestinationsSection() {
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>(0.08)
  const { t, locale, isRTL } = useI18n()
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  // Dual-buffer playlist: active layer plays; inactive preloads the next clip
  const [activeLayer, setActiveLayer] = useState(0)
  const [layerSrc, setLayerSrc] = useState([HERO_VIDEOS[0], HERO_VIDEOS[1]])
  const [playingIndex, setPlayingIndex] = useState(0)
  const video0Ref = useRef<HTMLVideoElement>(null)
  const video1Ref = useRef<HTMLVideoElement>(null)
  const transitioningRef = useRef(false)
  const primedRef = useRef(false)

  const getVideo = (layer: number) =>
    layer === 0 ? video0Ref.current : video1Ref.current

  useEffect(() => {
    if (!api) return
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  // Keep the inactive layer loaded with the upcoming video
  useEffect(() => {
    const nextIndex = (playingIndex + 1) % HERO_VIDEOS.length
    const inactive = activeLayer === 0 ? 1 : 0
    setLayerSrc((prev) => {
      if (prev[inactive] === HERO_VIDEOS[nextIndex]) return prev
      const next = [...prev]
      next[inactive] = HERO_VIDEOS[nextIndex]
      return next
    })
    primedRef.current = false
  }, [playingIndex, activeLayer])

  useEffect(() => {
    const inactive = activeLayer === 0 ? 1 : 0
    const video = getVideo(inactive)
    if (!video) return
    video.pause()
    video.load()
  }, [layerSrc, activeLayer])

  const switchToNext = async () => {
    if (transitioningRef.current) return
    transitioningRef.current = true

    const nextLayer = activeLayer === 0 ? 1 : 0
    const nextVideo = getVideo(nextLayer)
    const currentVideo = getVideo(activeLayer)

    if (nextVideo) {
      try {
        if (nextVideo.readyState < 2) {
          await new Promise<void>((resolve) => {
            const done = () => {
              nextVideo.removeEventListener("canplay", done)
              resolve()
            }
            nextVideo.addEventListener("canplay", done)
            window.setTimeout(done, 800)
          })
        }
        if (nextVideo.paused) {
          nextVideo.currentTime = 0
          await nextVideo.play()
        }
      } catch {
        // Autoplay can fail; still swap so playlist continues
      }
    }

    setActiveLayer(nextLayer)
    setPlayingIndex((i) => (i + 1) % HERO_VIDEOS.length)

    window.setTimeout(() => {
      currentVideo?.pause()
      if (currentVideo) currentVideo.currentTime = 0
      transitioningRef.current = false
      primedRef.current = false
    }, 450)
  }

  const handleTimeUpdate = (layer: number) => {
    if (layer !== activeLayer || transitioningRef.current || primedRef.current) return
    const video = getVideo(layer)
    if (!video || !video.duration || !Number.isFinite(video.duration)) return

    // Start the next clip early so the first frame is ready before the cut
    if (video.duration - video.currentTime <= 0.35) {
      primedRef.current = true
      const nextVideo = getVideo(activeLayer === 0 ? 1 : 0)
      if (nextVideo) {
        nextVideo.currentTime = 0
        void nextVideo.play().catch(() => {})
      }
    }
  }

  return (
    <>
      {/* Hero video — full width; dual layers crossfade to avoid jump */}
      <div className="relative w-full overflow-hidden bg-black">
        {layerSrc.map((src, layer) => {
          const isActive = activeLayer === layer
          return (
            <video
              key={layer}
              ref={layer === 0 ? video0Ref : video1Ref}
              src={src}
              muted
              playsInline
              autoPlay={layer === 0}
              preload="auto"
              onEnded={() => {
                if (layer === activeLayer) void switchToNext()
              }}
              onTimeUpdate={() => handleTimeUpdate(layer)}
              aria-hidden={!isActive}
              aria-label={isActive ? "Hero Video" : undefined}
              className={cn(
                "pointer-events-none w-full transition-opacity duration-300 ease-out",
                isActive
                  ? "relative z-[1] h-auto opacity-100"
                  : "absolute inset-x-0 top-0 z-0 h-auto opacity-0"
              )}
            />
          )
        })}
        {/* Overlay gradient for smooth transition */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/3 bg-gradient-to-b from-transparent to-[#2d0f12]/90" />
      </div>

      {/* Main content section */}
      <section
        ref={sectionRef}
        id="destinations"
        className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-28"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#2d0f12] via-[#3a1518] to-[#4a1c20]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,hsl(var(--primary)/0.15),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-3xl text-center md:mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[2.5rem]">
            {locale === "ar" ? "استكشف خدماتنا" : "Our Services"}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/80 md:text-lg">
            {locale === "ar"
              ? "كل ما تحتاجه لرحلة عمرة مريحة... ضمن حزمة واحدة"
              : "We deliver exceptional Hajj & Umrah experiences with luxury stays, expert guides, and full support for your blessed journey."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative px-6 sm:px-10 md:px-14 lg:px-20 min-w-0"
        >
          <Carousel
            key={isRTL ? "rtl" : "ltr"}
            setApi={setApi}
            opts={{
              align: "start",
              loop: false,
              direction: isRTL ? "rtl" : "ltr",
            }}
            className="w-full"
            dir={isRTL ? "rtl" : "ltr"}
          >
            <CarouselContent className="-ml-3 sm:-ml-4 md:-ml-6">
              {services.map((service, index) => {
                const Icon = service.icon
                return (
                  <CarouselItem
                    key={service.key}
                    className="pl-3 sm:pl-4 md:pl-6 basis-full md:basis-1/2 lg:basis-1/3"
                  >
                    <motion.div
                      className="group relative overflow-hidden rounded-xl sm:rounded-2xl min-w-0"
                      initial={{ opacity: 0, y: 20 }}
                      animate={isVisible ? { opacity: 1, y: 0 } : {}}
                      transition={{
                        duration: 0.5,
                        delay: 0.15 + index * 0.08,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      whileHover={{ y: -6, transition: { duration: 0.25 } }}
                    >
                      <div className="absolute inset-0">
                        <Image
                          src={service.image}
                          alt=""
                          fill
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#4a1c20]/95 via-[#4a1c20]/50 to-[#4a1c20]/0" />
                      </div>
                      <div className="relative flex flex-col justify-end p-4 sm:p-6 min-h-[260px] sm:min-h-[280px] md:min-h-[320px]">
                        <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-white/20 text-white backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white break-words">
                          {t(service.key)}
                        </h3>
                        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed text-white/90 line-clamp-3 break-words">
                          {t(service.descKey)}
                        </p>
                      </div>
                    </motion.div>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            <CarouselPrevious
              className={cn(
                "left-0 border-white/20 bg-[#4a1c20]/90 text-white hover:bg-[#4a1c20] hover:text-white disabled:opacity-40",
                isRTL && "left-auto right-0 [&>svg]:scale-x-[-1]"
              )}
            />
            <CarouselNext
              className={cn(
                "right-0 border-white/20 bg-[#4a1c20]/90 text-white hover:bg-[#4a1c20] hover:text-white disabled:opacity-40",
                isRTL && "right-auto left-0 [&>svg]:scale-x-[-1]"
              )}
            />
          </Carousel>

          {/* Dots — one per snap point (page) */}
          {count > 0 && (
            <div className="mt-6 flex justify-center gap-2">
              {Array.from({ length: count }, (_, i) => (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => api?.scrollTo(i)}
                  aria-label={`${locale === "ar" ? "الصفحة" : "Page"} ${i + 1}`}
                  className={cn(
                    "h-2 rounded-full",
                    current === i + 1 ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                  )}
                  animate={{
                    width: current === i + 1 ? 24 : 8,
                    opacity: current === i + 1 ? 1 : 0.6,
                  }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ opacity: 1 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          )}
        </motion.div>
        </div>
      </section>
    </>
  )
}
