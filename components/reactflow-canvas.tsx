"use client"

import { useCallback, useMemo, useEffect, useRef, useState } from "react"
import ReactFlow, {
  type Node as RFNode,
  type Edge as RFEdge,
  type Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  type ReactFlowInstance,
} from "reactflow"
import "reactflow/dist/style.css"
import type { Node, Edge } from "@/types/graph"
import CustomNode from "./custom-node"
import CustomEdge from "./custom-edge"

interface ReactFlowCanvasProps {
  nodes: Node[]
  edges: Edge[]
  selectedNodeId: string | null
  onSelectNode: (id: string | null) => void
  onUpdateNodePosition: (id: string, position: { x: number; y: number }) => void
  onUpdateNodeData: (id: string, data: any) => void
  onCompleteConnection: (toId: string) => void
  onDeleteEdge: (id: string) => void
  onUpdateEdgeWeight: (edgeId: string, weight: number) => void
  isDark: boolean
  onReactFlowInit?: (instance: ReactFlowInstance) => void
}

const nodeTypes = {
  custom: CustomNode,
}

const edgeTypes = {
  custom: CustomEdge,
}

export default function ReactFlowCanvas({
  nodes: graphNodes,
  edges: graphEdges,
  selectedNodeId,
  onSelectNode,
  onUpdateNodePosition,
  onUpdateNodeData,
  onCompleteConnection,
  onDeleteEdge,
  onUpdateEdgeWeight,
  isDark,
  onReactFlowInit,
}: ReactFlowCanvasProps) {
  // Convert graph nodes to ReactFlow nodes
  const rfNodes: RFNode[] = useMemo(
    () =>
      graphNodes.map((node) => ({
        id: node.id,
        type: "custom",
        position: node.position,
        data: {
          label: node.data.label,
          nodeType: node.type,
          isSelected: node.id === selectedNodeId,
          isDark,
          onSelect: () => onSelectNode(node.id),
        },
      })),
    [graphNodes, selectedNodeId, isDark, onSelectNode],
  )

  // Convert graph edges to ReactFlow edges with weight tracking
  const rfEdges: RFEdge[] = useMemo(
    () =>
      graphEdges.map((edge) => ({
        id: edge.id,
        source: edge.from,
        target: edge.to,
        type: "custom",
        animated: false,
        data: {
          weight: edge.weight,
          isHovered: false,
          onWeightClick: (edgeId: string) => {
            const edgeData = graphEdges.find((e) => e.id === edgeId)
            if (!edgeData) return
            const newWeight = prompt(`Edit weight (enter 0 to delete edge):`, edgeData.weight.toString())
            if (newWeight !== null) {
              const numWeight = Math.max(0, Number.parseInt(newWeight) || 0)
              if (numWeight === 0) {
                onDeleteEdge(edgeId)
              } else {
                onUpdateEdgeWeight(edgeId, numWeight)
              }
            }
          },
          onHoverChange: () => {},
        },
      })),
    [graphEdges, onDeleteEdge, onUpdateEdgeWeight],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges)
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // Update local state when graph data changes
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes)
      // Sync position changes back to parent
      changes.forEach((change: any) => {
        if (change.type === "position" && change.position) {
          onUpdateNodePosition(change.id, change.position)
        }
      })
    },
    [onNodesChange, onUpdateNodePosition],
  )

  // Handle new connections
  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = graphNodes.find((n) => n.id === connection.source)
      if (sourceNode?.type === "goal") {
        alert("Goal nodes cannot have outgoing edges")
        return
      }

      if (
        connection.source &&
        connection.target &&
        connection.source !== connection.target &&
        !graphEdges.some((e) => e.from === connection.source && e.to === connection.target)
      ) {
        onCompleteConnection(connection.target)
      }
    },
    [graphNodes, graphEdges, onCompleteConnection],
  )

  // Fit view when nodes change
  useEffect(() => {
    if (rfInstance && nodes.length > 0) {
      // Use setTimeout to ensure DOM is updated first
      setTimeout(() => {
        rfInstance.fitView({ padding: 0.2, minZoom: 0.5, maxZoom: 2 })
      }, 0)
    }
  }, [nodes.length, rfInstance])

  // Notify parent of ReactFlow instance
  useEffect(() => {
    if (rfInstance && onReactFlowInit) {
      onReactFlowInit(rfInstance)
    }
  }, [rfInstance, onReactFlowInit])

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={setRfInstance}
        fitView
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
