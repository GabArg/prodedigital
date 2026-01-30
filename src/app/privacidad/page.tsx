import React from 'react';
import Link from 'next/link';

export default function PrivacidadPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 py-12 px-4">
            <div className="container max-w-3xl mx-auto space-y-8">
                <header className="border-b border-white/10 pb-6 mb-8">
                    <Link href="/" className="text-amber-500 font-bold mb-4 inline-block hover:underline">
                        ← Volver al Inicio
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
                        Política de Privacidad
                    </h1>
                    <p className="text-slate-400 mt-2">Última actualización: Enero 2026</p>
                </header>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white">1. Datos que Recopilamos</h2>
                    <p>Para brindar el servicio, recopilamos la siguiente información personal:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Identificación:</strong> Email y Alias del usuario.</li>
                        <li><strong>Verificación:</strong> Fecha de nacimiento (para asegurar mayoría de edad).</li>
                        <li><strong>Contacto:</strong> Número de WhatsApp (opcional, para notificaciones).</li>
                        <li><strong>Actividad:</strong> Datos de uso, predicciones realizadas y torneos creados (Eventos de Analítica).</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white">2. Uso de la Información</h2>
                    <p>Utilizamos sus datos exclusivamente para:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Gestionar su cuenta y permitir el acceso a la plataforma.</li>
                        <li>Calcular puntajes y rankings en los torneos.</li>
                        <li>Enviar notificaciones relevantes sobre el juego (ej. recordatorios de cierre de fechas).</li>
                        <li>Analizar métricas de uso para mejorar la experiencia.</li>
                        <li>Generar <strong>reportes agregados y anónimos</strong> para potenciales patrocinadores (ej. "cantidad de jugadas por fecha").</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white">3. Compartir Información</h2>
                    <div className="bg-slate-900 p-4 rounded border-l-4 border-amber-500">
                        <p className="text-white font-medium">No vendemos ni alquilamos sus datos personales a terceros.</p>
                    </div>
                    <p className="mt-2">
                        Solo compartimos información de manera agregada (sin identificar individuos) con socios comerciales o patrocinadores con fines estadísticos.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white">4. Sus Derechos</h2>
                    <p>
                        Como usuario, usted tiene derecho a acceder, rectificar o solicitar la eliminación de sus datos personales ("Derecho al Olvido").
                    </p>
                    <p>
                        Para ejercer estos derechos, o si desea eliminar su cuenta permanentemente, envíe un correo a la dirección de contacto indicada abajo.
                    </p>
                </section>

                <footer className="pt-8 border-t border-white/10 mt-12 text-center text-sm text-slate-500">
                    <p>Contacto de Privacidad: <a href="mailto:privacidad@prodedigital.com" className="text-amber-500 hover:underline">privacidad@prodedigital.com</a></p>
                </footer>
            </div>
        </div>
    );
}
