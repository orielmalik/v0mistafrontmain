"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { apiService } from "@/services/ApiService"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"

interface GraphCard {
  id: string
  operatorId: string
}

export default function RunPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [graphs, setGraphs] = useState<GraphCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadGraphs = async () => {
      if (!user?.email) {
        router.replace("/auth")
        return
      }

      try {
        const response = await apiService.listGraphIds(user.email)
        const graphIds = response.data ?? []
        setGraphs(
          graphIds.map((id) => ({
            id,
            operatorId: user.email,
          })),
        )
      } catch (error) {
        console.error("Failed to load graphs:", error)
        setGraphs([])
      } finally {
        setLoading(false)
      }
    }

    loadGraphs()
  }, [user, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-black dark:via-slate-900 dark:to-black">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="mb-6 flex justify-center"
          >
            <Sparkles className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </motion.div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading your questionnaires...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-black dark:via-slate-900 dark:to-black">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-16">
          <Link href="/dashboard">
            <motion.button
              whileHover={{ x: -6 }}
              className="mb-8 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </motion.button>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-4 text-balance">
              Choose a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Questionnaire
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
              Select a questionnaire below to get started. Complete all questions to see your results.
            </p>
          </motion.div>
        </div>

        {/* Graph Cards Grid */}
        {graphs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-6" />
            <p className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No questionnaires available</p>
            <p className="text-gray-500 dark:text-gray-500">Ask your operator to create a questionnaire for you.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {graphs.map((graph, index) => (
              <motion.div
                key={graph.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => router.push(`/run/${graph.operatorId}/${graph.id}/questionnaire`)}
                className="group cursor-pointer"
              >
                <div className="relative h-full bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 overflow-hidden">
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-blue-600 to-purple-600 transition-opacity duration-300" />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="mb-6 w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {graph.id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </h3>

                    {/* Operator Email */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      By <span className="font-semibold text-gray-700 dark:text-gray-300">{graph.operatorId}</span>
                    </p>

                    {/* CTA */}
                    <motion.div
                      whileHover={{ x: 6 }}
                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold"
                    >
                      <span>Start Now</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
