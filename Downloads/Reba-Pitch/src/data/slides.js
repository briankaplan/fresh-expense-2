import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowRight, ArrowLeft, TrendingUp, Award, Building2, Store, Music, Home } from 'lucide-react';
import CinematicSlide from '../components/CinematicSlide';
import DynamicText from '../components/DynamicText';
import GrowthTimeline from '../components/GrowthTimeline';
import USMap from '../components/USMap';
import RevenueProjections from '../components/RevenueProjections';
import SkydanceSlide from '../components/SkydanceSlide';
import FinancialModelSlide from '../components/FinancialModelSlide';

// Animation variants for slide transitions
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

// Common transition settings
const slideTransition = {
  x: { type: "spring", stiffness: 300, damping: 30 },
  opacity: { duration: 0.4 }
};

export const slides = [
  {
    id: 'opening',
    title: 'Cinematic Introduction',
    component: ({ skipAnimations, currentSubStep }) => (
      <CinematicSlide 
        backgroundUrl="/images/1940s/1940.png"
        className="bg-black"
        variants={slideVariants}
        transition={slideTransition}
      >
        <div className="flex flex-col justify-center items-center h-full">
          <div className="text-center max-w-5xl mx-auto px-8">
            <motion.div
              initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: skipAnimations ? 0.3 : 1.5 }}
              className="space-y-8 font-avenir"
            >
              <DynamicText>
                <div className="flex justify-center items-center space-x-4">
                  <span className="text-5xl md:text-6xl text-white font-light tracking-wide">FOR OVER</span>
                  <span className="text-5xl md:text-6xl text-red-600 font-bold tracking-wide">80</span>
                  <span className="text-5xl md:text-6xl text-white font-light tracking-wide">YEARS</span>
                </div>
              </DynamicText>
              
              <DynamicText delay={skipAnimations ? 0 : 800}>
                <div className="flex flex-wrap justify-center items-center gap-4">
                  <span className="text-5xl md:text-7xl text-red-600 font-bold tracking-wide">COUNTRY MUSIC</span>
                  <span className="text-5xl md:text-7xl text-white font-light tracking-wide">AND</span>
                  <span className="text-5xl md:text-7xl text-red-600 font-bold tracking-wide">RODEO</span>
                </div>
              </DynamicText>

              <DynamicText delay={skipAnimations ? 0 : 1600}>
                <div className="flex flex-wrap justify-center items-center gap-4">
                  <span className="text-4xl md:text-5xl text-white font-light tracking-wide">
                    HAVE SHARED
                  </span>
                  <span className="text-4xl md:text-5xl text-red-600 font-bold tracking-wide">
                    ONE SOUL
                  </span>
                </div>
              </DynamicText>
            </motion.div>
          </div>
        </div>
      </CinematicSlide>
    )
  },
  {
    id: 'except',
    title: 'Nashville Exception',
    component: ({ skipAnimations }) => (
      <CinematicSlide className="bg-black">
        <div className="flex flex-col justify-center items-center h-full">
          <div className="text-center max-w-5xl mx-auto px-8">
            <motion.div
              initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-12 font-avenir"
            >
              <DynamicText>
                <p className="text-3xl md:text-4xl text-white/80 font-light tracking-wide">
                  Except in the city where country music calls home.
                </p>
              </DynamicText>
              
              <DynamicText delay={skipAnimations ? 0 : 3000}>
                <p className="text-5xl md:text-6xl text-red-600 font-bold tracking-widest">
                  UNTIL NOW
                </p>
              </DynamicText>
            </motion.div>
          </div>
        </div>
      </CinematicSlide>
    )
  },
  {
    id: 'event-intro',
    title: 'Event Introduction',
    component: ({ skipAnimations }) => (
      <CinematicSlide 
        backgroundUrl="/images/nashville/broadway.jpg"
        className="bg-black"
      >
        <div className="flex flex-col justify-center items-center h-full">
          <div className="text-center max-w-5xl mx-auto px-8">
            <motion.div
              initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12 font-avenir"
            >
              <DynamicText>
                <p className="text-4xl md:text-5xl text-white font-bold tracking-widest drop-shadow-lg">
                  MAY 29-31, 2025
                </p>
              </DynamicText>
              
              <DynamicText delay={skipAnimations ? 0 : 1000}>
                <div className="space-y-6">
                  <p className="text-3xl md:text-4xl text-white/90 font-light tracking-wide drop-shadow-lg">
                    THE SOUL OF COUNTRY MUSIC
                  </p>
                  <p className="text-3xl md:text-4xl text-white/90 font-light tracking-wide drop-shadow-lg">
                    MEETS THE SPIRIT OF THE RODEO
                  </p>
                </div>
              </DynamicText>

              <DynamicText delay={skipAnimations ? 0 : 2000}>
                <div className="space-y-2">
                  <p className="text-2xl md:text-3xl text-white/80 font-light tracking-wide drop-shadow-lg">
                    TO BRING
                  </p>
                  <div className="space-y-1">
                    <p className="text-3xl md:text-5xl text-red-600 font-bold tracking-widest drop-shadow-lg bg-black/30 py-2">
                      NASHVILLE'S FIRST
                    </p>
                    <p className="text-3xl md:text-5xl text-red-600 font-bold tracking-widest drop-shadow-lg bg-black/30 py-2">
                      PRCA RODEO
                    </p>
                  </div>
                </div>
              </DynamicText>
            </motion.div>
          </div>
        </div>
      </CinematicSlide>
    )
  },
  {
    id: 'logo-reveal',
    title: 'Logo Reveal',
    component: ({ skipAnimations }) => (
      <CinematicSlide className="bg-black">
        {/* Background Image with Overlays */}
        <div className="absolute inset-0">
          <img 
            src="/images/nashville/Rodeo.png"
            alt="Rodeo Background"
            className="w-full h-full object-cover opacity-40"
          />
          {/* Simplified overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center">
          {/* Decorative Elements */}
          <motion.div
            initial={skipAnimations ? {} : { opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 2 }}
            className="absolute inset-0"
          >
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-600/10 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-red-600/10 to-transparent" />
          </motion.div>

          {/* Center Container */}
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
              {/* Logo Section */}
              <motion.div 
                className="relative flex-shrink-0 md:pr-2"
                initial={skipAnimations ? {} : { scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.8, ease: [0.21, 0.53, 0.29, 0.99] }}
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 blur-2xl bg-red-600/20 scale-110" />
                
                <img 
                  src="/images/logo/mcr_logo.png" 
                  alt="Music City Rodeo Logo" 
                  className="w-[180px] md:w-[240px] lg:w-[280px] relative z-10 drop-shadow-2xl"
                />
              </motion.div>

              {/* Info Section */}
              <div className="flex-1 space-y-4 text-left max-w-lg md:pl-2 md:pt-4">
                {/* Date */}
                <motion.div
                  initial={skipAnimations ? {} : { opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-px bg-red-600/50" />
                    <p className="text-2xl md:text-3xl text-white font-light tracking-[0.3em]">
                      MAY 29 • 30 • 31
                    </p>
                  </div>
                  <p className="text-xl text-white/60 font-light tracking-[0.2em] pl-16">
                    2025
                  </p>
                </motion.div>

                {/* Location */}
                <motion.div
                  initial={skipAnimations ? {} : { opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 1 }}
                  className="space-y-3"
                >
                  <p className="text-2xl md:text-3xl text-white font-light tracking-[0.2em]">
                    BRIDGESTONE ARENA
                  </p>
                  <p className="text-2xl md:text-3xl tracking-[0.2em]">
                    <span className="text-red-600 font-medium">NASHVILLE</span>
                    <span className="text-white">, TENNESSEE</span>
                  </p>
                </motion.div>

                {/* Presenter */}
                <motion.div
                  initial={skipAnimations ? {} : { opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6, duration: 1 }}
                  className="space-y-2"
                >
                  <p className="text-sm text-white/60 tracking-[0.3em] uppercase">
                    Presented By
                  </p>
                  <p className="text-xl md:text-2xl text-red-600 font-medium tracking-[0.15em]">
                    TIM McGRAW AND DOWN HOME
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Decorative Corner Elements */}
          <motion.div
            initial={skipAnimations ? {} : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-8 left-8 w-32 h-32 border-l-2 border-t-2 border-red-600/20" />
            <div className="absolute top-8 right-8 w-32 h-32 border-r-2 border-t-2 border-red-600/20" />
            <div className="absolute bottom-8 left-8 w-32 h-32 border-l-2 border-b-2 border-red-600/20" />
            <div className="absolute bottom-8 right-8 w-32 h-32 border-r-2 border-b-2 border-red-600/20" />
          </motion.div>
        </div>
      </CinematicSlide>
    )
  },
  {
    id: 'invitation',
    title: 'Special Invitation',
    component: ({ skipAnimations }) => (
      <CinematicSlide className="bg-black">
        <div className="flex flex-col justify-center items-center h-full">
          <div className="text-center max-w-4xl mx-auto px-8">
            <motion.div
              initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12 font-avenir"
            >
              <DynamicText skipAnimation={skipAnimations}>
                <p className="text-2xl md:text-3xl text-white/90 font-light tracking-wide leading-relaxed">
                  To properly bring the sport of Rodeo to the home of Country Music, we are inviting a carefully chosen few who embody its spirit to partner with us.
                </p>
              </DynamicText>
              
              <DynamicText delay={skipAnimations ? 0 : 2000} skipAnimation={skipAnimations}>
                <p className="text-3xl md:text-4xl text-red-600 font-medium tracking-wide">
                  Reba McEntire, a true crown jewel, leads this extraordinary group.
                </p>
              </DynamicText>
            </motion.div>
          </div>
        </div>
      </CinematicSlide>
    )
  },
  {
    id: 'oklahoma-legacy',
    title: 'Oklahoma Legacy',
    component: ({ skipAnimations }) => (
      <CinematicSlide className="bg-black">
        <div className="absolute inset-0">
          <motion.div 
            className="h-full w-full"
            initial={skipAnimations ? { filter: "grayscale(100%) brightness(60%)" } : { filter: "grayscale(0%) brightness(100%)" }}
            animate={{ filter: "grayscale(0%) brightness(100%)" }}
            transition={{ duration: 3, delay: 4.5, ease: "easeInOut" }}
          >
            <img 
              src="/images/landscapes/oklahoma-sunset.jpg"
              alt="Oklahoma Sunset"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </motion.div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center h-full">
          <div className="text-center max-w-5xl mx-auto px-8">
            <motion.div className="space-y-8 font-avenir">
              <DynamicText delay={skipAnimations ? 0 : 1500}>
                <div className="flex flex-wrap justify-center items-center gap-4">
                  <span className="text-3xl md:text-4xl text-white font-light tracking-[0.25em]">
                    ON THIS LAND
                  </span>
                </div>
              </DynamicText>
              
              <DynamicText delay={skipAnimations ? 0 : 3000}>
                <div className="flex flex-wrap justify-center items-center gap-4">
                  <span className="text-4xl md:text-6xl text-white font-bold tracking-[0.25em]">
                    RESILIENCE WAS BORN
                  </span>
                </div>
              </DynamicText>

              <DynamicText delay={skipAnimations ? 0 : 4500}>
                <div className="flex flex-wrap justify-center items-center gap-4">
                  <p className="text-xl md:text-2xl text-white/90 font-light tracking-[0.15em]">
                    WHERE THE SUN RISES OVER 7,000 ACRES OF HARD WORK,
                  </p>
                  <p className="text-2xl md:text-3xl text-red-600 font-bold tracking-[0.15em]">
                    THE McENTIRE FAMILY BUILT THEIR LEGACY
                  </p>
                </div>
              </DynamicText>
            </motion.div>
          </div>
        </div>
      </CinematicSlide>
    )
  },
  {
    id: 'clark-legacy',
    title: 'Clark Legacy',
    component: ({ skipAnimations, currentSubStep = 0 }) => (
      <CinematicSlide className="bg-black">
        <div className="absolute inset-0">
          <div className="grid grid-cols-3 h-full gap-2 p-4">
            {[
              { src: "/images/Family/CMcEntire1.jpg", delay: 0.3, step: 0 },
              { src: "/images/Family/53d8003d2f50a.image.jpg", delay: 0.6, step: 0 },
              { src: "/images/Family/McEntire_Clark1-241x300.jpg", delay: 0.9, step: 0 },
              { src: "/images/Family/137692297_cc71c2e9-47dc-4832-8db6-df6ab8cf75da.jpeg", delay: 1.2, step: 0 },
              { src: "/images/Family/426648946_901506701637974_4652965490975321981_n.jpg", delay: 1.5, step: 0 },
              { src: "/images/Family/images.jpeg", delay: 1.8, step: 0 }
            ].map((photo, index) => (
              <motion.div
                key={photo.src}
                initial={skipAnimations ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ 
                  opacity: 1,
                  x: 0
                }}
                transition={{ 
                  duration: skipAnimations ? 0.3 : 1.5,
                  delay: skipAnimations ? 0 : photo.delay 
                }}
                className="relative overflow-hidden h-full"
              >
                <img 
                  src={photo.src}
                  alt="Clark McEntire"
                  className="w-full h-full object-cover grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
              </motion.div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center h-full">
          <div className="text-center max-w-4xl mx-auto px-8">
            <motion.div
              initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-16 font-avenir"
            >
              <DynamicText delay={skipAnimations ? 0 : 2000} skipAnimation={skipAnimations}>
                <div className="space-y-4">
                  <p className="text-4xl md:text-5xl text-white font-bold tracking-wide drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                    CLARK McENTIRE
                  </p>
                  <p className="text-2xl md:text-3xl text-red-600 font-extrabold tracking-wide drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                    THREE-TIME WORLD CHAMPION STEER ROPER
                  </p>
                </div>
              </DynamicText>

              <DynamicText delay={skipAnimations ? 0 : 3000} skipAnimation={skipAnimations}>
                <p className="text-2xl md:text-3xl text-white font-bold tracking-wide drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] leading-relaxed italic">
                  "instilled in his family the grit and determination of the rodeo"
                </p>
              </DynamicText>
            </motion.div>
          </div>
        </div>
      </CinematicSlide>
    )
  },
  {
    id: 'young-reba',
    title: 'Young Reba',
    component: ({ skipAnimations }) => (
      <CinematicSlide className="bg-black">
        <div className="absolute inset-0">
          <motion.div
            initial={skipAnimations ? { scale: 1, opacity: 1 } : { scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: [0.45, 0.05, 0.55, 0.95] }}
            className="relative h-full slide-7"
          >
            <img 
              src="/images/Family/reba-barrel.png"
              alt="Young Reba Barrel Racing"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </motion.div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center h-full">
          <div className="text-center max-w-4xl mx-auto px-8">
            <motion.div
              initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-16 font-avenir"
            >
              <DynamicText delay={skipAnimations ? 0 : 1000} skipAnimation={skipAnimations}>
                <p className="text-3xl md:text-4xl text-white font-light tracking-wide drop-shadow-lg">
                  Before the stages, there were arenas.
                </p>
              </DynamicText>
              
              <DynamicText delay={skipAnimations ? 0 : 2500} skipAnimation={skipAnimations}>
                <p className="text-3xl md:text-4xl text-white font-light tracking-wide drop-shadow-lg">
                  Before the spotlight, there were barrels.
                </p>
              </DynamicText>

              <DynamicText delay={skipAnimations ? 0 : 4000} skipAnimation={skipAnimations}>
                <p className="text-4xl md:text-5xl text-red-600 font-medium tracking-wide drop-shadow-lg">
                  Reba lived the cowgirl life.
                </p>
              </DynamicText>
            </motion.div>
          </div>
        </div>
      </CinematicSlide>
    )
  },
  {
    id: 'nfr-1974',
    title: 'NFR 1974',
    component: ({ skipAnimations }) => (
      <CinematicSlide className="bg-black">
        <div className="absolute inset-0">
          <motion.div
            initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="relative h-full"
          >
            <img 
              src="/images/Family/2-Reba_McEntire_750.jpg"
              alt="Young Reba McEntire at the rodeo"
              className="w-full h-full object-cover nfr-image opacity-80"
            />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </motion.div>
        </div>

        <div className="relative z-10 flex flex-col justify-end h-full pb-32">
          <div className="text-center max-w-4xl mx-auto px-8">
            <motion.div
              initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="space-y-6 font-avenir"
            >
              <DynamicText skipAnimation={skipAnimations}>
                <div className="flex flex-wrap justify-center items-center gap-4">
                  <p className="text-2xl md:text-3xl text-white/90 font-light tracking-[0.15em]">
                    Her voice soared over the rodeo crowd,
                  </p>
                </div>
              </DynamicText>

              <DynamicText delay={skipAnimations ? 0 : 800} skipAnimation={skipAnimations}>
                <div className="flex flex-wrap justify-center items-center gap-4">
                  <p className="text-2xl md:text-3xl text-red-600 font-bold tracking-[0.15em]">
                    capturing the hearts of those who knew her as one of their own.
                  </p>
                </div>
              </DynamicText>
            </motion.div>
          </div>
        </div>
      </CinematicSlide>
    )
  },
  {
    id: 'homecoming',
    title: 'Homecoming',
    component: ({ skipAnimations }) => (
      <CinematicSlide className="bg-black">
        <div className="absolute inset-0">
          <motion.div
            initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="relative h-full"
          >
            <img 
              src="/images/Family/reba4.jpg"
              alt="Reba McEntire Portrait"
              className="w-full h-full object-cover opacity-80 md:object-center object-[80%_center]"
            />
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </motion.div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center h-full">
          <div className="text-center max-w-3xl mx-auto px-8">
            <motion.div
              initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="space-y-8 font-avenir"
            >
              <DynamicText skipAnimation={skipAnimations}>
                <p className="text-2xl md:text-3xl text-white font-light tracking-[0.15em]">
                  FOR THE GIRL WHO GREW UP
                </p>
              </DynamicText>

              <DynamicText delay={skipAnimations ? 0 : 800} skipAnimation={skipAnimations}>
                <p className="text-2xl md:text-3xl text-red-600 font-bold tracking-[0.15em]">
                  BORROWING SADDLES AND RIDING ROPING HORSES,
                </p>
              </DynamicText>

              <DynamicText delay={skipAnimations ? 0 : 1600} skipAnimation={skipAnimations}>
                <div className="space-y-4">
                  <p className="text-2xl md:text-3xl text-white font-light tracking-[0.15em]">
                    THIS MOMENT WAS MORE THAN A GIFT
                  </p>
                  <p className="text-2xl md:text-3xl text-red-600 font-bold tracking-[0.15em]">
                    IT WAS A HOMECOMING.
                  </p>
                </div>
              </DynamicText>
            </motion.div>
          </div>
        </div>
      </CinematicSlide>
    )
  },
  {
    id: 'authenticity',
    title: 'Authenticity',
    component: ({ skipAnimations }) => (
      <CinematicSlide className="bg-black">
        <div className="absolute inset-0">
          <motion.div
            initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="relative h-full"
          >
            <img 
              src="/images/career/beauty.jpg"
              alt="Reba McEntire Portrait"
              className="w-full h-full object-cover authenticity-image opacity-80"
            />
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </motion.div>
        </div>

        <div className="relative z-10 flex flex-col justify-end h-full pb-16 md:pb-20">
          <div className="text-center max-w-[90%] md:max-w-3xl mx-auto px-4 md:px-8">
            <motion.div
              initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="space-y-3 md:space-y-4 font-avenir"
            >
              <DynamicText skipAnimation={skipAnimations}>
                <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4">
                  <p className="text-lg md:text-2xl text-white font-light tracking-[0.15em]">
                    NO ONE BRIDGES THESE WORLDS QUITE LIKE HER
                  </p>
                </div>
              </DynamicText>

              <DynamicText delay={skipAnimations ? 0 : 800} skipAnimation={skipAnimations}>
                <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4">
                  <p className="text-lg md:text-2xl text-red-600 font-bold tracking-[0.15em]">
                    REBA McENTIRE
                  </p>
                </div>
              </DynamicText>

              <DynamicText delay={skipAnimations ? 0 : 1600} skipAnimation={skipAnimations}>
                <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4">
                  <p className="text-lg md:text-2xl text-white font-light tracking-[0.15em]">
                    PROOF THAT AUTHENTICITY NEVER FADES
                  </p>
                </div>
              </DynamicText>
            </motion.div>
          </div>
        </div>
      </CinematicSlide>
    )
  },
  {
    id: 'growth-timeline',
    title: 'Growth Timeline',
    totalSubSteps: 4,  // Important for navigation
    component: ({ skipAnimations, currentSubStep }) => (
      <CinematicSlide className="bg-black">
        <GrowthTimeline skipAnimations={skipAnimations} currentSubStep={currentSubStep} />
      </CinematicSlide>
    )
  },
  {
    id: 'expansion-plans',
    title: 'Expansion Plans',
    component: ({ skipAnimations }) => (
      <CinematicSlide className="bg-black">
        <div className="flex flex-col h-full">
          {/* Header Section */}
          <motion.div
            initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-4 pb-2 text-center z-10"
          >
            <h2 className="text-3xl md:text-4xl text-white/90 font-light tracking-wide mb-2">
              EXPANSION PLANS
            </h2>
            <p className="text-2xl md:text-3xl text-red-600 font-bold tracking-wider">
              Launching the Southern Swing
            </p>
          </motion.div>

          {/* Main Content Section */}
          <div className="flex-1 flex flex-col md:flex-row gap-8 p-8">
            {/* Left Section with Map */}
            <div className="w-full md:w-2/3">
              <motion.div 
                initial={skipAnimations ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="h-[500px] md:h-[600px] relative"
              >
                <div className="absolute inset-0 bg-white/5 rounded-xl overflow-hidden">
                  <USMap className="w-full h-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
              </motion.div>
            </div>

            {/* Right Section with Market Info */}
            <motion.div
              initial={skipAnimations ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="w-full md:w-1/3 space-y-8"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl text-white/90 font-medium mb-4 tracking-wide">
                  TARGET MARKETS
                </h3>
                <ul className="space-y-4">
                  {[
                    { city: "Charlotte, NC", year: "2026" },
                    { city: "New Orleans, LA", year: "2027" },
                    { city: "Tampa, FL", year: "2028" },
                    { city: "Knoxville, TN", year: "2029" }
                  ].map((market, index) => (
                    <motion.li
                      key={market.city}
                      initial={skipAnimations ? {} : { opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: skipAnimations ? 0 : 0.7 + (index * 0.2) }}
                      className="flex items-center justify-between gap-4 border-b border-white/10 pb-2"
                    >
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-red-600" />
                        <span className="text-lg text-white/90">{market.city}</span>
                      </div>
                      <span className="text-sm text-red-600 font-medium">{market.year}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-600/10 backdrop-blur-sm rounded-xl p-6 border border-red-600/20">
                <h3 className="text-lg text-red-600 font-medium mb-2">
                  PROJECTED GROWTH
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Starting with Nashville as our flagship location, we plan to expand to four additional markets over the next five years, creating a powerful network of premier rodeo events across the Southeast.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </CinematicSlide>
    )
  },
  {
    id: 'offering',
    title: 'Offering',
    component: ({ skipAnimations }) => (
      <CinematicSlide className="bg-black">
        <div className="flex flex-col justify-center min-h-screen px-4 md:px-8 py-12">
          <motion.div
            initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto w-full"
          >
            {/* Header */}
            <DynamicText skipAnimation={skipAnimations}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl text-red-600 font-bold tracking-wide mb-3">
                  THE OPPORTUNITY
                </h2>
                <p className="text-xl md:text-2xl text-white/80 tracking-wide">
                  Join Us in Making History
                </p>
              </div>
            </DynamicText>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Market Context */}
              <DynamicText delay={skipAnimations ? 0 : 400}>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <Star className="w-12 h-12 text-red-600" />
                      <h3 className="text-2xl text-white font-medium">Market Context</h3>
                    </div>
                    <div className="space-y-6 flex-grow">
                      <div className="text-center py-4 border-b border-white/10">
                        <p className="text-4xl md:text-5xl text-red-600 font-bold mb-2">$330M</p>
                        <p className="text-lg text-white/80">Rodeo Houston Annual Revenue</p>
                      </div>
                      <div className="text-center py-4">
                        <p className="text-4xl md:text-5xl text-red-600 font-bold mb-2">$180M+</p>
                        <p className="text-lg text-white/80">MCR Projected Revenue by Year 5</p>
                      </div>
                    </div>
                  </div>
                </div>
              </DynamicText>

              {/* Ownership Details */}
              <DynamicText delay={skipAnimations ? 0 : 600}>
                <div className="bg-red-600/10 backdrop-blur-sm rounded-xl p-8 border border-red-600/20">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <Award className="w-12 h-12 text-red-600" />
                      <h3 className="text-2xl text-white font-medium">Ownership Stake</h3>
                    </div>
                    <div className="space-y-6 flex-grow">
                      <div className="text-center">
                        <p className="text-5xl md:text-6xl text-red-600 font-bold mb-4">2.5%</p>
                        <p className="text-xl text-white/90 mb-2">Ownership in Music City Rodeo</p>
                        <p className="text-lg text-white/70">Currently valued at <span className="text-red-600 font-bold">$20M+</span></p>
                      </div>
                      <div className="text-center pt-6 border-t border-red-600/20">
                        <p className="text-lg text-white/80 italic leading-relaxed">
                          "Be part of a legacy that bridges the worlds of country music and rodeo"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </DynamicText>
            </div>

            {/* Bottom Message */}
            <DynamicText delay={skipAnimations ? 0 : 800}>
              <div className="text-center max-w-2xl mx-auto">
                <motion.div
                  initial={skipAnimations ? {} : { y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/5 backdrop-blur-sm rounded-lg p-6"
                >
                  <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed">
                    When we succeed, <span className="text-red-600">you succeed</span>. Join us in creating the next chapter of Nashville's entertainment legacy.
                  </p>
                </motion.div>
              </div>
            </DynamicText>
          </motion.div>
        </div>
      </CinematicSlide>
    )
  },
  {
    id: 'ownership-value',
    title: 'Ownership Value',
    component: ({ skipAnimations }) => (
      <CinematicSlide className="bg-black">
        <div className="flex flex-col justify-center items-center h-full px-8">
          <motion.div
            initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto text-center space-y-16"
          >
            {/* Header */}
            <DynamicText skipAnimation={skipAnimations}>
              <h2 className="text-3xl md:text-4xl text-red-600 font-bold tracking-wide">
                2.5% OWNERSHIP VALUE GROWTH
              </h2>
            </DynamicText>

            {/* Value Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DynamicText delay={skipAnimations ? 0 : 400}>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/10">
                  <p className="text-xl text-white/80 mb-2">Value Today</p>
                  <p className="text-4xl md:text-5xl text-red-600 font-bold mb-2">
                    $500,000
                  </p>
                  <p className="text-sm text-white/60">
                    2.5% of $20M current valuation
                  </p>
                </div>
              </DynamicText>

              <DynamicText delay={skipAnimations ? 0 : 600}>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/10">
                  <p className="text-xl text-white/80 mb-2">Projected Value in 2029</p>
                  <p className="text-4xl md:text-5xl text-red-600 font-bold mb-2">
                    $23.5M+
                  </p>
                  <p className="text-sm text-white/60">
                    2.5% of $940M projected valuation
                  </p>
                </div>
              </DynamicText>
            </div>

            {/* Growth Visualization */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8">
              <RevenueProjections skipAnimations={skipAnimations} />
            </div>
          </motion.div>
        </div>
      </CinematicSlide>
    )
  },
  {
    id: 'partnership-opportunities',
    title: 'Partnership Opportunities',
    component: ({ skipAnimations }) => (
      <CinematicSlide className="bg-black">
        <div className="flex flex-col justify-center h-screen px-4 md:px-8 py-8">
          <motion.div
            initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-5xl mx-auto"
          >
            {/* Header */}
            <DynamicText skipAnimation={skipAnimations}>
              <h2 className="text-3xl md:text-4xl text-red-600 font-bold tracking-wide text-center mb-8">
                Help Us Make the Music City Rodeo a Nashville Staple
              </h2>
            </DynamicText>

            {/* Partnership Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Partnership content */}
            </div>
          </motion.div>
        </div>
      </CinematicSlide>
    )
  },
  {
    id: 'headliners',
    title: 'Headliners',
    component: ({ skipAnimations }) => (
      <CinematicSlide className="bg-black">
        <div className="flex flex-col justify-start h-full px-6 md:px-12 py-12 overflow-y-auto">
          <motion.div
            initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto w-full"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <motion.h2 
                initial={skipAnimations ? {} : { y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl md:text-4xl text-red-600 font-bold tracking-wide"
              >
                INAUGURAL LINEUP
              </motion.h2>
            </div>

            {/* Main Headliners Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                {
                  date: "MAY 29",
                  artist: "REBA McENTIRE",
                  subtitle: "Opening Night",
                  special: "/ Miranda Lambert?",
                  highlight: true
                },
                {
                  date: "MAY 30",
                  artist: "JELLY ROLL",
                  subtitle: "Night Two"
                },
                {
                  date: "MAY 31",
                  artist: "TIM McGRAW",
                  subtitle: "Final Night"
                }
              ].map((headliner, index) => (
                <motion.div
                  key={headliner.date}
                  initial={skipAnimations ? {} : { y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: skipAnimations ? 0 : 0.2 + (index * 0.1) }}
                  className={`${
                    headliner.highlight 
                      ? 'bg-red-600/10 border-red-600/20' 
                      : 'bg-zinc-900/40 border-zinc-800/50'
                  } backdrop-blur-sm rounded-xl border p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
                >
                  <div className="relative z-10">
                    <p className="text-white/80 text-base mb-2">{headliner.date}</p>
                    <h3 className="text-2xl md:text-3xl text-white font-bold mb-1">{headliner.artist}</h3>
                    <p className="text-white/60 text-sm">{headliner.subtitle}</p>
                    {headliner.special && (
                      <p className="text-red-500 mt-2 text-sm font-medium italic">{headliner.special}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Two Column Layout for Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Additional Partners Section */}
              <motion.div
                initial={skipAnimations ? {} : { y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: skipAnimations ? 0 : 0.5 }}
                className="bg-zinc-900/40 backdrop-blur-sm rounded-xl p-6 border border-zinc-800/50"
              >
                <h3 className="text-xl text-white font-bold mb-4">Additional Partner Asks</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {[
                    { name: "Miranda Lambert", status: "" },
                    { name: "Nate Bargatze", status: "" },
                    { name: "Cody Johnson", status: "Conversation still to be had" }
                  ].map((partner) => (
                    <div key={partner.name} className="text-center">
                      <p className="text-base text-white/90 font-medium">{partner.name}</p>
                      {partner.status && (
                        <p className="text-xs text-white/60 italic mt-1">{partner.status}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Special Event Section */}
              <motion.div
                initial={skipAnimations ? {} : { y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: skipAnimations ? 0 : 0.6 }}
                className="bg-red-600/10 backdrop-blur-sm rounded-xl p-6 border border-red-600/20"
              >
                <h3 className="text-xl text-red-600 font-bold mb-4">
                  Special Event: Tough Enough to Wear Pink
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-white/90 leading-relaxed">
                    For May 29th, we've floated the idea of incorporating the Tough Enough to Wear Pink night, 
                    a rodeo tradition that raises awareness and funds for breast cancer charities.
                  </p>
                  <p className="text-sm text-white/90 leading-relaxed">
                    If it aligns with your interest, we'd love to explore this further, potentially as a 
                    collaboration with Miranda Lambert where the two of you share the evening's performance.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </CinematicSlide>
    )
  },
  {
    id: 'personal-letter',
    title: 'Personal Letter',
    component: ({ skipAnimations }) => (
      <CinematicSlide className="bg-black">
        <div className="absolute inset-0">
          <motion.div
            initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="relative h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90" />
          </motion.div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-4 md:px-8 py-12">
          <motion.div
            initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl w-full mx-auto"
          >
            {/* Letter Container */}
            <div className="bg-zinc-900/40 backdrop-blur-sm rounded-2xl border border-zinc-800/50 overflow-hidden">
              {/* Letter Header */}
              <div className="bg-red-600/10 border-b border-red-600/20 px-8 py-6">
                <motion.div
                  initial={skipAnimations ? {} : { y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl md:text-3xl text-red-600 font-bold tracking-wide mb-2">
                    Dear Reba,
                  </h2>
                  <p className="text-zinc-400 text-sm md:text-base">
                    A Personal Invitation to Join Our Vision
                  </p>
                </motion.div>
              </div>

              {/* Letter Content */}
              <div className="p-8 space-y-8">
                {/* Main Message */}
                <motion.div
                  initial={skipAnimations ? {} : { y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-6"
                >
                  <p className="text-lg md:text-xl text-white/80 font-light leading-relaxed">
                    We're creating a one-of-a-kind event that celebrates Nashville's heritage and the 80-year bond between country music and rodeo. The Music City Rodeo will combine the thrill of the arena with the magic of music, and your voice would make it unforgettable.
                  </p>

                  <p className="text-lg md:text-xl text-white/80 font-light leading-relaxed">
                    As an icon of country music and rodeo, you embody the spirit of this event. Your involvement as a performer, ambassador, or honorary figurehead would make a powerful statement.
                  </p>
                </motion.div>

                {/* Call to Action */}
                <motion.div
                  initial={skipAnimations ? {} : { y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="bg-red-600/5 rounded-xl p-6 border border-red-600/10"
                >
                  <div className="space-y-4">
                    <p className="text-lg md:text-xl text-red-600 font-medium leading-relaxed">
                      We would be honored to discuss how we can collaborate with you to bring this vision to life.
                    </p>
                    <p className="text-lg md:text-xl text-red-600 font-bold leading-relaxed">
                      Together, we can make this an event for the ages.
                    </p>
                  </div>
                </motion.div>

                {/* Signature Section */}
                <motion.div
                  initial={skipAnimations ? {} : { y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="pt-4 text-right"
                >
                  <p className="text-lg text-white/70 font-medium italic">
                    With great anticipation,
                  </p>
                  <p className="text-xl text-red-600 font-bold mt-2">
                    The Music City Rodeo Team
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Decorative Elements */}
            <motion.div
              initial={skipAnimations ? {} : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute -top-4 -right-4 w-24 h-24 bg-red-600/10 rounded-full blur-2xl"
            />
            <motion.div
              initial={skipAnimations ? {} : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.7 }}
              className="absolute -bottom-4 -left-4 w-32 h-32 bg-red-600/5 rounded-full blur-3xl"
            />
          </motion.div>
        </div>
      </CinematicSlide>
    )
  },
  {
    id: 'team',
    title: 'Team',
    component: ({ skipAnimations }) => (
      <CinematicSlide className="bg-black">
        {/* Dark arena background with lighting effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black" />
        </div>

        <div className="relative z-10 flex flex-col justify-center min-h-screen px-4 md:px-8 py-12">
          {/* Main heading */}
          <motion.div
            initial={skipAnimations ? {} : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl text-white font-bold tracking-wide">
              WE'VE GOT THE <span className="text-red-600">TEAM</span> TO LEAD IT.
            </h2>
          </motion.div>

          {/* Team grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[
              {
                name: "TIM McGRAW",
                title: "COUNTRY MUSIC ICON, ACTOR, & CO-FOUNDER OF DOWN HOME",
                image: "/images/people/mcgraw.jpg"
              },
              {
                name: "PATRICK HUMES",
                title: "PRCA COWBOY TURNED REAL ESTATE DEVELOPER & ENTREPRENEUR",
                image: "/images/people/pat.jpg"
              },
              {
                name: "BILL STAPLETON",
                title: "CO-FOUNDER OF AUSTIN CITY LIMITS, LOLLAPALOOZA, & C3 PRESENTS",
                image: "/images/people/bill.jpg"
              },
              {
                name: "BRIAN KAPLAN",
                title: "CO-FOUNDER OF DOWN HOME, MUSIC MARKETING VETERAN",
                image: "/images/people/brian.jpg"
              }
            ].map((member, index) => (
              <motion.div
                key={member.name}
                initial={skipAnimations ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: skipAnimations ? 0 : 0.2 + (index * 0.1) }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative w-full aspect-[3/4] mb-4 overflow-hidden rounded-lg">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                <h3 className="text-xl text-white font-bold tracking-wide mb-2">
                  {member.name}
                </h3>
                <p className="text-sm text-white/80 tracking-wide leading-snug">
                  {member.title}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </CinematicSlide>
    )
  },
  {
    id: 'hype',
    title: 'Hype',
    component: ({ skipAnimations }) => (
      <CinematicSlide className="bg-black">
        {/* Background Image */}
        <div className="absolute inset-0">
          <motion.div
            initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="relative h-full"
          >
            <img 
              src="/images/people/ragdoll.jpg"
              alt="Ragdoll Netflix"
              className="w-full h-full object-cover"
              style={{ objectPosition: '50% 40%' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
          </motion.div>
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full py-16 px-4 md:px-8">
          {/* Top Title */}
          <motion.div
            initial={skipAnimations ? {} : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-center"
          >
            <h2 className="text-5xl md:text-7xl text-white font-bold tracking-wider">
              THE <span className="text-red-600">HYPE</span> TO DRIVE IT
            </h2>
          </motion.div>

          {/* Bottom Content - Netflix Announcement */}
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              initial={skipAnimations ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
              className="flex items-center gap-4"
            >
              <span className="text-4xl md:text-6xl font-bold text-red-600 tracking-wider font-avenir">
                RAGDOLL
              </span>
              <span className="text-2xl md:text-3xl font-bold text-white tracking-wide font-avenir">
                COMING SOON TO
              </span>
              <img 
                src="/images/logo/netflix.png"
                alt="Netflix"
                className="h-16 md:h-20 lg:h-24 object-contain"
              />
            </motion.div>
          </div>
        </div>
      </CinematicSlide>
    )
  },
  {
    id: 'down-home',
    title: 'Down Home',
    component: ({ skipAnimations }) => (
      <CinematicSlide className="bg-black">
        {/* Background Image */}
        <div className="absolute inset-0">
          <motion.div
            initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="relative h-full"
          >
            <img 
              src="/images/Family/photo-1476067897447-d0c5df27b5df-scaled.webp"
              alt="Mountain Road Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />
          </motion.div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center h-full">
          {/* Logo Container */}
          <motion.div
            initial={skipAnimations ? {} : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="w-full max-w-3xl px-8"
          >
            <img 
              src="/images/Family/middh.webp"
              alt="Down Home Logo"
              className="w-full h-auto"
            />
          </motion.div>
        </div>
      </CinematicSlide>
    )
  },
  {
    id: 'down-home-intro-2',
    title: 'Down Home Introduction 2',
    component: ({ skipAnimations }) => (
      <CinematicSlide className="bg-black">
        <div className="relative h-full flex font-avenir">
          {/* Left Section - Dark with Logo and Text */}
          <div className="w-[45%] bg-zinc-900 flex items-center justify-center p-8">
            <motion.div
              initial={skipAnimations ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="w-full space-y-12"
            >
              {/* Logo */}
              <div className="w-full max-w-[400px] mx-auto">
                <img 
                  src="/images/Family/middh.webp"
                  alt="Down Home Logo"
                  className="w-full h-auto"
                />
              </div>

              {/* Text */}
              <div className="space-y-4">
                <p className="text-2xl text-white/90 tracking-wide leading-relaxed font-avenir">
                  DOWN HOME IS AN ENTERTAINMENT COMPANY BASED IN NASHVILLE
                </p>
                <p className="text-2xl text-white/90 tracking-wide leading-relaxed font-avenir">
                  CO-FOUNDED BY TIM McGRAW
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Section - Image */}
          <div className="flex-1 relative">
            <motion.div
              initial={skipAnimations ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              <img 
                src="/images/people/tm.jpg"
                alt="Tim McGraw Portrait"
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-transparent to-transparent" />
            </motion.div>
          </div>

          {/* Page Number */}
          <div className="absolute bottom-4 right-4 text-white/60 text-sm font-avenir">
            2
          </div>

          {/* Down Home Small Logo */}
          <div className="absolute bottom-4 left-4">
            <img 
              src="/images/Family/middh.webp"
              alt="Down Home Logo Small"
              className="h-6 opacity-60"
            />
          </div>
        </div>
      </CinematicSlide>
    )
  },
  {
    id: 'skydance',
    title: 'Skydance Media',
    component: ({ skipAnimations }) => (
      <SkydanceSlide skipAnimations={skipAnimations} />
    )
  },
  {
    id: 'financial-model',
    title: 'Financial Model',
    component: ({ skipAnimations }) => (
      <FinancialModelSlide skipAnimations={skipAnimations} />
    )
  }
];

export default slides;
