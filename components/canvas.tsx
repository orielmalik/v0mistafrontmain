"use client"

import { useCallback, useEffect, useMemo } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
} from "reactflow"
import "reactflow/dist/style.css"

import CustomNode from "./custom-node"
import CustomEdge from "./custom-edge"
import type { Node as GraphNode, Edge as GraphEdge } from "@/types/graph"

const nodeTypes: NodeTypes = {
  custom: CustomNode,
}

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
}

const toFlowNodes = (nodes: GraphNode[]) =>
  nodes.map((n) => ({
    id: n.id,
    type: "custom",
    position: n.position,
    data: {
      label: n.data.label || "Untitled",
      type: n.type === "goal" ? "goal" : "questionnaire",
    },
  }))

const toFlowEdges = (edges: GraphEdge[], onDelete: (id: string) => void, onUpdate: (id: string, w: number) => void) =>
  edges
    .filter((e) => e.weight > 0)
    .map((e) => ({
      id: e.id,
      source: e.from,
      target: e.to,
      type: "custom",
      animated: false,
      data: {
        weight: e.weight,
        onDeleteEdge: onDelete,
        onUpdateEdgeWeight: onUpdate,
      },
    }))

interface CanvasProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  selectedNodeId: string | null
  connectingFromId: string | null
  onSelectNode: (id: string | null) => void
  onUpdateNodePosition: (id: string, position: { x: number; y: number }) => void
  onUpdateNodeData: (id: string, data: any) => void
  onStartConnection: (id: string) => void
  onCompleteConnection: (connection: { source: string; target: string }) => void
  onDeleteNode: () => void
  onDeleteEdge: (id: string) => void
  onUpdateEdgeWeight: (edgeId: string, weight: number) => void
  isDark: boolean
}

function Canvas({
  nodes: propNodes,
  edges: propEdges,
  selectedNodeId,
  onSelectNode,
  onUpdateNodePosition,
  onCompleteConnection,
  onDeleteEdge,
  onUpdateEdgeWeight,
  isDark,
}: CanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(toFlowNodes(propNodes))
  const [edges, setEdges, onEdgesChange] = useEdgesState(toFlowEdges(propEdges, onDeleteEdge, onUpdateEdgeWeight))

  useEffect(() => {
    setNodes(toFlowNodes(propNodes))
  }, [propNodes, setNodes])

  useEffect(() => {
    setEdges(toFlowEdges(propEdges, onDeleteEdge, onUpdateEdgeWeight))
  }, [propEdges, onDeleteEdge, onUpdateEdgeWeight, setEdges])

  const onNodeDragStop = useCallback(
    (_: any, node: any) => {
      onUpdateNodePosition(node.id, { x: node.position.x, y: node.position.y })
    },
    [onUpdateNodePosition],
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      // Validation 1: source and target must exist
      if (!connection.source || !connection.target) {
        console.warn("[v0] Connection missing source or target, rejecting")
        return
      }

      // Validation 2: find source and target nodes
      const sourceNode = propNodes.find((n) => n.id === connection.source)
      const targetNode = propNodes.find((n) => n.id === connection.target)

      if (!sourceNode || !targetNode) {
        console.warn("[v0] Source or target node not found, rejecting")
        return
      }

      // Validation 3: no self-loops
      if (connection.source === connection.target) {
        console.warn("[v0] Self-loop detected, rejecting")
        return
      }

      // Validation 4: Goal nodes cannot have outgoing edges
      if (sourceNode.type === "goal") {
        console.warn("[v0] Attempting to connect from Goal node, rejecting")
        return
      }

      // Validation 5: source must be Questionnaire
      if (sourceNode.type !== "questionnaire") {
        console.warn("[v0] Source node is not Questionnaire, rejecting")
        return
      }

      // Validation 6: target must be Goal or Questionnaire
      if (targetNode.type !== "goal" && targetNode.type !== "questionnaire") {
        console.warn("[v0] Target node type invalid, rejecting")
        return
      }

      // Validation 7: no duplicate edges
      const edgeExists = propEdges.some((e) => e.from === connection.source && e.to === connection.target)
      if (edgeExists) {
        console.warn("[v0] Duplicate edge detected, rejecting")
        return
      }

      console.log(`[v0] Valid connection: ${connection.source} → ${connection.target}`)
      onCompleteConnection({ source: connection.source, target: connection.target })
    },
    [propNodes, propEdges, onCompleteConnection],
  )

  const nodeColors: Record<string, string> = useMemo(
    () => ({
      questionnaire: "#2563eb",
      goal: "#dc2626",
    }),
    [],
  )

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={(_, node) => onSelectNode(node.id)}
        onPaneClick={() => onSelectNode(null)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1.5 }}
        connectionLineType="smoothstep"
        defaultEdgeOptions={{
          type: "custom",
        }}
        connectionLineStyle={{
          stroke: "#f59e0b",
          strokeWidth: 4,
          strokeDasharray: "6 4",
          opacity: 0.8,
        }}
      >
        <Background variant="dots" gap={16} size={1} color="#e2e8f0" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            const type = propNodes.find((pn) => pn.id === n.id)?.type ?? "questionnaire"
            return nodeColors[type] || "#3b82f6"
          }}
          pannable
          zoomable
          maskColor={isDark ? "rgb(15 23 42 / 0.8)" : "rgb(248 250 252 / 0.9)"}
          style={{
            backgroundColor: isDark ? "#1e293b" : "#f8fafc",
          }}
        />
      </ReactFlow>
    </div>
  )
}

Canvas.displayName = "Canvas"

export default Canvas
