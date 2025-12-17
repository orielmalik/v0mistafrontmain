"use client"

import { useCallback, useRef, useState, useEffect } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type NodeTypes,
  type Edge,
  type Node,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow"
import "reactflow/dist/style.css"

// Custom Node Component
const CustomNode = ({ data, selected }: any) => {
  const isGoal = data.type === "goal"
  
  const colorMap: Record<string, string> = {
    questionnaire: "bg-blue-500",
    personality: "bg-purple-500",
    dataEntry: "bg-amber-500",
    chat: "bg-green-500",
    goal: "bg-red-600",
    scoring: "bg-cyan-500",
    fileUpload: "bg-pink-500",
  }

  return (
    <div
      className={`px-4 py-3 rounded-lg shadow-lg border-2 min-w-[140px] ${
        colorMap[data.type] || "bg-blue-500"
      } ${
        selected ? "border-yellow-400 ring-4 ring-yellow-400/50" : "border-gray-700"
      } ${isGoal ? "ring-4 ring-red-500/40" : ""}`}
    >
      <div className="text-white font-bold text-sm text-center">
        {data.label}
      </div>
      {isGoal && (
        <div className="text-center text-xl mt-1">🎯</div>
      )}
      
      {/* Input Handle (left) */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-green-500 border-2 border-green-700 cursor-crosshair hover:scale-125 transition-transform"
        style={{ pointerEvents: 'all' }}
      />
      
      {/* Output Handle (right) - NOT for GOAL nodes */}
      {!isGoal && (
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-yellow-500 border-2 border-yellow-700 cursor-crosshair hover:scale-125 transition-transform"
          style={{ pointerEvents: 'all' }}
        />
      )}
    </div>
  )
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
}

// Custom Edge with Weight Label
const CustomEdge = ({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY,
  data,
  selected 
}: any) => {
  const edgePath = `M ${sourceX},${sourceY} C ${sourceX + 100},${sourceY} ${targetX - 100},${targetY} ${targetX},${targetY}`
  
  const midX = (sourceX + targetX) / 2
  const midY = (sourceY + targetY) / 2

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={3}
        stroke={selected ? "#2563eb" : "#475569"}
        fill="none"
        markerEnd="url(#arrow)"
      />
      
      {/* Weight Label */}
      <g transform={`translate(${midX}, ${midY})`}>
        <circle
          r={18}
          fill="white"
          stroke={selected ? "#2563eb" : "#475569"}
          strokeWidth={2.5}
          className="cursor-pointer hover:r-20"
        />
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-bold cursor-pointer select-none"
          fill="#1e293b"
        >
          {data?.weight || 1}
        </text>
      </g>
    </>
  )
}

interface CanvasProps {
  nodes: any[]
  edges: any[]
  selectedNodeId: string | null
  connectingFromId: string | null
  onSelectNode: (id: string | null) => void
  onUpdateNodePosition: (id: string, position: { x: number; y: number }) => void
  onStartConnection: (id: string) => void
  onCompleteConnection: (toId: string) => void
  onDeleteNode: (id: string) => void
  onDeleteEdge: (id: string) => void
  onUpdateEdgeWeight: (edgeId: string, weight: number) => void
  isDark: boolean
}

function CanvasInner({
  nodes: propNodes,
  edges: propEdges,
  selectedNodeId,
  connectingFromId,
  onSelectNode,
  onUpdateNodePosition,
  onStartConnection,
  onCompleteConnection,
  onDeleteEdge,
  onUpdateEdgeWeight,
  isDark,
}: CanvasProps) {
  const reactFlowInstance = useReactFlow()
  
  // Convert props to ReactFlow format
  const toFlowNodes = useCallback((nodes: any[]): Node[] => {
    return nodes.map((n) => ({
      id: n.id,
      type: "custom",
      position: n.position,
      data: {
        label: n.data.label || "Untitled",
        type: n.type,
      },
      selected: n.id === selectedNodeId,
    }))
  }, [selectedNodeId])

  const toFlowEdges = useCallback((edges: any[]): Edge[] => {
    return edges.map((e) => ({
      id: e.id,
      source: e.from,
      target: e.to,
      type: 'custom',
      data: { weight: e.weight },
      animated: false,
      style: { strokeWidth: 3 },
    }))
  }, [])

  const [nodes, setNodes, onNodesChange] = useNodesState(toFlowNodes(propNodes))
  const [edges, setEdges, onEdgesChange] = useEdgesState(toFlowEdges(propEdges))

  // Sync props to state
  useEffect(() => {
    setNodes(toFlowNodes(propNodes))
  }, [propNodes, toFlowNodes, setNodes])

  useEffect(() => {
    setEdges(toFlowEdges(propEdges))
  }, [propEdges, toFlowEdges, setEdges])

  // Auto-fit view when nodes change
  useEffect(() => {
    if (nodes.length > 0 && reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 400 })
      }, 100)
    }
  }, [nodes.length, reactFlowInstance])

  const onConnect = useCallback((connection: Connection) => {
    const sourceNode = propNodes.find((n) => n.id === connection.source)
    
    // Prevent GOAL nodes from having outgoing edges
    if (sourceNode?.type === "goal") {
      alert("Goal nodes cannot have outgoing edges")
      return
    }

    // Check if edge already exists
    const edgeExists = propEdges.some(
      e => e.from === connection.source && e.to === connection.target
    )
    
    if (!edgeExists && connection.target) {
      onCompleteConnection(connection.target)
    }
  }, [propNodes, propEdges, onCompleteConnection])

  const onNodeDragStop = useCallback((_: any, node: any) => {
    onUpdateNodePosition(node.id, node.position)
  }, [onUpdateNodePosition])

  const onNodeClick = useCallback((_: any, node: any) => {
    onSelectNode(node.id)
  }, [onSelectNode])

  const onPaneClick = useCallback(() => {
    onSelectNode(null)
  }, [onSelectNode])

  const onEdgeClick = useCallback((event: any, edge: any) => {
    event.stopPropagation()
    const currentWeight = edge.data?.weight || 1
    const newWeight = prompt(`Edit edge weight (enter 0 to delete):`, currentWeight.toString())
    
    if (newWeight !== null) {
      const numWeight = Math.max(0, parseInt(newWeight) || 0)
      if (numWeight === 0) {
        onDeleteEdge(edge.id)
      } else {
        onUpdateEdgeWeight(edge.id, numWeight)
      }
    }
  }, [onDeleteEdge, onUpdateEdgeWeight])

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.3}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Background 
          variant="dots" 
          gap={20} 
          size={1}
          color={isDark ? "#374151" : "#d1d5db"}
        />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            const type = node.data?.type
            const colorMap: Record<string, string> = {
              questionnaire: "#3b82f6",
              personality: "#8b5cf6",
              dataEntry: "#f59e0b",
              chat: "#10b981",
              goal: "#dc2626",
              scoring: "#06b6d4",
              fileUpload: "#ec4899",
            }
            return colorMap[type] || "#3b82f6"
          }}
          maskColor={isDark ? "#1f293780" : "#f1f5f980"}
        />
      </ReactFlow>

      {/* Arrow marker definition */}
      <svg style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth={6}
            markerHeight={6}
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
          </marker>
        </defs>
      </svg>
    </div>
  )
}

export default function Canvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  )
}
