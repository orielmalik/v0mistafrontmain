"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Canvas from "@/components/canvas"
import Toolbar from "@/components/toolbar"
import Editor from "@/components/editor"
import type { Node, Edge } from "@/types/graph"
import { Save, Download, CheckCircle } from "lucide-react"
import { apiService } from "@/services/ApiService"

export const dynamic = "force-dynamic"

const GRAPH_LOADED_KEY = "mistaa_graph_loaded_once"

// Function to create date in DD-MM-YYYY format
const getCurrentDateString = (): string => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  return `${day}-${month}-${year}`
}

export default function StudioPage() {
  const params = useParams<{ operatorId: string; graphId: string }>()
  const operatorId = params?.operatorId ?? "unknown"
  const graphId = params?.graphId ?? "untitled"

  const displayName = graphId
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null)
  const [isDark] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  useEffect(() => {
    const alreadyLoaded = sessionStorage.getItem(`${GRAPH_LOADED_KEY}_${graphId}`)
    if (alreadyLoaded === "true") return

    const loadGraph = async () => {
      try {
        const response = await apiService.loadGraph(operatorId, graphId)
        if (!response.error && response.data) {
          setNodes(response.data.nodes || [])
          setEdges(response.data.edges || [])
        }
      } catch (err) {
        console.info("Failed to load graph – starting with empty canvas")
      } finally {
        sessionStorage.setItem(`${GRAPH_LOADED_KEY}_${graphId}`, "true")
      }
    }

    loadGraph()
  }, [graphId, operatorId])

  const deleteSelectedNode = () => {
    if (!selectedNodeId) return
    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId))
    setEdges((prev) => prev.filter((e) => e.from !== selectedNodeId && e.to !== selectedNodeId))
    setSelectedNodeId(null)
  }

  const addNode = (type: Node["type"]) => {
    if (!["questionnaire", "goal"].includes(type)) {
      alert("Invalid node type")
      return
    }

    const id = `node-${Date.now()}`
    let x = 250 + Math.random() * 500
    let y = 150 + Math.random() * 400

    if (nodes.length > 0) {
      x += (nodes.length % 3) * 200
      y += Math.floor(nodes.length / 3) * 180
    }

    const newNode: Node = {
      id,
      type,
      position: { x, y },
      data: type === "questionnaire" 
        ? { createdTimestamp: getCurrentDateString() }
        : {},
    }

    setNodes((prev) => [...prev, newNode])
    setSelectedNodeId(id)
  }
  
const buildPayload = () => {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: {
        x: Number(node.position.x.toFixed(2)),
        y: Number(node.position.y.toFixed(2)),
      },
      operatorId,
      graphId,
      data:
        node.type === "questionnaire"
          ? {
              QUESTIONNAIRE: {
                ...node.data,
                createdTimestamp:
                  node.data?.createdTimestamp || getCurrentDateString(),
              },
            }
          : {
              GOAL: {
                ...node.data,
              },
            },
    })),
    edges: edges.map((edge) => ({
      from: edge.from,
      to: edge.to,
      weight: Number(edge.weight) || 0,
    })),
    valid: true,
  }
}


  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus("saving")

    const payload = buildPayload()

    console.log("Sending payload:", payload)

    try {
      const response = await apiService.updateGraph(graphId, payload)

      if (response.error) throw new Error(response.error.message || "Unknown error")

      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch (err: any) {
      console.error("Save failed:", err)
      setSaveStatus("error")
      alert("Save failed: " + (err.message || "Check console"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    const payload = buildPayload()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${graphId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectedNode = nodes.find((n) => n.id === selectedNodeId)

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">MISSION STATEMENT</h1>
          <p className="text-sm text-gray-500">{displayName}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "saved" && (
              <>
                <CheckCircle className="h-4 w-4" />
                Saved!
              </>
            )}
            {saveStatus === "error" && "Save Failed"}
            {saveStatus === "idle" && (
              <>
                <Save className="h-4 w-4" />
                Save Graph
              </>
            )}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export JSON
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Toolbar onAddNode={addNode} isDark={isDark} />

        <div className="flex-1 relative">
          <Canvas
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId}
            connectingFromId={connectingFromId}
            onSelectNode={setSelectedNodeId}
            onUpdateNodePosition={(id, position) => {
              setNodes((prev) =>
                prev.map((node) =>
                  node.id === id ? { ...node, position: { x: position.x, y: position.y } } : node
                )
              )
            }}
          onUpdateNodeData={(id, data) =>
             setNodes((prev) =>
              prev.map((n) => {
                if (n.id !== id) return n

                const mergedData = { ...n.data, ...data }

                let label = mergedData.label

                if (n.type === "questionnaire") {
                  label = mergedData.category || "Questionnaire"
                }

                if (n.type === "goal") {
                  label = mergedData.goalName || "Goal"
                }

                return {
                  ...n,
                  data: {
                    ...mergedData,
                    label,
                  },
                }
              })
            )
          }

            onStartConnection={(sourceId) => {
              const node = nodes.find((n) => n.id === sourceId)
              if (node?.type === "goal") {
                alert("Goal nodes cannot have outgoing edges")
                return
              }
              setConnectingFromId(sourceId)
            }}
            onCompleteConnection={(connection) => {
              const fromId = connection.source
              const toId = connection.target

              if (!fromId || !toId || fromId === toId) {
                setConnectingFromId(null)
                return
              }

              const sourceNode = nodes.find((n) => n.id === fromId)
              const targetNode = nodes.find((n) => n.id === toId)

              if (!sourceNode || !targetNode || sourceNode.type !== "questionnaire") {
                alert("Invalid connection")
                setConnectingFromId(null)
                return
              }

              let weight: number | null = null
              while (weight === null) {
                const input = prompt("Enter edge weight (positive integer):", "1")
                if (input === null) {
                  setConnectingFromId(null)
                  return
                }
                const num = parseInt(input.trim(), 10)
                if (isNaN(num) || num <= 0) {
                  alert("Please enter a positive integer")
                } else {
                  weight = num
                }
              }

              const edgeId = `edge-${fromId}-${toId}-${Date.now()}`
              setEdges((prev) => [...prev, { id: edgeId, from: fromId, to: toId, weight }])
              setConnectingFromId(null)
            }}
            onDeleteNode={deleteSelectedNode}
            onDeleteEdge={(edgeId) => setEdges((prev) => prev.filter((e) => e.id !== edgeId))}
            onUpdateEdgeWeight={(edgeId, weight) =>
              setEdges((prev) => prev.map((e) => (e.id === edgeId ? { ...e, weight } : e)))
            }
            isDark={isDark}
          />
        </div>

        <Editor
          node={selectedNode ?? null}
          edges={edges}
          onUpdateNode={(data) => {
            if (!selectedNodeId) return
            setNodes((prev) =>
              prev.map((n) => (n.id === selectedNodeId ? { ...n, data: { ...n.data, ...data } } : n))
            )
          }}
          onDeleteNode={deleteSelectedNode}
          isDark={isDark}
        />
      </div>
    </div>
  )
}
