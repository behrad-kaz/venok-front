// app/loading.tsx
"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a3833] to-[#020807] flex items-center justify-center px-4 relative overflow-hidden">
      {/* دایره‌های محو در پس‌زمینه */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full opacity-10 bg-[#59D8C3] blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full opacity-8 bg-[#5BE0A8] blur-3xl" />

      <div className="relative z-10 text-center">
        {/* لوگو با انیمیشن */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-[#59D8C3]/20 to-[#5BE0A8]/20 rounded-2xl flex items-center justify-center border border-[#59D8C3]/30">
            <Sparkles className="w-12 h-12 text-[#59D8C3] animate-pulse" />
          </div>
        </motion.div>

        {/* عنوان */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold text-white mb-3"
        >
          پشتیبان‌یار
        </motion.h1>

        {/* زیرنویس */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-gray-400 text-sm mb-8"
        >
          در حال بارگذاری...
        </motion.p>

        {/* اسپینر */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex justify-center"
        >
          <div className="relative w-16 h-16">
            {/* دایره بیرونی */}
            <div className="absolute inset-0 rounded-full border-4 border-[#59D8C3]/20" />
            
            {/* دایره در حال چرخش */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-t-[#59D8C3] border-r-[#5BE0A8] border-b-[#59D8C3]/40 border-l-[#5BE0A8]/40"
            />
            
            {/* نقطه مرکزی */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-[#59D8C3] rounded-full animate-pulse" />
            </div>
          </div>
        </motion.div>

        {/* نقطه‌های متحرک */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.3, scale: 0.8 }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
              className="w-2 h-2 bg-[#59D8C3] rounded-full"
            />
          ))}
        </div>

        {/* متن پایانی */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-[10px] text-gray-600 mt-8"
        >
          لطفاً چند لحظه صبر کنید...
        </motion.p>
      </div>
    </div>
  );
}