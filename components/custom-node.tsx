// components/custom-node.tsx
"use client"

import { memo, useState } from "react"
import { Handle, Position } from "reactflow"
import type { NodeProps } from "reactflow"

interface CustomNodeData {
  label: string
  type: "questionnaire" | "goal"
  QUESTIONNAIRE?: {
    category?: string
    createdTimeStamp?: string
  }
  GOAL?: {
    goalName?: string
  }
}

function CustomNode({ data, isConnecting, selected }: NodeProps<CustomNodeData>) {
  const [isHovered, setIsHovered] = useState(false)
  const { type, QUESTIONNAIRE, GOAL } = data
  const isGoal = type === "goal"

  // Display the actual category/goalName from nested data structure
  const displayText = isGoal 
    ? (GOAL?.goalName?.trim() || "Untitled Goal")
    : (QUESTIONNAIRE?.category?.trim() || "Untitled Category")

  return (
    <div
      className={`
        flex items-center justify-center text-white font-bold cursor-pointer
        transition-all duration-200 select-none
        ${isGoal
          ? "w-24 h-24 rounded-full bg-red-600 border-4 border-red-800"
          : "w-36 h-20 rounded-xl bg-blue-600 border-4 border-blue-800"}
        ${selected ? "ring-4 ring-yellow-400 scale-110" : "hover:scale-105"}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: selected
          ? "0 0 16px rgba(250, 204, 21, 0.5), 0 8px 24px rgba(0, 0, 0, 0.3)"
          : isHovered
            ? "0 4px 16px rgba(0, 0, 0, 0.25)"
            : "0 4px 12px rgba(0, 0, 0, 0.2)",
      }}
      title={displayText}
    >
      {/* Input handle - only for Questionnaire */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-7 !h-7 !bg-green-400 !border-4 !border-green-800 transition-all duration-150"
        style={{
          cursor: "crosshair",
          boxShadow:
            "0 0 14px rgba(52, 211, 153, 0.8), inset 0 0 8px rgba(255, 255, 255, 0.5), 0 0 2px rgba(0, 0, 0, 0.3)",
        }}
      />

      {/* Output handle - hidden for Goal */}
      {!isGoal && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-7 !h-7 !bg-yellow-400 !border-4 !border-yellow-800 transition-all duration-150"
          style={{
            cursor: "crosshair",
            boxShadow:
              "0 0 14px rgba(251, 191, 36, 0.8), inset 0 0 8px rgba(255, 255, 255, 0.5), 0 0 2px rgba(0, 0, 0, 0.3)",
          }}
        />
      )}

      <div className="text-center px-2">
        {isGoal && <span className="text-4xl mb-1 block">🎯</span>}
        <div className={`font-bold ${isGoal ? "text-xs leading-tight" : "text-sm"}`}>
          {displayText}
        </div>
      </div>
    </div>
  )
}

export default memo(CustomNode)
