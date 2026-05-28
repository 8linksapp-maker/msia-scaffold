import React, { useState, useEffect } from 'react';
import { Loader2, FileText, CheckCircle, FileEdit, Users } from 'lucide-react';
import { githubApi } from '../../lib/adminApi';

export default function CmsDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalPosts: 0, publishedPosts: 0, draftPosts: 0, totalAuthors: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                let tPosts = 0, pubPosts = 0, drfPosts = 0;
                try {
                    const postData = await githubApi('list', 'src/content/blog');
                    if (Array.isArray(postData.data)) {
                        const mds = postData.data.filter((f: any) => f.name.endsWith('.md'));
                        tPosts = mds.length;
                        await Promise.all(mds.map(async (f: any) => {
                            try {
                                const fileData = await githubApi('read', f.path);
                                const text = fileData.content;
                                const draftMatch = text.match(/draft:\s*(true|false)/i);
                                if (draftMatch && draftMatch[1].toLowerCase() === 'true') drfPosts++;
                                else pubPosts++;
                            } catch { pubPosts++; }
                        }));
                    }
                } catch { /* ignora */ }

                let tAuthors = 0;
                try {
                    const data = await githubApi('read', 'src/data/authors.json');
                    const parsed = JSON.parse(data?.content || '{}');
                    tAuthors = Array.isArray(parsed) ? parsed.length : 0;
                } catch { /* ignora */ }

                setStats({ totalPosts: tPosts, publishedPosts: pubPosts, draftPosts: drfPosts, totalAuthors: tAuthors });
            } catch (e) {
                console.error('Erro ao puxar stats:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statItems = [
        { label: 'Total de artigos', value: stats.totalPosts, icon: FileText },
        { label: 'Publicados', value: stats.publishedPosts, icon: CheckCircle },
        { label: 'Rascunhos', value: stats.draftPosts, icon: FileEdit },
        { label: 'Equipe', value: stats.totalAuthors, icon: Users },
    ];

    return (
        <div>
            <p className="text-[10px] font-bold text-ink-faint uppercase tracking-widest mb-3">Estatísticas</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {statItems.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-surface rounded-md border border-border p-5 flex flex-col gap-3" style={{ boxShadow: '0 1px 2px rgba(80,40,20,0.04)' }}>
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-ink-faint">{label}</p>
                            <Icon className="w-4 h-4 text-primary/60 shrink-0" />
                        </div>
                        <p className="text-3xl font-bold text-ink leading-none tabular-nums">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin text-border mt-1" /> : value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                    { label: 'Novo Artigo', href: '/admin/posts/new', desc: 'Escrever e publicar um novo post', primary: true },
                    { label: 'Ver Artigos', href: '/admin/posts', desc: 'Gerenciar todos os artigos', primary: false },
                    { label: 'Configurações', href: '/admin/config', desc: 'Nome do site, cores e fontes', primary: false },
                ].map(item => (
                    <a key={item.href} href={item.href}
                        className={`p-5 rounded-md border transition-colors ${
                            item.primary
                                ? 'bg-primary border-primary/80 text-surface hover:brightness-90'
                                : 'bg-surface border-border text-ink-muted hover:border-primary/40 hover:text-ink'
                        }`}
                        style={item.primary ? { boxShadow: '0 2px 8px rgba(80,40,20,0.14)' } : {}}
                    >
                        <p className={`font-semibold text-sm ${item.primary ? 'text-surface' : 'text-ink'}`}>{item.label}</p>
                        <p className={`text-xs mt-1 ${item.primary ? 'text-surface/75' : 'text-ink-faint'}`}>{item.desc}</p>
                    </a>
                ))}
            </div>
        </div>
    );
}
