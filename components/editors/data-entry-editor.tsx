"use client"

import type { Node } from "@/types/graph"

interface DataEntryEditorProps {
  node: Node
  onUpdate: (updates: Partial<Node["data"]>) => void
}

export default function DataEntryEditor({ node, onUpdate }: DataEntryEditorProps) {
  return null
}
