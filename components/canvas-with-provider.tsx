"use client"

import ButterflyCanvas from "./butterfly-canvas"

interface CanvasWithProviderProps {
  nodes: any[]
  edges: any[]
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

export default function CanvasWithProvider(props: CanvasWithProviderProps) {
  return <ButterflyCanvas {...props} />
}
