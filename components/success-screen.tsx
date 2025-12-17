"use client"

import { useEffect, useRef } from "react"
import type { Node } from "@/types/graph"
import { motion } from "framer-motion"
import { CheckCircle, Sparkles } from "lucide-react"
import Link from "next/link"

interface SuccessScreenProps {
  graphName: string
  goalNode?: Node
}

export default function SuccessScreen({ graphName, goalNode }: SuccessScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Confetti animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const confetti: Array<{
      x: number
      y: number
      vx: number
      vy: number
      life: number
      color: string
      size: number
    }> = []

    // Create confetti pieces
    for (let i = 0; i < 100; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 4 + 4,
        life: 1,
        color: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"][Math.floor(Math.random() * 4)],
        size: Math.random() * 3 + 2,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      confetti.forEach((c, index) => {
        c.x += c.vx
        c.y += c.vy
        c.vy += 0.2 // gravity
        c.life -= 0.01

        if (c.life > 0) {
          ctx.fillStyle = c.color
          ctx.globalAlpha = c.life
          ctx.fillRect(c.x, c.y, c.size, c.size)
        } else {
          confetti.splice(index, 1)
        }
      })

      ctx.globalAlpha = 1

      if (confetti.length > 0) {
        requestAnimationFrame(animate)
      }
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const successMessage = goalNode?.data?.label || "You did it!"
  const successDescription = goalNode?.data?.subtitle || "Thank you for completing the questionnaire."

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Confetti Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center px-4 max-w-2xl"
      >
        {/* Icon */}
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2 }} className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-75 animate-pulse" />
            <CheckCircle className="w-24 h-24 text-blue-600 dark:text-blue-400 relative" />
          </div>
        </motion.div>

        {/* Main Message */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-4 text-balance"
        >
          {successMessage}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-xl text-gray-600 dark:text-gray-400 mb-12"
        >
          {successDescription}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/run">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              Take Another
            </motion.button>
          </Link>

          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-slate-700"
            >
              Back to Dashboard
            </motion.button>
          </Link>
        </motion.div>

        {/* Decoration */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          className="mt-16 flex justify-center"
        >
          <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </motion.div>
      </motion.div>
    </div>
  )
}
