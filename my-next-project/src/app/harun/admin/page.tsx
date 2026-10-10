'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus, Edit2, Trash2, ExternalLink, Eye, EyeOff, LogOut,
  ArrowLeft, CheckCircle2, AlertCircle, Upload, ArrowUp, ArrowDown,
  Sparkles, User, Wrench, FolderGit2, Save, X,
} from 'lucide-react';
import { devProjectsApi, type DevProject } from '@/lib/devProjectsApi';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AboutContent {
  headline: string;
  subheadline: string;
  bio_short: string;
  bio_long: string;
  available: boolean;
  pillar1_title: string; pillar1_desc: string;
  pillar2_title: string; pillar2_desc: string;
  pillar3_title: string; pillar3_desc: string;
}

interface Service {
  number: string;
  title: string;
  description: string;
  tags: string;
}

type Tab = 'projects' | 'about' | 'services';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`mb-6 p-4 rounded-xl text-xs flex items-center gap-2.5 ${
      type === 'success'
        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
        : 'bg-red-500/10 border border-red-500/30 text-red-300'
    }`}>
      {type === 'success'
        ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span>{msg}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-white/60 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:border-purple-500 focus:outline-none text-sm text-white";
const textareaCls = `${inputCls} resize-none`;

// ─── DEFAULT ABOUT CONTENT (client-side fallback) ─────────────────────────────
const DEFAULT_ABOUT: AboutContent = {
  headline: "HI, I'M HARUN",
  subheadline: 'SOFTWARE DEVELOPER & ARCHITECT',
  bio_short: 'I build modern web applications, digital experiences, and practical software solutions with clean architecture and refined interactions.',
  bio_long: 'I am a software engineer dedicated to building modern web applications, scalable backend systems, and responsive user interfaces. I bridge thoughtful design with resilient architecture to deliver software that feels fast, intuitive, and built to last.',
  available: true,
  pillar1_title: 'FULL-STACK FOCUS',
  pillar1_desc: 'Seamlessly connecting reactive React / Next.js frontends with robust Python, Flask, and database backends.',
  pillar2_title: 'ARCHITECTURE & SCALE',
  pillar2_desc: 'Designing clean relational schemas, secure auth flows, and resilient API endpoints engineered for production reliability.',
  pillar3_title: 'MOTION & UX',
  pillar3_desc: 'Crafting fluid micro-animations, accessible interfaces, and refined interactions inspired by editorial design.',
};

const DEFAULT_SERVICES: Service[] = [
  { number: '01', title: 'FULL-STACK WEB DEVELOPMENT', description: 'End-to-end responsive web applications built with Next.js, React, TypeScript, and modern ecosystem tooling.', tags: 'Next.js, React, TypeScript, Tailwind CSS' },
  { number: '02', title: 'WEB APPLICATION ARCHITECTURE', description: 'Modern SPA and Server-Rendered solutions with scalable state management and seamless routing.', tags: 'App Router, State Management, Component Architecture' },
  { number: '03', title: 'BACKEND & API ENGINEERING', description: 'Robust RESTful API design, authentication systems, and service layers with Python and Flask.', tags: 'Python, Flask, REST APIs, JWT Security' },
  { number: '04', title: 'DATABASE & DATA MODELING', description: 'Relational schema design, migrations, efficient queries, and data integrity using PostgreSQL and SQLAlchemy.', tags: 'PostgreSQL, SQLite, SQLAlchemy, Alembic' },
  { number: '05', title: 'UI / UX & INTERACTIVE MOTION', description: 'Editorial-grade typography, micro-interactions, responsive fluid layouts, and smooth animations.', tags: 'Framer Motion, Micro-interactions, Accessible Design' },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function HarunAdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('projects');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) { router.push('/harun/login'); return; }
    try {
      const user = JSON.parse(userStr);
      if (!user.is_admin) router.push('/harun/login');
    } catch { router.push('/harun/login'); }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/harun/login');
  };

  const flash = (msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') { setSuccessMsg(msg); setError(null); }
    else { setError(msg); setSuccessMsg(null); }
    setTimeout(() => { setSuccessMsg(null); setError(null); }, 5000);
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'projects', label: 'Projects', icon: <FolderGit2 className="w-4 h-4" /> },
    { id: 'about',    label: 'About Me', icon: <User className="w-4 h-4" /> },
    { id: 'services', label: 'Services', icon: <Wrench className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top Bar */}
      <header className="border-b border-white/10 bg-[#111111]/80 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/harun" className="p-2 rounded-full border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                PORTFOLIO ADMIN
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  HARUN
                </span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/harun" target="_blank" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors">
              View Live <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button onClick={handleLogout} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-mono text-white/60 hover:text-red-400 hover:border-red-400/30 transition-all">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tab Nav */}
      <div className="border-b border-white/10 bg-[#0d0d0d] sticky top-[65px] z-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 py-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-black'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {successMsg && <Toast msg={successMsg} type="success" />}
        {error && <Toast msg={error} type="error" />}

        {activeTab === 'projects' && <ProjectsTab flash={flash} />}
        {activeTab === 'about'    && <AboutTab    flash={flash} defaultData={DEFAULT_ABOUT} />}
        {activeTab === 'services' && <ServicesTab flash={flash} defaultData={DEFAULT_SERVICES} />}
      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROJECTS TAB
// ══════════════════════════════════════════════════════════════════════════════
function ProjectsTab({ flash }: { flash: (msg: string, type?: 'success' | 'error') => void }) {
  const [projects, setProjects] = useState<DevProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<DevProject | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formExternalUrl, setFormExternalUrl] = useState('');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formThumbnailFile, setFormThumbnailFile] = useState<File | null>(null);
  const [formThumbnailPreview, setFormThumbnailPreview] = useState('');
  const [formTechnologies, setFormTechnologies] = useState('');
  const [formCategory, setFormCategory] = useState('Web Development');
  const [formYear, setFormYear] = useState('2026');
  const [formOrder, setFormOrder] = useState(0);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formPublished, setFormPublished] = useState(true);

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    setLoading(true);
    try { setProjects(await devProjectsApi.getAllAdmin()); }
    catch (e: any) { flash(e.message || 'Failed to load', 'error'); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditingProject(null);
    setFormTitle(''); setFormDescription(''); setFormExternalUrl('');
    setFormThumbnail('/project_mockup_preview.jpg');
    setFormThumbnailFile(null); setFormThumbnailPreview('/project_mockup_preview.jpg');
    setFormTechnologies('Next.js, React, TypeScript, Python');
    setFormCategory('Full-Stack Web App'); setFormYear(new Date().getFullYear().toString());
    setFormOrder(projects.length + 1); setFormFeatured(false); setFormPublished(true);
    setIsModalOpen(true);
  };

  const openEdit = (proj: DevProject) => {
    setEditingProject(proj);
    setFormTitle(proj.title); setFormDescription(proj.description);
    setFormExternalUrl(proj.external_url); setFormThumbnail(proj.thumbnail || '');
    setFormThumbnailFile(null); setFormThumbnailPreview(proj.thumbnail || '/project_mockup_preview.jpg');
    setFormTechnologies(proj.technologies || ''); setFormCategory(proj.category || 'Web Development');
    setFormYear(proj.year || ''); setFormOrder(proj.display_order);
    setFormFeatured(Boolean(proj.featured)); setFormPublished(proj.published !== false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDescription || !formExternalUrl) {
      flash('Please fill required fields.', 'error'); return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', formTitle); fd.append('description', formDescription);
      fd.append('external_url', formExternalUrl); fd.append('technologies', formTechnologies);
      fd.append('category', formCategory); fd.append('year', formYear);
      fd.append('display_order', formOrder.toString());
      fd.append('featured', formFeatured ? 'true' : 'false');
      fd.append('published', formPublished ? 'true' : 'false');
      if (formThumbnailFile) fd.append('thumbnail_file', formThumbnailFile);
      else if (formThumbnail) fd.append('thumbnail', formThumbnail);

      if (editingProject) {
        await devProjectsApi.update(editingProject.id, fd);
        flash('Project updated!');
      } else {
        await devProjectsApi.create(fd);
        flash('Project added!');
      }
      setIsModalOpen(false);
      await loadProjects();
    } catch (e: any) { flash(e.message || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await devProjectsApi.delete(id);
      setDeleteConfirmId(null);
      flash('Project deleted.');
      await loadProjects();
    } catch (e: any) { flash(e.message || 'Delete failed', 'error'); }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= projects.length) return;
    const updated = [...projects];
    [updated[index], updated[newIdx]] = [updated[newIdx], updated[index]];
    const orders = updated.map((p, i) => ({ id: p.id, display_order: i + 1 }));
    setProjects(updated.map((p, i) => ({ ...p, display_order: i + 1 })));
    try { await devProjectsApi.reorder(orders); }
    catch { await loadProjects(); }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Project Showcase</h2>
          <p className="text-xs font-mono text-white/50 mt-1">Add, edit, reorder, or publish/unpublish projects.</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:scale-105">
          <Plus className="w-4 h-4" /> ADD PROJECT
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="py-20 text-center bg-[#121212] border border-white/10 rounded-2xl">
          <Sparkles className="w-8 h-8 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Projects Yet</h3>
          <button onClick={openAdd} className="mt-4 px-6 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider">Add First Project</button>
        </div>
      ) : (
        <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-mono uppercase tracking-widest text-white/50">
                  <th className="py-4 px-6">Order</th>
                  <th className="py-4 px-6">Project</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">URL</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projects.map((proj, idx) => (
                  <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-mono text-xs">
                        <span className="w-6 text-center text-white/60 font-bold">{proj.display_order || idx + 1}</span>
                        <div className="flex flex-col">
                          <button onClick={() => moveOrder(idx, 'up')} disabled={idx === 0} className="text-white/30 hover:text-white disabled:opacity-20 p-0.5"><ArrowUp className="w-3 h-3" /></button>
                          <button onClick={() => moveOrder(idx, 'down')} disabled={idx === projects.length - 1} className="text-white/30 hover:text-white disabled:opacity-20 p-0.5"><ArrowDown className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                          <Image src={proj.thumbnail || '/project_mockup_preview.jpg'} alt={proj.title} fill className="object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            {proj.title}
                            {proj.featured && <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">FEATURED</span>}
                          </div>
                          <div className="text-xs text-white/50 font-mono mt-0.5">{proj.category} {proj.year ? `• ${proj.year}` : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <button
                        onClick={() => devProjectsApi.togglePublish(proj.id).then(loadProjects)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                          proj.published !== false
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/30 hover:bg-neutral-500/20'
                        }`}
                      >
                        {proj.published !== false ? <><Eye className="w-3.5 h-3.5" />LIVE</> : <><EyeOff className="w-3.5 h-3.5" />DRAFT</>}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <a href={proj.external_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400/80 hover:text-cyan-300 hover:underline max-w-[200px] truncate">
                        <span className="truncate">{proj.external_url}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => openEdit(proj)} className="p-2 rounded-lg border border-white/10 hover:border-white/30 text-white/70 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteConfirmId(proj.id)} className="p-2 rounded-lg border border-red-500/20 hover:border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-[#161616] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Delete Project?</h3>
            <p className="text-xs text-white/60 mb-6">This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 rounded-full border border-white/10 text-xs font-mono text-white/70 hover:text-white">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-colors">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#141414] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <Field label="Project Title *">
                <input type="text" required value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Restaurant Management System" className={inputCls} />
              </Field>
              <Field label="Short Description *">
                <textarea rows={3} required value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Describe what the project does..." className={textareaCls} />
              </Field>
              <Field label="External Project URL *">
                <input type="url" required value={formExternalUrl} onChange={e => setFormExternalUrl(e.target.value)} placeholder="https://example.com/project" className={`${inputCls} font-mono`} />
              </Field>
              <Field label="Thumbnail Image">
                <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer text-xs font-mono text-white/70 hover:text-white transition-all">
                  <Upload className="w-4 h-4 text-purple-400" />
                  {formThumbnailFile ? formThumbnailFile.name : 'Choose Image File'}
                  <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if(f){ setFormThumbnailFile(f); setFormThumbnailPreview(URL.createObjectURL(f)); } }} className="hidden" />
                </label>
                {formThumbnailPreview && (
                  <div className="mt-2 relative w-24 h-16 rounded-lg overflow-hidden border border-white/20">
                    <Image src={formThumbnailPreview} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Technologies">
                  <input type="text" value={formTechnologies} onChange={e => setFormTechnologies(e.target.value)} placeholder="Next.js, Python, Flask" className={inputCls} />
                </Field>
                <Field label="Category">
                  <input type="text" value={formCategory} onChange={e => setFormCategory(e.target.value)} placeholder="Web Application" className={inputCls} />
                </Field>
                <Field label="Year">
                  <input type="text" value={formYear} onChange={e => setFormYear(e.target.value)} className={`${inputCls} font-mono`} />
                </Field>
                <Field label="Display Order">
                  <input type="number" value={formOrder} onChange={e => setFormOrder(parseInt(e.target.value)||0)} className={`${inputCls} font-mono`} />
                </Field>
              </div>
              <div className="flex items-center gap-6 pt-2">
                {[{label:'Featured Project', value:formFeatured, set:setFormFeatured},{label:'Published (Live)',value:formPublished,set:setFormPublished}].map(({label,value,set}) => (
                  <label key={label} className="flex items-center gap-2.5 cursor-pointer text-xs font-mono text-white/80">
                    <input type="checkbox" checked={value} onChange={e => set(e.target.checked)} className="rounded border-white/20 bg-white/10 text-purple-600 focus:ring-0 w-4 h-4" />
                    {label}
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-full border border-white/10 text-xs font-mono text-white/70 hover:text-white">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50 transition-all flex items-center gap-2">
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'SAVING...' : editingProject ? 'UPDATE' : 'SAVE PROJECT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ABOUT TAB — client-side only (persisted in localStorage)
// ══════════════════════════════════════════════════════════════════════════════
function AboutTab({ flash, defaultData }: { flash: (msg: string, type?: 'success' | 'error') => void; defaultData: AboutContent }) {
  const [form, setForm] = useState<AboutContent>(defaultData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('harun_about');
      if (saved) setForm(JSON.parse(saved));
    } catch {}
  }, []);

  const set = (key: keyof AboutContent, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Persist to localStorage (in production, POST to /api/portfolio/about)
      localStorage.setItem('harun_about', JSON.stringify(form));
      await new Promise(r => setTimeout(r, 600));
      flash('About content saved! (Reload portfolio to see changes)');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSave}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">About Me Content</h2>
          <p className="text-xs font-mono text-white/50 mt-1">Edit hero headline, bio text, and the 3 pillar cards.</p>
        </div>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50 hover:from-purple-500 hover:to-cyan-400 transition-all">
          <Save className="w-4 h-4" /> {saving ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Hero */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-white/50 mb-5">HERO SECTION</h3>
          <div className="space-y-4">
            <Field label="Headline (Large Text)">
              <input type="text" value={form.headline} onChange={e => set('headline', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Subheadline / Tagline">
              <input type="text" value={form.subheadline} onChange={e => set('subheadline', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Short Bio (Hero section)">
              <textarea rows={2} value={form.bio_short} onChange={e => set('bio_short', e.target.value)} className={textareaCls} />
            </Field>
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-mono text-white/80">
              <input type="checkbox" checked={form.available} onChange={e => set('available', e.target.checked)} className="rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-0 w-4 h-4" />
              Show &quot;Available for Projects&quot; badge
            </label>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-white/50 mb-5">ABOUT SECTION</h3>
          <Field label="Long Bio (About section)">
            <textarea rows={4} value={form.bio_long} onChange={e => set('bio_long', e.target.value)} className={textareaCls} />
          </Field>
        </div>

        {/* Pillars */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-white/50 mb-5">3 PILLAR CARDS</h3>
          <div className="space-y-6">
            {([1,2,3] as const).map((n) => (
              <div key={n} className="border border-white/10 rounded-xl p-4 space-y-3">
                <p className="text-xs font-mono text-white/40 font-bold">PILLAR 0{n}</p>
                <Field label="Title">
                  <input type="text" value={(form as any)[`pillar${n}_title`]} onChange={e => set(`pillar${n}_title` as any, e.target.value)} className={inputCls} />
                </Field>
                <Field label="Description">
                  <textarea rows={2} value={(form as any)[`pillar${n}_desc`]} onChange={e => set(`pillar${n}_desc` as any, e.target.value)} className={textareaCls} />
                </Field>
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SERVICES TAB — client-side only (localStorage)
// ══════════════════════════════════════════════════════════════════════════════
function ServicesTab({ flash, defaultData }: { flash: (msg: string, type?: 'success' | 'error') => void; defaultData: Service[] }) {
  const [services, setServices] = useState<Service[]>(defaultData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('harun_services');
      if (saved) setServices(JSON.parse(saved));
    } catch {}
  }, []);

  const updateService = (idx: number, key: keyof Service, value: string) => {
    setServices(prev => prev.map((s, i) => i === idx ? { ...s, [key]: value } : s));
  };

  const addService = () => {
    const num = String(services.length + 1).padStart(2, '0');
    setServices(prev => [...prev, { number: num, title: 'NEW SERVICE', description: '', tags: '' }]);
  };

  const removeService = (idx: number) => {
    setServices(prev => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, number: String(i + 1).padStart(2, '0') })));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      localStorage.setItem('harun_services', JSON.stringify(services));
      await new Promise(r => setTimeout(r, 600));
      flash('Services saved! (Reload portfolio to see changes)');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSave}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Services / Skills</h2>
          <p className="text-xs font-mono text-white/50 mt-1">Edit, add, or remove service rows shown on the portfolio.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={addService} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 transition-all">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50 hover:from-purple-500 hover:to-cyan-400 transition-all">
            <Save className="w-4 h-4" /> {saving ? 'SAVING...' : 'SAVE'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {services.map((svc, idx) => (
          <div key={idx} className="bg-[#121212] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-black font-mono text-white/30">{svc.number}</span>
              <button type="button" onClick={() => removeService(idx)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-3">
              <Field label="Service Title">
                <input type="text" value={svc.title} onChange={e => updateService(idx, 'title', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Description">
                <textarea rows={2} value={svc.description} onChange={e => updateService(idx, 'description', e.target.value)} className={textareaCls} />
              </Field>
              <Field label="Tags (comma separated)">
                <input type="text" value={svc.tags} onChange={e => updateService(idx, 'tags', e.target.value)} placeholder="Next.js, Python, Flask" className={inputCls} />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </form>
  );
}
