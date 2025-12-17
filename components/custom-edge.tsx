"use client"

import { useCallback, useMemo } from "react"
import { type EdgeProps, getSmoothStepPath, EdgeLabelRenderer } from "reactflow"

interface EdgeData {
  weight: number
  onDeleteEdge?: (id: string) => void
  onUpdateEdgeWeight?: (id: string, weight: number) => void
}

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected,
  source,
  target,
}: EdgeProps<EdgeData>) {
  const weight = useMemo(() => Number(data?.weight || 1), [data?.weight])

  const [edgePath, labelX, labelY] = useMemo(() => {
    return getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      borderRadius: 50, // Large borderRadius creates smooth circular arcs
    })
  }, [sourceX, sourceY, targetX, targetY])

  const handleWeightClick = useCallback(() => {
    const input = prompt(`Edit edge weight (0 to delete):\n\nCurrent: ${weight}`, String(weight))
    if (input === null) return

    const newWeight = Number.parseInt(input.trim(), 10)
    if (Number.isNaN(newWeight) || newWeight < 0) {
      alert("Please enter a non-negative integer")
      return
    }

    if (newWeight === 0) {
      console.log(`[v0] Deleting edge ${id}`)
      data?.onDeleteEdge?.(id)
    } else {
      console.log(`[v0] Updating edge ${id} weight: ${weight} → ${newWeight}`)
      data?.onUpdateEdgeWeight?.(id, newWeight)
    }
  }, [id, weight, data])

  // Hide edges with weight <= 0
  if (weight <= 0) return null

  return (
    <>
      <path
        id={id}
        d={edgePath}
        stroke="#f59e0b"
        strokeWidth={selected ? 6 : 5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-200"
        style={{
          filter: selected
            ? "drop-shadow(0 0 10px rgba(245, 158, 11, 0.8)) drop-shadow(0 0 4px rgba(245, 158, 11, 0.4))"
            : "drop-shadow(0 0 4px rgba(245, 158, 11, 0.3))",
          pointerEvents: "stroke",
          cursor: "pointer",
        }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
        >
          <button
            onClick={handleWeightClick}
            type="button"
            className="flex items-center justify-center w-12 h-12 rounded-full bg-white text-black font-bold text-lg transition-all duration-200 cursor-pointer"
            style={{
              width: "50px",
              height: "50px",
              border: "3px solid #f59e0b",
              boxShadow: selected
                ? "0 0 12px rgba(245, 158, 11, 0.6), 0 4px 16px rgba(0, 0, 0, 0.2)"
                : "0 4px 12px rgba(245, 158, 11, 0.3), 0 2px 6px rgba(0, 0, 0, 0.15)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)"
              e.currentTarget.style.borderColor = "#fbbf24"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)"
              e.currentTarget.style.borderColor = "#f59e0b"
            }}
            aria-label={`Edge ${source} to ${target}, weight ${weight}`}
            title={`Weight: ${weight}\nClick to edit`}
          >
            {weight}
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

CustomEdge.displayName = "CustomEdge"
