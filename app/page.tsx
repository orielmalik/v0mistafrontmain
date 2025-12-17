import Link from "next/link"
import { ArrowRight, Network } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-black dark:to-slate-900 flex flex-col items-center justify-center px-6 py-20">
      {/* Header with branding */}
      <div className="text-center max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Network className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Mission Statement Assistant
          </span>
          <Network className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>

        <h1 className="text-6xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 text-balance">
          Empowering Your Vision:
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Achieve Clarity with Our Mission Statement Assistant
          </span>
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
          Our primary mission is to provide an intuitive, step-by-step framework to{" "}
          <span className="font-semibold">
            assist you in articulating, refining, and visualizing your effective Mission Statement
          </span>
          .
        </p>

        <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          We aim to distill complex ideas into clear, actionable, and inspiring directives using interactive graph
          theory visualization.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link href="/auth">
            <button className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all hover:scale-105">
              <span className="flex items-center gap-3">
                Start Building Your Mission
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
          </Link>

          <Link href="/graphstudio/demo/graphs/demo-graph/studio">
            <button className="px-10 py-5 bg-white dark:bg-slate-800 text-gray-800 dark:text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 border border-gray-200 dark:border-slate-700">
              Try Interactive Demo →
            </button>
          </Link>
        </div>

        <p className="mt-16 text-sm text-gray-500 dark:text-gray-400">
          No login required for demo • Visualize nodes, edges, and weighted relationships
        </p>

        {/* Features section */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Clear Concept Nodes</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Each core concept in your mission is represented as a distinct, visible node in the graph.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
            <div className="text-3xl mb-4">🔗</div>
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Weighted Relationships</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Directed edges show how concepts connect, with numerical weights reflecting impact and priority.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
            <div className="text-3xl mb-4">✨</div>
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Dynamic Visualization</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Watch your mission statement materialize as you create nodes and connections in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
