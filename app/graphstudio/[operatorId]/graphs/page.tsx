// components/custom-node.tsx
import React, { memo, useState } from "react"
import { Handle, Position, NodeProps } from "reactflow"

export default memo(function CustomNode({ data, selected }: NodeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data.label || "")

  const isGoal = data.type === "goal"

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    const trimmed = label.trim()
    if (trimmed && trimmed !== data.label) {
      data.onUpdateLabel?.(trimmed)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      e.currentTarget.blur()
    }
    if (e.key === "Escape") {
      setLabel(data.label || "")
      setIsEditing(false)
    }
  }

  return (
    <>
      {/* Input handle – only for Questionnaire nodes */}
      {!isGoal && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-4 h-4 bg-green-500 border-4 border-white shadow-lg"
        />
      )}

      <div
        onDoubleClick={handleDoubleClick}
        className={`
          relative px-6 py-4 rounded-2xl shadow-xl transition-all duration-200
          ${isGoal ? "bg-red-500" : "bg-blue-500"}
          ${selected ? "ring-4 ring-orange-400 scale-105" : "ring-2 ring-white"}
          hover:scale-105 cursor-pointer min-w-48
        `}
      >
        {isEditing ? (
          <input
            type="text"
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white/90 text-black font-bold text-lg text-center rounded-lg px-3 py-1 outline-none ring-2 ring-orange-500"
          />
        ) : (
          <div className="text-white font-bold text-xl text-center">
            {label || (isGoal ? "Goal Node" : "Questionnaire Node")}
          </div>
        )}

        <div className="text-white/80 text-sm text-center mt-1">
          {isGoal ? "Goal" : "Questionnaire"}
        </div>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className={`w-4 h-4 ${isGoal ? "bg-gray-400" : "bg-yellow-400"} border-4 border-white shadow-lg`}
      />
    </>
  )
})
