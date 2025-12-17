"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiService } from "@/services/ApiService"
import type { Graph } from "@/types/graph"
import { motion } from "framer-motion"
import QuestionnaireFlow from "@/components/questionnaire-flow"

export default function QuestionnairePage() {
  const params = useParams()
  const router = useRouter()
  const operatorId = params.operatorId as string
  const graphId = params.graphId as string

  const [graph, setGraph] = useState<Graph | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadGraph = async () => {
      try {
        const response = await apiService.loadGraph(operatorId, graphId)
        if (response.error) throw new Error(response.error.message)
        setGraph(response.data)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load questionnaire"
        setError(message)
        console.error("Failed to load graph:", err)
      } finally {
        setLoading(false)
      }
    }

    if (operatorId && graphId) {
      loadGraph()
    }
  }, [operatorId, graphId])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-black dark:via-slate-900 dark:to-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="text-center"
        >
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-blue-900 dark:border-t-blue-400 animate-spin" />
        </motion.div>
      </div>
    )
  }

  if (error || !graph) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-black dark:via-slate-900 dark:to-black">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">
            {error || "Failed to load questionnaire"}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-black dark:via-slate-900 dark:to-black">
      <QuestionnaireFlow graph={graph} />
    </div>
  )
}
