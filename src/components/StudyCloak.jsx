import { ArrowLeft, BookOpen } from 'lucide-react';

export default function StudyCloak({ onExit }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
          <div className="flex items-center gap-2 font-semibold text-slate-900 whitespace-nowrap shrink-0">
            <BookOpen className="w-4 h-4 text-slate-700" />
            <span>Algebra II Study Notes</span>
          </div>
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            Return
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <section>
          <p className="text-xs text-slate-500">Unit 4 · Quadratic Functions &amp; Factoring</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Vertex Form, Discriminants, and Completing the Square
          </h1>
          <p className="mt-3 text-slate-600 leading-relaxed max-w-2xl">
            A quadratic equation in standard form is written as ax² + bx + c = 0, where a ≠ 0.
            Understanding how coefficients shift the parabola allows rapid graphing without plotting every point.
          </p>
        </section>

        <section className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          <div className="p-5 rounded-xl bg-white border border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">1. Vertex Form</h2>
            <p className="mt-2 text-sm font-mono text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
              f(x) = a(x - h)² + k
            </p>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              The vertex sits at (h, k). When a &gt; 0, the parabola opens upward with a minimum at k. When a &lt; 0, it opens downward with a maximum at k.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">2. The Discriminant</h2>
            <p className="mt-2 text-sm font-mono text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
              Δ = b² - 4ac
            </p>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              If Δ &gt; 0, there are two distinct real roots. If Δ = 0, there is exactly one real double root. If Δ &lt; 0, the roots are complex conjugates.
            </p>
          </div>
        </section>

        <section className="p-5 rounded-xl bg-white border border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Practice Problems</h2>
          <ol className="mt-3 space-y-2 text-sm text-slate-700 list-decimal list-inside">
            <li>Find the vertex and axis of symmetry for y = 2(x - 3)² - 5.</li>
            <li>Determine the number of real solutions for 3x² - 6x + 3 = 0.</li>
            <li>Rewrite x² + 8x + 10 = 0 by completing the square.</li>
          </ol>
        </section>
      </main>
    </div>
  );
}
