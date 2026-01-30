"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@headlessui/react';
import { Users, Copy, Trophy, ArrowLeft, Filter, QrCode, Crown, Settings, Check, X, Edit2, Calendar, Medal, Send, MessageCircle, PlayCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import QRCode from "react-qr-code";
import { Button } from '@/components/ui/Button';

export default function GroupDetailPage() {
    const params = useParams();
    const { user } = useAuth();

    // Group Data
    const [group, setGroup] = useState<any | null>(null);
    const [members, setMembers] = useState<any[]>([]);

    // Admin Data
    const [pendingMembers, setPendingMembers] = useState<any[]>([]);

    // Ranking Data
    const [ranking, setRanking] = useState<any[]>([]);
    const [competitions, setCompetitions] = useState<any[]>([]);
    const [activeCompId, setActiveCompId] = useState<string | null>(null);
    const [activeSlipId, setActiveSlipId] = useState<string | null>(null); // For "Winner of the Date"
    const [availableSlips, setAvailableSlips] = useState<any[]>([]);

    // Play Data
    const [activeSlips, setActiveSlips] = useState<any[]>([]); // Slips open for play

    // History
    const [history, setHistory] = useState<any[]>([]);

    // Chat
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Prizes State
    const [isEditingPrizes, setIsEditingPrizes] = useState(false);
    const [prizes, setPrizes] = useState({ grand: '', round: '' });

    // UI State
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadGroup = async () => {
        if (!params.id || !user) return;
        try {
            const { DataService } = await import('@/services/dataService');
            const data = await DataService.getGroupDetails(params.id as string);

            if (data) {
                setGroup(data);
                setMembers(data.members || []);
                setCompetitions(data.competitions || []);
                setPrizes({
                    grand: data.prizes_info?.grand_prize || '',
                    round: data.prizes_info?.round_prize || ''
                });

                // Initial Ranking (Remove Global, Default to first competition if available)
                const initialComp = data.competitions && data.competitions.length > 0 ? data.competitions[0].id : null;
                setActiveCompId(initialComp); // Set state logic

                const ranks = await DataService.getGroupRanking(data.id, initialComp);
                setRanking(ranks);

                // Fetch History
                const hist = await DataService.getGroupWinnersHistory(data.id);
                setHistory(hist);

                // Fetch Chat
                const msgs = await DataService.getGroupMessages(data.id);
                setMessages(msgs);

                // Fetch Active Slips for Play
                let active = await DataService.getGroupActiveSlips(data.id);
                if (active.length === 0) {
                    const all = await DataService.getSlips();
                    active = all.filter(s => s.status === 'open');
                }
                setActiveSlips(active);

                // If Admin, check pending
                if (data.owner_user_id === user.id) {
                    const pending = await DataService.getPendingMembers(data.id);
                    setPendingMembers(pending);
                }

                // Load slips for Day Filter (Only for active competitions)
                const allSlips = await DataService.getSlips();
                setAvailableSlips(allSlips);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGroup();
    }, [params.id, user]);

    // Scroll to bottom on new messages
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle Ranking Filters
    const handleFilterChange = async (compId: string | null, slipId: string | null) => {
        setActiveCompId(compId);
        setActiveSlipId(slipId);

        if (!group) return;
        try {
            const { DataService } = await import('@/services/dataService');
            const ranks = await DataService.getGroupRanking(group.id, compId || undefined, slipId || undefined);
            setRanking(ranks);
        } catch (e) {
            console.error(e);
        }
    };

    // Chat Actions
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !group || !user) return;

        const { DataService } = await import('@/services/dataService');
        const success = await DataService.sendGroupMessage(group.id, user.id, newMessage);

        if (success) {
            setNewMessage('');
            // Refresh messages (Simple polling for now, or just optimistic update)
            const msgs = await DataService.getGroupMessages(group.id);
            setMessages(msgs);
        }
    };

    // Admin Actions
    const handleApprove = async (userId: string) => {
        if (!group) return;
        const { DataService } = await import('@/services/dataService');
        await DataService.approveMember(group.id, userId);
        loadGroup(); // Refresh
    };

    const handleReject = async (userId: string) => {
        if (!group) return;
        if (!confirm('¿Estás seguro de que deseas eliminar a este usuario?')) return;
        const { DataService } = await import('@/services/dataService');
        await DataService.rejectMember(group.id, userId);
        loadGroup(); // Refresh
    };

    const handleSavePrizes = async () => {
        if (!group) return;
        const { DataService } = await import('@/services/dataService');
        await DataService.updateGroupPrizes(group.id, { grand_prize: prizes.grand, round_prize: prizes.round });
        setIsEditingPrizes(false);
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Cargando torneo...</div>;
    if (!group) return <div className="p-8 text-center text-slate-400">Torneo no encontrado.</div>;

    const isOwner = user?.id === group.owner_user_id;
    const lastWinner = history.length > 0 ? history[0] : null;

    return (
        <div className="container py-8 max-w-5xl">
            <Link href="/groups" className="flex items-center gap-2 text-muted hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={16} /> Volver a mis torneos
            </Link>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
                <div>
                    <div className="flex gap-2 mb-3">
                        <Badge variant={group.is_public ? 'success' : 'secondary'}>
                            {group.is_public ? 'TORNEO PÚBLICO' : 'TORNEO PRIVADO'}
                        </Badge>
                        {(competitions || []).map((c: any) => (
                            <span key={c.id} className="text-xs font-bold text-muted border border-slate-200 px-2 py-0.5 rounded bg-white shadow-sm">
                                {c.name}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-4xl font-bold font-display uppercase tracking-wide text-primary">{group.name}</h1>
                </div>

                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setIsQRModalOpen(true)} className="bg-white border-slate-200 text-primary hover:bg-slate-50">
                        <QrCode size={20} className="mr-2" /> Invitar
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">

                    {/* Active Slips (Play Section) */}
                    {activeSlips.length > 0 && (
                        <div>
                            <h2 className="text-sm font-bold text-primary mb-3 uppercase tracking-wide flex items-center gap-2">
                                <PlayCircle size={16} /> Próximas Fechas
                            </h2>
                            <div className="grid gap-3">
                                {activeSlips.map((slip: any) => (
                                    <div key={slip.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between relative overflow-hidden group hover:border-primary/50 hover:shadow-md transition-all">
                                        <div className="relative z-10">
                                            <div className="text-xs text-primary font-bold mb-0.5">{slip.tournament_name}</div>
                                            <div className="text-lg font-bold text-slate-800 mb-1">{slip.round_name}</div>
                                            <div className="flex items-center gap-1.5 text-xs text-muted">
                                                <Clock size={12} /> Cierra: {new Date(slip.close_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="relative z-10">
                                            <Link href={`/play/${slip.id}`}>
                                                <Button size="sm" className="font-bold shadow-lg shadow-green-500/20">
                                                    JUGAR AHORA
                                                </Button>
                                            </Link>
                                        </div>
                                        {/* Background Decoration */}
                                        <div className="absolute -right-6 -bottom-6 text-slate-100 rotate-12 group-hover:scale-110 transition-transform">
                                            <Calendar size={100} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Featured Cards: Prizes & Last Winner */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Prizes Card */}
                        {(prizes.grand || prizes.round || isOwner) && (
                            <Card className="p-4 bg-white border-slate-200 relative overflow-hidden shadow-sm">
                                <div className="absolute top-0 right-0 p-2 opacity-5"><Crown size={64} className="text-amber-500" /></div>
                                <div className="flex justify-between items-start mb-3 relative z-10">
                                    <h3 className="font-bold text-amber-500 flex items-center gap-2 text-sm uppercase tracking-wider">
                                        <Crown size={14} /> Premios
                                    </h3>
                                    {isOwner && (
                                        <button onClick={() => setIsEditingPrizes(!isEditingPrizes)} className="text-slate-400 hover:text-primary transition-colors">
                                            <Edit2 size={12} />
                                        </button>
                                    )}
                                </div>

                                {isEditingPrizes ? (
                                    <div className="space-y-2 relative z-10">
                                        <input type="text" placeholder="Premio Final" className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-primary" value={prizes.grand} onChange={e => setPrizes({ ...prizes, grand: e.target.value })} />
                                        <input type="text" placeholder="Premio Fecha" className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-primary" value={prizes.round} onChange={e => setPrizes({ ...prizes, round: e.target.value })} />
                                        <Button size="sm" onClick={handleSavePrizes} className="w-full text-xs py-1 h-auto">Guardar</Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3 relative z-10">
                                        <div>
                                            <div className="text-[10px] text-muted uppercase truncate">
                                                {competitions.length > 0
                                                    ? `Campeón de ${competitions[0].name}${competitions.length > 1 ? '...' : ''}`
                                                    : 'Campeón del Torneo'}
                                            </div>
                                            <div className="font-bold text-primary leading-tight text-lg">{prizes.grand || '---'}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-muted uppercase">Ganador de Fecha</div>
                                            <div className="font-bold text-primary leading-tight text-lg">{prizes.round || '---'}</div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* Last Winner Card */}
                        {lastWinner ? (
                            <Card className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white border-none shadow-lg shadow-amber-500/20 relative overflow-hidden flex flex-col justify-center">
                                <div className="absolute -right-4 -bottom-4 opacity-20"><Trophy size={100} /></div>
                                <div className="relative z-10">
                                    <div className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-1 flex items-center gap-1">
                                        <Medal size={12} /> Ganador Última Fecha
                                    </div>
                                    <h3 className="text-2xl font-black font-display mb-1">{lastWinner.winnerName}</h3>
                                    <div className="text-xs bg-black/20 inline-block px-2 py-1 rounded mb-2 backdrop-blur-sm border border-white/10">
                                        {lastWinner.points} Puntos
                                    </div>
                                    <div className="text-[10px] opacity-75 truncate border-t border-white/20 pt-2 mt-auto">
                                        {lastWinner.slipName}
                                    </div>
                                </div>
                            </Card>
                        ) : (
                            <Card className="p-4 bg-slate-50 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
                                Aún no hay ganadores registrados.
                            </Card>
                        )}
                    </div>

                    {/* Ranking Section */}
                    <div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                                <Trophy className="text-primary" size={20} /> Posiciones
                            </h2>

                            {/* Filters */}
                            <div className="flex gap-2">
                                <select
                                    className="bg-white border border-slate-200 text-primary text-sm rounded px-3 py-1.5 outline-none focus:border-primary shadow-sm"
                                    onChange={(e) => handleFilterChange(e.target.value || null, null)}
                                    value={activeCompId || ''}
                                >
                                    {competitions.length === 0 && <option value="">Global</option>}
                                    {competitions.map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>

                                <select
                                    className="bg-white border border-slate-200 text-primary text-sm rounded px-3 py-1.5 outline-none focus:border-primary shadow-sm"
                                    onChange={(e) => handleFilterChange(activeCompId, e.target.value || null)}
                                    value={activeSlipId || ''}
                                >
                                    <option value="">Tabla General</option>
                                    {availableSlips.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.tournament_name} - {s.round_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Ranking List */}
                        <div className="space-y-2">
                            {ranking.length === 0 ? (
                                <div className="p-8 text-center text-muted border border-dashed border-slate-200 rounded-xl bg-slate-50">
                                    No hay datos para estos filtros.
                                </div>
                            ) : ranking.map((entry, index) => {
                                const isMe = user && entry.userId === user.id;
                                const isWinner = activeSlipId && index === 0;

                                return (
                                    <div key={entry.userId} className={`flex items-center gap-4 p-3 rounded-xl border relative overflow-hidden transition-all shadow-sm
                                        ${isMe ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}
                                        ${isWinner ? 'border-amber-300 ring-1 ring-amber-300 bg-amber-50' : ''}
                                    `}>
                                        <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-lg ${index === 0 ? 'bg-amber-100 text-amber-600' :
                                            index === 1 ? 'bg-slate-100 text-slate-500' :
                                                index === 2 ? 'bg-orange-100 text-orange-600' : 'text-slate-400'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden relative border border-slate-100">
                                            {entry.avatarUrl ? (
                                                <img src={entry.avatarUrl} alt={entry.userName} className="object-cover w-full h-full" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-bold uppercase">{entry.userName?.substring(0, 2)}</div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold flex items-center gap-2 text-primary">
                                                {entry.userName}
                                                {entry.userId === group.owner_user_id && <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-200 font-bold">ADMIN</span>}
                                                {isWinner && <Crown size={14} className="text-amber-500 fill-amber-500" />}
                                            </div>
                                            {isWinner && <div className="text-xs text-amber-600 font-bold">¡GANADOR DE LA FECHA!</div>}
                                        </div>
                                        <div className="ml-auto font-mono font-bold text-lg text-primary">
                                            {entry.points} pts
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Chat Section */}
                    <Card className="flex flex-col h-[400px] border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="p-3 border-b border-slate-100 font-bold flex items-center gap-2 bg-slate-50 text-primary">
                            <MessageCircle size={16} className="text-action" /> Chat del Torneo
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-[url('/chat-pattern-light.png')] bg-slate-50">
                            {messages.length === 0 && <div className="text-xs text-muted text-center py-4">¡Sé el primero en escribir!</div>}
                            {messages.map((msg: any) => {
                                const isMine = user && msg.userId === user.id;
                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-end gap-2 max-w-[90%]">
                                            {!isMine && (
                                                <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-100">
                                                    {msg.avatarUrl ? <img src={msg.avatarUrl} className="w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 font-bold">{msg.userName?.substring(0, 1)}</div>}
                                                </div>
                                            )}
                                            <div className={`p-2.5 rounded-2xl text-sm break-words shadow-sm border ${isMine ? 'bg-emerald-50 border-emerald-100 text-slate-800 rounded-tr-none' : 'bg-white border-slate-100 text-slate-700 rounded-tl-none'}`}>
                                                {!isMine && <div className="text-[10px] font-bold text-primary mb-0.5">{msg.userName}</div>}
                                                {msg.content}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                )
                            })}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-100 bg-white flex gap-2">
                            <input
                                type="text"
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm outline-none focus:border-action focus:ring-1 focus:ring-action/20 text-primary placeholder:text-slate-400 transition-all"
                                placeholder="Escribe un mensaje..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                            />
                            <Button type="submit" size="sm" className="rounded-full w-9 h-9 p-0 flex items-center justify-center shadow-md bg-action hover:bg-green-600" disabled={!newMessage.trim()}>
                                <Send size={16} className="ml-0.5" />
                            </Button>
                        </form>
                    </Card>

                    {/* Admin Pending Requests */}
                    {isOwner && pendingMembers.length > 0 && (
                        <Card className="p-5 border-red-200 bg-red-50 shadow-sm">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-red-600">
                                <Users size={18} /> Solicitudes ({pendingMembers.length})
                            </h3>
                            <div className="space-y-3">
                                {pendingMembers.map(m => (
                                    <div key={m.userId} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-primary font-medium">
                                            <div className="w-8 h-8 rounded-full bg-white border border-red-100 overflow-hidden">
                                                <img src={m.avatarUrl} className="w-full h-full" />
                                            </div>
                                            <span>{m.name}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleApprove(m.userId)} className="p-1.5 bg-white border border-green-200 text-green-600 rounded hover:bg-green-500 hover:text-white transition-colors shadow-sm"><Check size={14} /></button>
                                            <button onClick={() => handleReject(m.userId)} className="p-1.5 bg-white border border-red-200 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors shadow-sm"><X size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Members List */}
                    <Card className="p-5 bg-white border-slate-200 shadow-sm">
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-primary">
                            <Users size={18} /> Miembros ({members.length})
                        </h3>
                        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {members.map(m => (
                                <div key={m.userId} className="flex items-center justify-between text-sm text-slate-600 group p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden border border-slate-200">
                                            {m.avatarUrl ? <img src={m.avatarUrl} className="w-full h-full" /> : m.name.substring(0, 1)}
                                        </div>
                                        <span className="font-medium text-primary">{m.name}</span>
                                        {m.userId === group.owner_user_id && <Badge variant="warning" className="text-[10px] px-1.5 py-0 h-auto">ADMIN</Badge>}
                                    </div>
                                    {isOwner && m.userId !== user?.id && (
                                        <button
                                            onClick={() => handleReject(m.userId)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 bg-white border border-slate-200 rounded text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                                            title="Eliminar del torneo"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Winners History (List) */}
                    {history.length > 0 && (
                        <Card className="p-5 border-amber-200 bg-amber-50/50 shadow-sm">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-amber-600">
                                <Calendar size={18} /> Historial
                            </h3>
                            <div className="space-y-4">
                                {history.map((h, i) => (
                                    <div key={i} className="flex items-center gap-3 pb-3 border-b border-amber-100 last:border-0 last:pb-0">
                                        <div className="w-8 h-8 rounded-full bg-white border border-amber-200 flex items-center justify-center shrink-0 text-xs font-bold text-amber-500 shadow-sm">
                                            #{i + 1}
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">{h.slipName}</div>
                                            <div className="font-bold text-sm flex items-center gap-1.5 text-primary">
                                                {h.winnerName}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* QR Modal */}
            <Dialog open={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
                        <Dialog.Title className="text-xl font-bold mb-2 text-primary">Invitar Amigos</Dialog.Title>
                        <p className="text-muted text-sm mb-6">Escanea el código para unirse al torneo</p>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 inline-block mb-6 shadow-inner">
                            <QRCode value={group.invite_code} size={180} />
                        </div>

                        <div className="mb-6">
                            <div className="text-xs text-muted uppercase tracking-widest mb-1">Código de Acceso</div>
                            <div className="text-3xl font-mono font-bold tracking-[0.2em] text-primary bg-slate-50 py-3 rounded-lg border border-slate-100">
                                {group.invite_code}
                            </div>
                        </div>

                        <Button className="w-full" variant="secondary" onClick={() => setIsQRModalOpen(false)}>
                            Cerrar
                        </Button>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    );
}
