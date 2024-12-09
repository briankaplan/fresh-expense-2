import React from 'react';
import { motion } from 'framer-motion';

const SkydanceSlide = ({ skipAnimations }) => {
  const posters = [
    { num: '01', height: 'tall', ext: 'jpg' },
    { num: '02', height: 'tall', ext: 'png' },
    { num: '03', height: 'tall', ext: 'jpg' },
    { num: '04', height: 'tall', ext: 'png' },
    { num: '05', height: 'short', ext: 'png' },
    { num: '06', height: 'short', ext: 'jpg' },
    { num: '07', height: 'short', ext: 'jpg' },
    { num: '08', height: 'short', ext: 'jpg' }
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Space Background */}
      <div className="absolute inset-0">
        <motion.div
          initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="relative h-full"
        >
          <img 
            src="/images/landscapes/DH0505-2048x1143.jpeg"
            alt="Space Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
        </motion.div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col justify-between h-full py-16">
        {/* Top Text */}
        <motion.div
          initial={skipAnimations ? { opacity: 1 } : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center px-8 mb-12"
        >
          <h1 className="text-5xl md:text-7xl text-white font-serif mb-4">
            Backed by
          </h1>
          <h2 className="text-5xl md:text-7xl text-white font-serif">
            Skydance Media.
          </h2>
          <motion.p
            initial={skipAnimations ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-6 text-white/80 max-w-3xl mx-auto text-sm md:text-base"
          >
            Skydance's films include the box office record-breaking and Academy Award winning film Top Gun: Maverick;
            Mission: Impossible – Dead Reckoning Part One, Transformers: Rise of the Beasts; The Family Plan, Ghosted, The
            Greatest Beer Run Ever; Heart of Stone, Spy Kids: Armageddon, The Adam Project, The Old Guard,The Tomorrow War.
          </motion.p>
        </motion.div>

        {/* Movie Posters Grid */}
        <div className="w-full px-4 mt-auto">
          <motion.div
            initial={skipAnimations ? {} : { y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="grid grid-cols-4 gap-2 md:gap-4"
          >
            {posters.map((poster) => (
              <div 
                key={poster.num}
                className={`relative overflow-hidden ${
                  poster.height === 'short' ? 'h-32 md:h-48' : 'h-40 md:h-64'
                }`}
              >
                <img
                  src={`/images/slide_sd/skydance__${poster.num}.${poster.ext}`}
                  alt={`Movie Poster ${poster.num}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Fire Effect */}
        <motion.div
          initial={skipAnimations ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 2 }}
          className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-orange-500/20 via-orange-600/10 to-transparent"
        />
      </div>
    </div>
  );
};

export default SkydanceSlide; 