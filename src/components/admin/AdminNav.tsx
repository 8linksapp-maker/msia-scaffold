import React from 'react';
import {
    LayoutDashboard, FileText, Tag, Users, Info, Phone,
    Shield, Settings, LogOut, ChevronRight, ExternalLink, Navigation,
    Package, FileArchive,
} from 'lucide-react';

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    section: string;
}

const mainItems: NavItem[] = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, section: 'dashboard' },
    { label: 'Artigos', href: '/admin/posts', icon: FileText, section: 'posts' },
    { label: 'Categorias', href: '/admin/categories', icon: Tag, section: 'categories' },
    { label: 'Autores', href: '/admin/authors', icon: Users, section: 'authors' },
];

const pageItems: NavItem[] = [
    { label: 'Menu', href: '/admin/menu', icon: Navigation, section: 'menu' },
    { label: 'Sobre', href: '/admin/sobre', icon: Info, section: 'sobre' },
    { label: 'Contato', href: '/admin/contato', icon: Phone, section: 'contato' },
    { label: 'Privacidade & Termos', href: '/admin/legal', icon: Shield, section: 'legal' },
];

const pluginItems: NavItem[] = [
    { label: 'Plugins', href: '/admin/plugins', icon: Package, section: 'plugins' },
    { label: 'Google Tag', href: '/admin/google-tag', icon: Tag, section: 'google-tag' },
];

interface AdminNavProps {
    activeSection?: string;
    extraItems?: NavItem[];
}

export default function AdminNav({ activeSection = '', extraItems = [] }: AdminNavProps) {
    const allMainItems = [...mainItems, ...extraItems];

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-surface border-r border-border flex flex-col z-50" style={{ boxShadow: '1px 0 0 0 rgb(224 218 206)' }}>
            {/* Logo */}
            <div className="h-16 flex items-center px-5 border-b border-border">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-primary rounded flex items-center justify-center shrink-0">
                        <LayoutDashboard className="w-3.5 h-3.5 text-surface" />
                    </div>
                    <span className="font-semibold text-ink text-sm">Admin CMS</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
                {/* Principal */}
                <div className="mb-5">
                    <p className="text-[10px] font-bold text-ink-faint uppercase tracking-widest px-3 mb-1.5">Principal</p>
                    {allMainItems.map(item => (
                        <NavLink key={item.href} item={item} active={activeSection === item.section} />
                    ))}
                </div>

                {/* Páginas */}
                <div className="mb-5">
                    <p className="text-[10px] font-bold text-ink-faint uppercase tracking-widest px-3 mb-1.5">Páginas</p>
                    {pageItems.map(item => (
                        <NavLink key={item.href} item={item} active={activeSection === item.section} />
                    ))}
                </div>

                {/* Plugins */}
                <div className="mb-5">
                    <p className="text-[10px] font-bold text-ink-faint uppercase tracking-widest px-3 mb-1.5">Plugins</p>
                    {pluginItems.map(item => (
                        <NavLink key={item.href} item={item} active={activeSection === item.section} />
                    ))}
                </div>

                {/* Sistema */}
                <div>
                    <p className="text-[10px] font-bold text-ink-faint uppercase tracking-widest px-3 mb-1.5">Sistema</p>
                    <NavLink item={{ label: 'Configurações', href: '/admin/config', icon: Settings, section: 'config' }} active={activeSection === 'config'} />
                    <NavLink item={{ label: 'Backup', href: '/admin/backup', icon: FileArchive, section: 'backup' }} active={activeSection === 'backup'} />
                </div>
            </nav>

            {/* Ver site + Logout */}
            <div className="p-3 border-t border-border space-y-0.5">
                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-ink-muted hover:text-primary hover:bg-primary-soft transition-colors group"
                >
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium">Ver site</span>
                </a>
                <a
                    href="/api/admin/logout"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-ink-muted hover:text-red-700 hover:bg-red-50 transition-colors group"
                >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium">Sair</span>
                </a>
            </div>
        </aside>
    );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
    const Icon = item.icon;
    return (
        <a
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded mb-0.5 transition-colors group ${
                active
                    ? 'bg-primary-soft text-primary'
                    : 'text-ink-muted hover:text-ink hover:bg-elev'
            }`}
        >
            <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-primary' : 'text-ink-faint group-hover:text-ink-muted'}`} />
            <span className={`text-sm flex-1 ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
            {active && <ChevronRight className="w-3 h-3 text-primary/60" />}
        </a>
    );
}
