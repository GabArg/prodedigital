import React from 'react';

export const Footer = () => {
    return (
        <footer className="border-t border-white/5 py-8 mt-auto bg-slate-900/30">
            <div className="container text-center space-y-4">
                <p className="text-slate-500 text-sm">
                    © {new Date().getFullYear()} <span className="text-slate-300 font-bold">PRODE DIGITAL</span>.
                    Juego de pronósticos deportivos. No implica apuestas con dinero real.
                </p>
                <div className="flex justify-center gap-6 text-xs font-medium text-slate-600">
                    <a href="/terminos" className="hover:text-slate-400 transition-colors">Términos y Condiciones</a>
                    <a href="/privacidad" className="hover:text-slate-400 transition-colors">Política de Privacidad</a>
                </div>
            </div>
        </footer>
    );
};
