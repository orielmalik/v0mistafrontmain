"use client"

import { useEffect, useRef } from "react"

interface EdgeLayerProps {
  isConnecting: boolean
  startPos: { x: number; y: number } | null
  endPos: { x: number; y: number } | null
  isValidTarget: boolean
}

/**
 * Temporary edge layer shown during drag operations.
 * Renders a smooth SVG line that follows the mouse in real-time.
 */
export function EdgeLayer({ isConnecting, startPos, endPos, isValidTarget }: EdgeLayerProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !isConnecting || !startPos || !endPos) return

    // Ensure SVG fills its container
    svgRef.current.setAttribute("viewBox", `0 0 2000 2000`)
  }, [isConnecting, startPos, endPos])

  if (!isConnecting || !startPos || !endPos) {
    return null
  }

  // Calculate bezier curve control points for smooth arcs
  const dx = endPos.x - startPos.x
  const dy = endPos.y - startPos.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Control point offset (creates nice curve)
  const cpOffset = Math.min(distance * 0.3, 100)
  const cp1x = startPos.x + cpOffset
  const cp1y = startPos.y
  const cp2x = endPos.x - cpOffset
  const cp2y = endPos.y

  const pathData = `M ${startPos.x} ${startPos.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endPos.x} ${endPos.y}`

  return (
    <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
      {/* Glow effect for invalid target */}
      {!isValidTarget && (
        <defs>
          <filter id="invalid-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}

      {/* Temporary bezier line */}
      <path
        d={pathData}
        fill="none"
        stroke={isValidTarget ? "#10b981" : "#ef4444"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
        style={{
          filter: !isValidTarget ? "url(#invalid-glow)" : "none",
          transition: "stroke 0.2s ease",
        }}
      />

      {/* Arrowhead indicator */}
      <defs>
        <marker id="temp-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto-start-reverse">
          <path d="M0,0 L0,6 L9,3 Z" fill={isValidTarget ? "#10b981" : "#ef4444"} />
        </marker>
      </defs>

      <path d={pathData} fill="none" stroke="transparent" strokeWidth="3" markerEnd="url(#temp-arrow)" />
    </svg>
  )
}
