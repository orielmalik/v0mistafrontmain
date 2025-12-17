"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { Canvas } from "@butterfly/butterfly"
import type { INode, IEdge } from "@butterfly/butterfly"

interface GraphEditorProps {
  graphId: string
  initialNodes?: INode[]
  initialEdges?: IEdge[]
  onGraphChange?: (nodes: INode[], edges: IEdge[]) => void
}

const GraphEditor: React.FC<GraphEditorProps> = ({ graphId, initialNodes = [], initialEdges = [], onGraphChange }) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const canvasInstance = useRef<Canvas | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    canvasInstance.current = new Canvas({
      container: canvasRef.current,
      width: canvasRef.current.clientWidth,
      height: canvasRef.current.clientHeight,
      disLinkable: false, // Allow all edges
      linkable: true,
      draggable: true,
      zoomable: true,
      moveable: true,
      keyboard: true,
      autoLayout: false,
      scope: "canvas",
      edgeConnectionFrom: "all", // Allow connections from any point
    })

    initialNodes.forEach((node) => {
      canvasInstance.current?.addNode(node)
    })

    initialEdges.forEach((edge) => {
      canvasInstance.current?.addEdge(edge)
    })

    canvasInstance.current?.on("events:change", () => {
      if (onGraphChange) {
        const nodes = canvasInstance.current?.getNodes() || []
        const edges = canvasInstance.current?.getEdges() || []
        onGraphChange(nodes, edges)
      }
    })

    canvasInstance.current?.on("edge:add", (data: any) => {
      // Butterfly automatically animates the growing chain
      console.log("[v0] Edge added with animation:", data)
    })

    setIsReady(true)

    // Cleanup
    return () => {
      canvasInstance.current?.destroy()
    }
  }, [graphId, initialNodes, initialEdges, onGraphChange])

  useEffect(() => {
    if (!canvasRef.current || !canvasInstance.current) return

    const handleResize = () => {
      if (canvasRef.current) {
        canvasInstance.current?.resize(canvasRef.current.clientWidth, canvasRef.current.clientHeight)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      ref={canvasRef}
      className="w-full h-full bg-background border border-border rounded-lg"
      style={{ minHeight: "600px" }}
    />
  )
}

export default GraphEditor
