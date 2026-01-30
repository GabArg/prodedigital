import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Users, Ticket, Trophy, Activity } from 'lucide-react';

export const dynamic = 'force-dynamic'; // Real-time data

async function getMetrics() {
    const supabase = await createClient();

    // 1. Total Users
    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    // 2. Total Slips Played (from matches or events)
    // Using events for "new" data, but falls back to prode_slips logic if we want total history.
    // Let's use prode_slips participation approximation or user_prediction count if available.
    // For MVP transparency, let's count 'user_predictions' rows as "Jugadas"
    const { count: totalPredictions } = await supabase
        .from('user_predictions')
        .select('*', { count: 'exact', head: true });

    // 3. Friends Tournaments
    const { count: totalGroups } = await supabase
        .from('friend_tournaments')
        .select('*', { count: 'exact', head: true });

    // 4. Active Users (Last 7 Days) - via Analytics Events
    // Distinct users who triggered 'slip_played' or 'friends_tournament_joined'
    // Note: Supabase JS doesn't support easy "count distinct" without RPC.
    // We will fetch the raw events for last 7d and set-count in JS (assuming scale < 10k for now)

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: activeEvents } = await supabase
        .from('analytics_events')
        .select('user_id')
        .in('event_type', ['slip_played', 'friends_tournament_joined'])
        .gte('created_at', sevenDaysAgo.toISOString());

    const activeUserCount = new Set(activeEvents?.map(e => e.user_id)).size;

    return {
        totalUsers: totalUsers || 0,
        totalPredictions: totalPredictions || 0,
        totalGroups: totalGroups || 0,
        activeUserCount
    };
}

export default async function AdminOverviewPage() {
    const metrics = await getMetrics();

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black mb-2">Resumen General</h2>
                <p className="text-slate-400">Métricas clave de rendimiento de la plataforma.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
                <MetricCard
                    title="Usuarios Totales"
                    value={metrics.totalUsers}
                    icon={<Users className="text-blue-500" />}
                />
                <MetricCard
                    title="Jugadas Totales"
                    value={metrics.totalPredictions}
                    label="Predicciones realizadas"
                    icon={<Ticket className="text-amber-500" />}
                />
                <MetricCard
                    title="Torneos de Amigos"
                    value={metrics.totalGroups}
                    icon={<Trophy className="text-purple-500" />}
                />
                <MetricCard
                    title="Usuarios Activos (7d)"
                    value={metrics.activeUserCount}
                    label="Jugaron o se unieron"
                    icon={<Activity className="text-green-500" />}
                />
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon, label }: { title: string, value: number, icon: any, label?: string }) {
    return (
        <Card className="p-6 bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider">{title}</h3>
                {icon}
            </div>
            <div className="text-4xl font-black text-white mb-1">
                {value.toLocaleString()}
            </div>
            {label && <div className="text-xs text-slate-500">{label}</div>}
        </Card>
    );
}
