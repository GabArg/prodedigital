import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Trophy, Target, Users, TrendingUp, ChevronRight, Play, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col gap-24 pb-24 bg-[#0B1C2D]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="container relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-amber-500 text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 backdrop-blur-md shadow-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="uppercase tracking-widest">Torneo Clausura 2026 — ¡INSCRIPCIONES ABIERTAS!</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-white font-display uppercase leading-none">
            DEMUESTRA CUÁNTO <br className="hidden md:block" />
            SABES DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">FÚTBOL</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mb-4 leading-relaxed font-medium">
            La plataforma líder de pronósticos deportivos. Compite con amigos en grupos privados, escala el ranking global y gana premios reales.
          </p>

          <p className="text-sm text-slate-500 mb-12 font-medium">
            Juego de pronósticos deportivos. No implica apuestas con dinero real.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
            <Link href="/register">
              <Button size="lg" className="min-w-[240px] h-16 text-xl font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl shadow-2xl shadow-amber-500/20 group transition-all">
                EMPEZAR A JUGAR <Play size={20} className="ml-2 group-hover:translate-x-1 transition-transform fill-current" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary" size="lg" className="min-w-[240px] h-16 text-xl font-bold bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl backdrop-blur-md transition-all">
                REGÍSTRATE GRATIS
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="container relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-sm font-black text-amber-500 uppercase tracking-[0.3em] mb-4">Cómo se juega</h2>
          <p className="text-3xl md:text-4xl font-black text-white uppercase italic">Simple, Rápido y Emocionante</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group relative p-10 bg-white/[0.02] border border-white/5 rounded-[32px] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500">
            <div className="flex-center w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 mb-8 group-hover:scale-110 transition-transform duration-500">
              <Target size={32} />
            </div>
            <h3 className="text-2xl font-black mb-4 text-white uppercase tracking-tight">1. Elegí un torneo</h3>
            <p className="text-slate-400 leading-relaxed font-medium">
              Pronosticá partidos de Liga Argentina, Libertadores, Mundial y más.
            </p>
          </div>

          <div className="group relative p-10 bg-white/[0.02] border border-white/5 rounded-[32px] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500">
            <div className="flex-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mb-8 group-hover:scale-110 transition-transform duration-500">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-2xl font-black mb-4 text-white uppercase tracking-tight">2. Completá tu boleta</h3>
            <p className="text-slate-400 leading-relaxed font-medium">
              Elegí Local / Empate / Visitante. Simple y rápido.
            </p>
          </div>

          <div className="group relative p-10 bg-white/[0.02] border border-white/5 rounded-[32px] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500">
            <div className="flex-center w-16 h-16 rounded-2xl bg-green-500/10 text-green-500 mb-8 group-hover:scale-110 transition-transform duration-500">
              <Trophy size={32} />
            </div>
            <h3 className="text-2xl font-black mb-4 text-white uppercase tracking-tight">3. Sumá puntos y competí</h3>
            <p className="text-slate-400 leading-relaxed font-medium">
              Cada acierto suma puntos. Subí en el ranking y competí con otros jugadores.
            </p>
          </div>
        </div>
      </section>

      {/* Friends Tournament Section */}
      <section className="container relative z-10">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1A2633] to-[#0F243A] border border-white/5 rounded-[40px] p-12 md:p-24 text-center md:text-left flex flex-col md:flex-row items-center gap-12">

          {/* Blob */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[50%] h-[100%] bg-blue-500/5 blur-[100px] pointer-events-none" />

          <div className="flex-1 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Users size={14} />
              <span>Competición Social</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight italic">
              Jugá con tus amigos
            </h2>
            <p className="text-xl text-slate-400 leading-relaxed font-medium mb-8 max-w-xl">
              Creá grupos privados, elegí qué torneos jugar y competí por ver quién sabe más de fútbol. La rivalidad nunca fue tan divertida.
            </p>
            <Link href="/register">
              <Button className="h-14 px-8 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20">
                CREAR GRUPO
              </Button>
            </Link>
          </div>

          {/* Visual Icon/Card for Friends */}
          <div className="relative z-10 w-full md:w-auto flex justify-center">
            <div className="w-64 h-64 bg-white/[0.03] border border-white/10 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl animate-pulse" />
              <Users size={80} className="text-white relative z-10" />

              {/* Floating Avatars / Decorations */}
              <div className="absolute top-0 right-0 p-3 bg-[#0B1C2D] border border-white/10 rounded-2xl shadow-xl transform translate-x-4 -translate-y-4">
                <Trophy size={24} className="text-amber-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container">
        <div className="bg-white/[0.02] border border-white/5 rounded-[48px] p-12 md:p-20 text-center relative overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-amber-500/5 pointer-events-none" />
          <div className="grid md:grid-cols-3 gap-12 relative z-10 mb-8">
            <div>
              <div className="text-5xl md:text-6xl font-black text-white mb-3 font-display tracking-tighter">+12K</div>
              <div className="text-amber-500 uppercase text-xs tracking-[0.2em] font-black">Jugadores Activos</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-black text-white mb-3 font-display tracking-tighter">Millones</div>
              <div className="text-amber-500 uppercase text-xs tracking-[0.2em] font-black">De Créditos Jugados</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-black text-white mb-3 font-display tracking-tighter">Decenas</div>
              <div className="text-amber-500 uppercase text-xs tracking-[0.2em] font-black">De Torneos</div>
            </div>
          </div>
          <p className="text-slate-600 text-xs font-medium uppercase tracking-widest">Datos estimados de la plataforma</p>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="container text-center pt-8">
        <Card className="bg-gradient-to-br from-[#0F243A] to-[#1A2633] border-white/5 p-16 rounded-[40px] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight uppercase">¿LISTO PARA HACER HISTORIA?</h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Unite gratis y recibí 500 créditos para tus primeros pronósticos.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-slate-950 hover:bg-slate-100 font-black h-16 px-12 rounded-2xl text-xl">
                EMPEZAR A JUGAR
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
