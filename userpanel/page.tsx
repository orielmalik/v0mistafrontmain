// app/user-panel/page.tsx  (new page for regular Users)
"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { LogOut, FileText } from "lucide-react"
import { apiService } from "@/services/ApiService"

interface ConnectedGraph {
    id: string
    operatorId: string
}

export default function UserPanel() {
    const { user, logout } = useAuth()
    const router = useRouter()
    const [graphs, setGraphs] = useState<ConnectedGraph[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const userEmail = user?.email || ""

    useEffect(() => {
        if (!userEmail) {
            router.replace("/auth")
            return
        }

        const loadGraphs = async () => {
            try {
                const response = await apiService.getAllConnectedGraphs(userEmail)
                const list = Array.isArray(response.data) ? response.data : []
                setGraphs(list)
                setError(null)
            } catch (err: any) {
                console.error("Error loading connected graphs:", err)
                setError(err.message || "Could not load graphs")
                setGraphs([])
            } finally {
                setLoading(false)
            }
        }

        loadGraphs()
    }, [userEmail, router])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
            <span className="text-xl text-gray-600">Loading available graphs...</span>
        </div>
    )
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center flex-col gap-4">
            <p className="text-red-600 text-xl">Error: {error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 text-white rounded-lg">
            Retry
            </button>
            </div>
    )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:to-black">
        <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="flex justify-between items-start mb-12">
        <div>
            <h1 className="text-5xl font-black text-gray-900 dark:text-white">
            Welcome,{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
        {user?.username || user?.email || "User"}
    </span>
    </h1>
    <p className="text-2xl text-gray-600 dark:text-gray-400 mt-4">
        {graphs.length} {graphs.length === 1 ? "graph" : "graphs"} available for answering
                                                                                 </p>
                                                                                 </div>
                                                                                 <button onClick={logout} className="flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition shadow-lg">
    <LogOut className="w-6 h-6" /> Logout
        </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {graphs.length === 0 ? (
                <div className="col-span-full text-center py-32">
                <p className="text-6xl text-gray-400 mb-8">No graphs assigned yet</p>
                <p className="text-2xl text-gray-500">Contact your operator to get access</p>
        </div>
) : (
        graphs.map((graph) => (
            <Link
                key={graph.id}
    href={`/answer/${graph.operatorId}/${graph.id}`}
    className="block group"
    >
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-xl hover:shadow-2xl hover:scale-105 transition-all border-2 border-transparent hover:border-cyan-500">
    <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl w-20 h-20 flex items-center justify-center mb-6 mx-auto">
    <FileText className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
        {graph.id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </h3>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        by {graph.operatorId}
    </p>
    </div>
    </Link>
))
)}
    </div>
    </div>
    </div>
)
}