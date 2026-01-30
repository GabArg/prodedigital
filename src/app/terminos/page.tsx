import React from 'react';
import Link from 'next/link';

export default function TerminosPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 py-12 px-4">
            <div className="container max-w-3xl mx-auto space-y-8">
                <header className="border-b border-white/10 pb-6 mb-8">
                    <Link href="/" className="text-amber-500 font-bold mb-4 inline-block hover:underline">
                        ← Volver al Inicio
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
                        Términos y Condiciones
                    </h1>
                    <p className="text-slate-400 mt-2">Última actualización: Enero 2026</p>
                </header>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white">1. Naturaleza del Servicio</h2>
                    <p>
                        ProdeDigital es una plataforma de <strong>entretenimiento no lucrativo (juego gratuito)</strong> dedicada a los pronósticos deportivos ("Prode").
                        Su único fin es la recreación y la competencia social entre usuarios.
                    </p>
                    <div className="bg-amber-900/20 border border-amber-500/20 p-4 rounded-lg text-amber-200 text-sm font-medium">
                        IMPORTANTE: ESTO NO ES UNA PLATAFORMA DE APUESTAS.
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white">2. Sin Dinero Real</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Los "Créditos" (CR) utilizados en la plataforma son virtuales, ficticios y carecen de valor monetario alguno.</li>
                        <li>Los Créditos NO pueden ser comprados con dinero real, NO pueden ser retirados, ni canjeados por dinero, bienes o servicios fuera de la plataforma.</li>
                        <li>No existe riesgo financiero para el usuario al participar.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white">3. Requisitos de Edad</h2>
                    <p>
                        El servicio está estrictamente reservado para personas mayores de <strong>18 años</strong>.
                        Al registrarse, el usuario declara bajo juramento cumplir con este requisito. ProdeDigital se reserva el derecho de solicitar documentación para verificar la identidad y edad, y de suspender cuentas que no cumplan con esta norma.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white">4. Premios y Torneos</h2>
                    <p>
                        La plataforma puede, ocasionalmente, organizar torneos patrocinados con premios simbólicos.
                        ProdeDigital se reserva el derecho absoluto de modificar, cancelar o suspender cualquier torneo, regla de puntuación o premio sin previo aviso.
                        La entrega de cualquier premio está sujeta a la verificación de identidad del ganador.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white">5. Limitación de Responsabilidad</h2>
                    <p>
                        ProdeDigital no garantiza la disponibilidad ininterrumpida del servicio. No nos hacemos responsables por errores en la carga de datos, fallos en el sistema de puntuación, ni por interrupciones técnicas que pudieran afectar el desarrollo de los torneos.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white">6. Jurisdicción</h2>
                    <p>
                        Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa será resuelta en los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.
                    </p>
                </section>

                <footer className="pt-8 border-t border-white/10 mt-12 text-center text-sm text-slate-500">
                    <p>Si tiene dudas, contáctenos en <a href="mailto:legales@prodedigital.com" className="text-amber-500 hover:underline">legales@prodedigital.com</a></p>
                </footer>
            </div>
        </div>
    );
}
