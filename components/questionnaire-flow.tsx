"use client"

import { useState, useCallback, useMemo } from "react"
import type { Graph } from "@/types/graph"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import SuccessScreen from "./success-screen"

interface QuestionnaireFlowProps {
  graph: Graph
}

export default function QuestionnaireFlow({ graph }: QuestionnaireFlowProps) {
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [isCompleted, setIsCompleted] = useState(false)

  // Get questionnaire nodes and goal node
  const questionnaireNodes = useMemo(() => graph.nodes.filter((node) => node.type === "questionnaire"), [graph.nodes])

  const goalNode = useMemo(() => graph.nodes.find((node) => node.type === "goal"), [graph.nodes])

  const currentNode = questionnaireNodes[currentNodeIndex]
  const totalQuestions = questionnaireNodes.length
  const progress = ((currentNodeIndex + 1) / totalQuestions) * 100

  const handleAnswerSelect = useCallback(
    (answerIndex: number) => {
      if (!currentNode) return
      setAnswers((prev) => ({
        ...prev,
        [currentNode.id]: answerIndex,
      }))

      // Auto-advance to next question
      setTimeout(() => {
        if (currentNodeIndex < totalQuestions - 1) {
          setCurrentNodeIndex((prev) => prev + 1)
        } else {
          // Reached end of questionnaire
          setIsCompleted(true)
        }
      }, 300)
    },
    [currentNode, currentNodeIndex, totalQuestions],
  )

  const handlePrevious = useCallback(() => {
    if (currentNodeIndex > 0) {
      setCurrentNodeIndex((prev) => prev - 1)
    }
  }, [currentNodeIndex])

  const handleSkip = useCallback(() => {
    if (currentNodeIndex < totalQuestions - 1) {
      setCurrentNodeIndex((prev) => prev + 1)
    } else {
      setIsCompleted(true)
    }
  }, [currentNodeIndex, totalQuestions])

  if (isCompleted) {
    return <SuccessScreen graphName={graph.name} goalNode={goalNode} />
  }

  if (!currentNode) {
    return null
  }

  const questionText = currentNode.data?.label || "Question"
  const answers_options = currentNode.data?.answers?.[0] || []

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 origin-left z-50"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: progress / 100 }}
        transition={{ duration: 0.3 }}
      />

      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 max-w-4xl flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Question {currentNodeIndex + 1} of {totalQuestions}
          </div>
          <div className="w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentNode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Question Text */}
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white text-balance">
                  {questionText}
                </h2>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {answers_options.map((answer: string, index: number) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    whileHover={{ x: 8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-4 text-left group"
                  >
                    <div className="flex items-center gap-4 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-blue-600 dark:hover:border-blue-400 transition-all duration-300 group-hover:shadow-lg">
                      {/* Radio Button */}
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-blue-600 dark:group-hover:border-blue-400 flex-shrink-0 flex items-center justify-center">
                        <motion.div
                          className="w-3 h-3 rounded-full bg-blue-600"
                          initial={{ scale: 0 }}
                          whileHover={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>

                      {/* Answer Text */}
                      <span className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {answer}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-8">
                <motion.button
                  onClick={handlePrevious}
                  disabled={currentNodeIndex === 0}
                  whileHover={{ x: -4 }}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </motion.button>

                <motion.button
                  onClick={handleSkip}
                  whileHover={{ x: 4 }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold"
                >
                  Skip
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
