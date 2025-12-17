"use client"

import { useRef, useEffect, useState, forwardRef } from "react"
import type { Node as GraphNode, Edge as GraphEdge } from "@/types/graph"

interface ButterflyCanvasProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  selectedNodeId: string | null
  connectingFromId: string | null
  onSelectNode: (id: string | null) => void
  onUpdateNodePosition: (id: string, position: { x: number; y: number }) => void
  onUpdateNodeData?: (id: string, data: any) => void
  onStartConnection: (id: string) => void
  onCompleteConnection: (toId: string) => void
  onDeleteNode: (id: string) => void
  onDeleteEdge: (id: string) => void
  onUpdateEdgeWeight?: (edgeId: string, weight: number) => void
  isDark: boolean
}

const ButterflyCanvas = forwardRef<HTMLDivElement, ButterflyCanvasProps>(
  (
    {
      nodes,
      edges,
      selectedNodeId,
      connectingFromId,
      onSelectNode,
      onUpdateNodePosition,
      onUpdateNodeData,
      onStartConnection,
      onCompleteConnection,
      onDeleteNode,
      isDark,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const contextRef = useRef<CanvasRenderingContext2D | null>(null)
    const draggedNodeRef = useRef<string | null>(null)
    const dragOffsetRef = useRef({ x: 0, y: 0 })
    const connectingLineRef = useRef<{ startX: number; startY: number; endX: number; endY: number } | null>(null)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

    useEffect(() => {
      if (!containerRef.current) return

      const canvas = canvasRef.current
      if (!canvas) return

      const dpr = window.devicePixelRatio || 1
      const rect = containerRef.current.getBoundingClientRect()

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.scale(dpr, dpr)
      contextRef.current = ctx

      const getNodeAtPosition = (x: number, y: number) => {
        for (let i = nodes.length - 1; i >= 0; i--) {
          const node = nodes[i]
          const nodeX = node.position.x
          const nodeY = node.position.y
          const nodeWidth = 140
          const nodeHeight = 80

          if (x >= nodeX && x <= nodeX + nodeWidth && y >= nodeY && y <= nodeY + nodeHeight) {
            return node.id
          }
        }
        return null
      }

      const getPortPosition = (nodeId: string, side: "top" | "right" | "bottom" | "left") => {
        const node = nodes.find((n) => n.id === nodeId)
        if (!node) return null

        const x = node.position.x
        const y = node.position.y
        const w = 140
        const h = 80

        const portMap = {
          top: { x: x + w / 2, y },
          right: { x: x + w, y: y + h / 2 },
          bottom: { x: x + w / 2, y: y + h },
          left: { x, y: y + h / 2 },
        }

        return portMap[side]
      }

      const draw = () => {
        const ctx = contextRef.current
        if (!ctx) return

        const width = rect.width
        const height = rect.height

        // Clear canvas
        ctx.fillStyle = isDark ? "#1a1a1a" : "#ffffff"
        ctx.fillRect(0, 0, width, height)

        // Draw grid background
        ctx.strokeStyle = isDark ? "#333333" : "#f0f0f0"
        ctx.lineWidth = 1
        const gridSize = 20
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
          ctx.stroke()
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }

        // Draw edges
        edges.forEach((edge) => {
          const fromNode = nodes.find((n) => n.id === edge.from)
          const toNode = nodes.find((n) => n.id === edge.to)

          if (fromNode && toNode) {
            const fromPort = getPortPosition(edge.from, "right")
            const toPort = getPortPosition(edge.to, "left")

            if (fromPort && toPort) {
              ctx.strokeStyle = "#1890ff"
              ctx.lineWidth = 2
              ctx.beginPath()
              ctx.moveTo(fromPort.x, fromPort.y)

              // Bezier control points
              const cpX = (fromPort.x + toPort.x) / 2
              ctx.bezierCurveTo(cpX, fromPort.y, cpX, toPort.y, toPort.x, toPort.y)
              ctx.stroke()

              // Draw arrow head
              const angle = Math.atan2(toPort.y - fromPort.y, toPort.x - fromPort.x)
              const arrowSize = 10
              ctx.fillStyle = "#1890ff"
              ctx.beginPath()
              ctx.moveTo(toPort.x, toPort.y)
              ctx.lineTo(
                toPort.x - arrowSize * Math.cos(angle - Math.PI / 6),
                toPort.y - arrowSize * Math.sin(angle - Math.PI / 6),
              )
              ctx.lineTo(
                toPort.x - arrowSize * Math.cos(angle + Math.PI / 6),
                toPort.y - arrowSize * Math.sin(angle + Math.PI / 6),
              )
              ctx.fill()
            }
          }
        })

        if (connectingFromId && connectingLineRef.current) {
          const { startX, startY, endX, endY } = connectingLineRef.current

          // Draw animated growing chain segments
          ctx.strokeStyle = "#52c41a"
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(startX, startY)

          // Bezier curve for smooth connection line
          const cpX = (startX + endX) / 2
          ctx.bezierCurveTo(cpX, startY, cpX, endY, endX, endY)
          ctx.stroke()

          // Draw glow effect
          ctx.strokeStyle = "rgba(82, 196, 26, 0.2)"
          ctx.lineWidth = 8
          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.bezierCurveTo(cpX, startY, cpX, endY, endX, endY)
          ctx.stroke()

          // Draw target indicator
          ctx.fillStyle = "#52c41a"
          ctx.beginPath()
          ctx.arc(endX, endY, 6, 0, Math.PI * 2)
          ctx.fill()
        }

        // Draw nodes
        nodes.forEach((node) => {
          const x = node.position.x
          const y = node.position.y
          const width = 140
          const height = 80
          const isSelected = node.id === selectedNodeId

          const colorMap: Record<GraphNode["type"], string> = {
            questionnaire: "#1890ff",
            personality: "#722ed1",
            dataEntry: "#52c41a",
            chat: "#fa8c16",
            goal: "#ff4d4f",
            scoring: "#13c2c2",
            fileUpload: "#eb2f96",
          }

          const nodeColor = colorMap[node.type] || "#1890ff"
          ctx.fillStyle = isSelected ? nodeColor : nodeColor + "cc"
          ctx.shadowColor = isSelected ? nodeColor + "80" : "transparent"
          ctx.shadowBlur = isSelected ? 20 : 0
          ctx.roundRect(x, y, width, height, 8)
          ctx.fill()

          // Draw border for selected
          if (isSelected) {
            ctx.strokeStyle = "#ffffff"
            ctx.lineWidth = 3
            ctx.roundRect(x, y, width, height, 8)
            ctx.stroke()
          }

          // Draw label
          ctx.fillStyle = "#ffffff"
          ctx.font = "bold 13px system-ui"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(node.data.label || node.type, x + width / 2, y + height / 2)

          const ports = ["top", "right", "bottom", "left"] as const
          ports.forEach((port) => {
            const portPos = getPortPosition(node.id, port)
            if (portPos) {
              ctx.fillStyle = node.type === "goal" ? "#ff4d4f" : "#1890ff"
              ctx.beginPath()
              ctx.arc(portPos.x, portPos.y, 5, 0, Math.PI * 2)
              ctx.fill()

              ctx.strokeStyle = "#ffffff"
              ctx.lineWidth = 2
              ctx.beginPath()
              ctx.arc(portPos.x, portPos.y, 5, 0, Math.PI * 2)
              ctx.stroke()
            }
          })
        })
      }

      // Draw initial frame
      draw()
      const animationId = requestAnimationFrame(draw)

      // Mouse handlers
      const handleMouseDown = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const nodeId = getNodeAtPosition(x, y)
        if (nodeId) {
          onSelectNode(nodeId)
          draggedNodeRef.current = nodeId
          const node = nodes.find((n) => n.id === nodeId)
          if (node) {
            dragOffsetRef.current = {
              x: x - node.position.x,
              y: y - node.position.y,
            }
          }
        } else {
          onSelectNode(null)
        }
      }

      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setMousePos({ x, y })

        if (draggedNodeRef.current) {
          const newX = x - dragOffsetRef.current.x
          const newY = y - dragOffsetRef.current.y
          onUpdateNodePosition(draggedNodeRef.current, { x: newX, y: newY })
        }

        if (connectingFromId) {
          const fromNode = nodes.find((n) => n.id === connectingFromId)
          if (fromNode) {
            const fromPort = getPortPosition(connectingFromId, "right")
            if (fromPort) {
              connectingLineRef.current = {
                startX: fromPort.x,
                startY: fromPort.y,
                endX: x,
                endY: y,
              }
            }
          }
        }
      }

      const handleMouseUp = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        draggedNodeRef.current = null

        if (connectingFromId) {
          const targetNodeId = getNodeAtPosition(x, y)
          if (targetNodeId && targetNodeId !== connectingFromId) {
            onCompleteConnection(targetNodeId)
          }
          connectingLineRef.current = null
        }
      }

      canvas.addEventListener("mousedown", handleMouseDown)
      canvas.addEventListener("mousemove", handleMouseMove)
      canvas.addEventListener("mouseup", handleMouseUp)

      return () => {
        cancelAnimationFrame(animationId)
        canvas.removeEventListener("mousedown", handleMouseDown)
        canvas.removeEventListener("mousemove", handleMouseMove)
        canvas.removeEventListener("mouseup", handleMouseUp)
      }
    }, [
      nodes,
      edges,
      selectedNodeId,
      connectingFromId,
      onSelectNode,
      onUpdateNodePosition,
      onCompleteConnection,
      isDark,
    ])

    return (
      <div
        ref={(el) => {
          containerRef.current = el
          if (ref) {
            if (typeof ref === "function") ref(el)
            else ref.current = el
          }
        }}
        className="w-full h-full bg-background relative overflow-hidden"
      >
        <canvas ref={canvasRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
      </div>
    )
  },
)

ButterflyCanvas.displayName = "ButterflyCanvas"

export default ButterflyCanvas
