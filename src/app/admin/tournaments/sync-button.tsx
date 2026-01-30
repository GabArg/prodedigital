'use client';

import { useState } from 'react';
import { syncTournament } from '../../actions/admin-tournaments';

export function SyncButton({ tournamentId }: { tournamentId: string }) {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const handleSync = async () => {
        setLoading(true);
        setMsg('');
        try {
            const res = await syncTournament(tournamentId);
            if (res.success) {
                setMsg('✅ Synced!');
            } else {
                setMsg(`❌ Error: ${res.error}`);
            }
        } catch (e) {
            setMsg('❌ Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleSync}
                disabled={loading}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50 hover:bg-blue-700"
            >
                {loading ? 'Syncing...' : 'Sync Now'}
            </button>
            {msg && <span className="text-xs">{msg}</span>}
        </div>
    );
}
