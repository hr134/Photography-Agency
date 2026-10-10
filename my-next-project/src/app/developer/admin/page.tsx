'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, Edit2, Trash2, ExternalLink, Eye, EyeOff, LogOut,
  ArrowLeft, CheckCircle2, AlertCircle, Upload, ArrowUp, ArrowDown,
  Sparkles, User, Wrench, FolderGit2, Save, X, Phone, Mail, Globe,
  FileText, Download, Check, ShieldCheck, GraduationCap, MessageSquare
} from 'lucide-react';
import {
  devProjectsApi,
  type DevProject,
  type PortfolioContact,
  type PortfolioCV,
  type ContactMessageItem,
  DEFAULT_CONTACT_DATA,
  DEFAULT_CVS_DATA
} from '@/lib/devProjectsApi';
import { resolveImageUrl } from '@/lib/imageHelper';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AboutContent {
  headline: string;
  subheadline: string;
  avatar_badge?: string;
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

type Tab = 'projects' | 'about' | 'services' | 'contact' | 'cvs' | 'messages';

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

// ─── DEFAULT ABOUT CONTENT ─────────────────────────────────────────────────────
const DEFAULT_ABOUT: AboutContent = {
  headline: "HI, I'M HARUN",
  subheadline: 'SOFTWARE & SYSTEMS ENGINEER',
  avatar_badge: 'SOFT. ENGINEER',
  bio_short: 'Engineer with deep focus on systems architecture, full-stack software solutions, and engineering performance.',
  bio_long: 'I am an engineer dedicated to designing robust software systems, computational workflows, and scalable architectures. With a disciplined engineering background, I bridge foundational engineering principles with modern full-stack technologies to deliver software that is reliable, secure, and built for scale.',
  available: true,
  pillar1_title: 'ENGINEERING ARCHITECTURE',
  pillar1_desc: 'Applying core computer science & software engineering principles to design resilient, fault-tolerant platforms.',
  pillar2_title: 'SYSTEMS & SCALE',
  pillar2_desc: 'Designing clean relational schemas, secure auth flows, and resilient API endpoints engineered for production reliability.',
  pillar3_title: 'MOTION & INTERACTIVE UX',
  pillar3_desc: 'Crafting fluid GPU micro-animations, accessible interfaces, and refined interactions inspired by editorial design.',
};

const DEFAULT_SERVICES: Service[] = [
  { number: '01', title: 'FULL-STACK SYSTEMS ENGINEERING', description: 'End-to-end responsive web applications built with Next.js, React, TypeScript, and modern ecosystem tooling.', tags: 'Next.js, React, TypeScript, Tailwind CSS' },
  { number: '02', title: 'SOFTWARE ARCHITECTURE & API DESIGN', description: 'Robust RESTful API design, authentication systems, and service layers with Python and Flask.', tags: 'Python, Flask, REST APIs, JWT Security' },
  { number: '03', title: 'DATABASE & DATA MODELING', description: 'Relational schema design, migrations, efficient queries, and data integrity using PostgreSQL and SQLAlchemy.', tags: 'PostgreSQL, SQLite, SQLAlchemy, Alembic' },
  { number: '04', title: 'INTERACTIVE UI & 3D MOTION UX', description: 'Editorial-grade typography, 3D scroll-driven mechanics, and smooth GPU-accelerated micro-interactions.', tags: 'Framer Motion, 3D Perspective, Responsive UI' },
];

// ─── MAIN ADMIN COMPONENT ─────────────────────────────────────────────────────
export default function DeveloperAdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('projects');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) { router.push('/developer/login'); return; }
    try {
      const user = JSON.parse(userStr);
      if (!user.is_admin) router.push('/developer/login');
    } catch { router.push('/developer/login'); }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/developer/login');
  };

  const flash = (msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') { setSuccessMsg(msg); setError(null); }
    else { setError(msg); setSuccessMsg(null); }
    setTimeout(() => { setSuccessMsg(null); setError(null); }, 5000);
  };

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    devProjectsApi.getMessages().then((msgs) => {
      setUnreadCount(msgs.filter((m) => m.status === 'unread').length);
    }).catch(() => {});
  }, [activeTab]);

  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'projects', label: 'Projects', icon: <FolderGit2 className="w-4 h-4" /> },
    { id: 'about',    label: 'About Me', icon: <User className="w-4 h-4" /> },
    { id: 'services', label: 'Services', icon: <Wrench className="w-4 h-4" /> },
    { id: 'contact',  label: 'Contact Info', icon: <Phone className="w-4 h-4" /> },
    { id: 'cvs',      label: 'CV & Credentials', icon: <FileText className="w-4 h-4" /> },
    { id: 'messages', label: 'Inbox', icon: <Mail className="w-4 h-4" />, badge: unreadCount },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top Bar */}
      <header className="border-b border-white/10 bg-[#111111]/80 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/developer" className="p-2 rounded-full border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                PORTFOLIO ADMIN
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  HARUN RASHID (ENGINEER)
                </span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/developer" target="_blank" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors">
              View Live Portfolio <ExternalLink className="w-3.5 h-3.5" />
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
          <div className="flex gap-1 py-2 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-black shadow-lg'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.badge != null && tab.badge > 0 && (
                  <span className="ml-1 min-w-[18px] h-[18px] rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {successMsg && <Toast msg={successMsg} type="success" />}
        {error && <Toast msg={error} type="error" />}

        {activeTab === 'projects' && <ProjectsTab flash={flash} />}
        {activeTab === 'about'    && <AboutTab    flash={flash} defaultData={DEFAULT_ABOUT} />}
        {activeTab === 'services' && <ServicesTab flash={flash} defaultData={DEFAULT_SERVICES} />}
        {activeTab === 'contact'  && <ContactTab  flash={flash} />}
        {activeTab === 'cvs'      && <CVsTab      flash={flash} />}
        {activeTab === 'messages' && <MessagesTab flash={flash} onUnreadChange={setUnreadCount} />}
      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. PROJECTS TAB (with reliable Image upload & preview)
// ══════════════════════════════════════════════════════════════════════════════
function ProjectsTab({ flash }: { flash: (msg: string, type?: 'success' | 'error') => void }) {
  const [projects, setProjects] = useState<DevProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<DevProject | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formExternalUrl, setFormExternalUrl] = useState('');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formThumbnailFile, setFormThumbnailFile] = useState<File | null>(null);
  const [formThumbnailPreview, setFormThumbnailPreview] = useState('');
  const [formTechnologies, setFormTechnologies] = useState('');
  const [formCategory, setFormCategory] = useState('Full-Stack Engineering');
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
    setFormTechnologies('Next.js, Python, Flask, PostgreSQL');
    setFormCategory('Systems Engineering'); setFormYear(new Date().getFullYear().toString());
    setFormOrder(projects.length + 1); setFormFeatured(false); setFormPublished(true);
    setIsModalOpen(true);
  };

  const openEdit = (proj: DevProject) => {
    setEditingProject(proj);
    setFormTitle(proj.title); setFormDescription(proj.description);
    setFormExternalUrl(proj.external_url); setFormThumbnail(proj.thumbnail || '');
    setFormThumbnailFile(null); setFormThumbnailPreview(resolveImageUrl(proj.thumbnail));
    setFormTechnologies(proj.technologies || ''); setFormCategory(proj.category || 'Systems Engineering');
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
      let finalThumbnail = formThumbnail;

      // If user uploaded a new file, upload it first to get verified URL
      if (formThumbnailFile) {
        try {
          const uploadRes = await devProjectsApi.uploadFile(formThumbnailFile);
          if (uploadRes && uploadRes.url) {
            finalThumbnail = uploadRes.url;
          }
        } catch (uploadErr) {
          console.warn('Direct file upload fallback:', uploadErr);
        }
      }

      const fd = new FormData();
      fd.append('title', formTitle);
      fd.append('description', formDescription);
      fd.append('external_url', formExternalUrl);
      fd.append('technologies', formTechnologies);
      fd.append('category', formCategory);
      fd.append('year', formYear);
      fd.append('display_order', formOrder.toString());
      fd.append('featured', formFeatured ? 'true' : 'false');
      fd.append('published', formPublished ? 'true' : 'false');
      fd.append('thumbnail', finalThumbnail || '/project_mockup_preview.jpg');
      if (formThumbnailFile) {
        fd.append('thumbnail_file', formThumbnailFile);
      }

      if (editingProject) {
        await devProjectsApi.update(editingProject.id, fd);
        flash('Project updated successfully!');
      } else {
        await devProjectsApi.create(fd);
        flash('Project added successfully!');
      }
      setIsModalOpen(false);
      await loadProjects();
    } catch (e: any) {
      flash(e.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
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
          <h2 className="text-2xl font-bold tracking-tight text-white">Project Showcase (3D Animated)</h2>
          <p className="text-xs font-mono text-white/50 mt-1">Manage project cards, live links, and image showcase.</p>
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
                  <th className="py-4 px-6">Project Image &amp; Title</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Live URL</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projects.map((proj, idx) => {
                  const resolvedImg = resolveImageUrl(proj.thumbnail);
                  return (
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
                          <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                            {/* Native img tag ensures instant display without Next.js optimization failure */}
                            <img
                              src={resolvedImg}
                              alt={proj.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = '/project_mockup_preview.jpg';
                              }}
                            />
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#141414] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <Field label="Project Title *">
                <input type="text" required value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Distributed Cloud Architecture" className={inputCls} />
              </Field>
              <Field label="Short Description *">
                <textarea rows={3} required value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Describe the engineering design & functionality..." className={textareaCls} />
              </Field>
              <Field label="External Project URL *">
                <input type="url" required value={formExternalUrl} onChange={e => setFormExternalUrl(e.target.value)} placeholder="https://example.com/project" className={`${inputCls} font-mono`} />
              </Field>

              {/* Image Upload with Instant Preview */}
              <Field label="Project Thumbnail Image">
                <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer text-xs font-mono text-white/70 hover:text-white transition-all">
                  <Upload className="w-4 h-4 text-purple-400" />
                  {formThumbnailFile ? formThumbnailFile.name : 'Choose Image File (PNG, JPG, WEBP)'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setFormThumbnailFile(f);
                        setFormThumbnailPreview(URL.createObjectURL(f));
                      }
                    }}
                    className="hidden"
                  />
                </label>
                {formThumbnailPreview && (
                  <div className="mt-3 flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/10">
                    <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-white/20 bg-black flex-shrink-0">
                      <img
                        src={formThumbnailPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/project_mockup_preview.jpg';
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Image ready for preview &amp; save
                    </span>
                  </div>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Technologies (comma separated)">
                  <input type="text" value={formTechnologies} onChange={e => setFormTechnologies(e.target.value)} placeholder="Next.js, Python, Flask" className={inputCls} />
                </Field>
                <Field label="Category">
                  <input type="text" value={formCategory} onChange={e => setFormCategory(e.target.value)} placeholder="Systems Engineering" className={inputCls} />
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
// ══════════════════════════════════════════════════════════════════════════════
// 2. ABOUT TAB
// ══════════════════════════════════════════════════════════════════════════════
function AboutTab({ flash, defaultData }: { flash: (msg: string, type?: 'success' | 'error') => void; defaultData: AboutContent }) {
  const [form, setForm] = useState<AboutContent>(defaultData);
  const [avatarUrl, setAvatarUrl] = useState<string>('/harun_avatar.jpg');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('harun_about');
      if (saved) setForm(JSON.parse(saved));
      const localAvatar = localStorage.getItem('harun_avatar');
      if (localAvatar) setAvatarUrl(localAvatar);
    } catch {}

    devProjectsApi
      .getAbout()
      .then((data) => {
        if (data && data.headline) setForm(data);
      })
      .catch(() => {});

    devProjectsApi
      .getContactInfo()
      .then((c) => {
        if (c?.avatar_url) {
          setAvatarUrl(c.avatar_url);
          try {
            localStorage.setItem('harun_avatar', c.avatar_url);
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const set = (key: keyof AboutContent, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleAvatarFile = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const res = await devProjectsApi.uploadFile(file);
      if (res?.url) {
        const fullUrl = res.url;
        setAvatarUrl(fullUrl);
        try {
          localStorage.setItem('harun_avatar', fullUrl);
        } catch {}

        // Persist to backend contact info
        try {
          const currentContact = await devProjectsApi.getContactInfo();
          await devProjectsApi.updateContactInfo({ ...currentContact, avatar_url: fullUrl });
        } catch {}

        flash('Profile picture uploaded and updated successfully!');
      }
    } catch (err: any) {
      flash(err.message || 'Failed to upload profile picture', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await devProjectsApi.updateAbout(form);
      if (avatarUrl) {
        localStorage.setItem('harun_avatar', avatarUrl);
        try {
          const currentContact = await devProjectsApi.getContactInfo();
          await devProjectsApi.updateContactInfo({ ...currentContact, avatar_url: avatarUrl });
        } catch {}
      }
      flash('About content and profile picture saved successfully!');
    } catch (err: any) {
      flash(err.message || 'Failed to save about content', 'error');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSave}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">About Me &amp; Profile Settings</h2>
          <p className="text-xs font-mono text-white/50 mt-1">Change profile picture, headline, background bio, and engineering pillars.</p>
        </div>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50 hover:from-purple-500 hover:to-cyan-400 transition-all shadow-lg">
          <Save className="w-4 h-4" /> {saving ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Profile Picture / Avatar Editor */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-purple-400">
              PROFILE PICTURE / AVATAR
            </h3>
            <span className="text-xs font-mono text-white/40">Syncs across Hero &amp; About sections</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-28 h-32 sm:w-32 sm:h-36 rounded-2xl overflow-hidden border-2 border-white/20 bg-black flex-shrink-0 shadow-lg">
              <img
                src={resolveImageUrl(avatarUrl, '/harun_avatar.jpg')}
                alt="Profile Avatar"
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/harun_avatar.jpg';
                }}
              />
            </div>

            <div className="flex-1 w-full space-y-3">
              <label className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer text-xs font-mono text-white/80 hover:text-white transition-all">
                <Upload className="w-4 h-4 text-purple-400" />
                {uploadingAvatar ? 'UPLOADING...' : 'Upload New Profile Picture (PNG, JPG, WEBP)'}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingAvatar}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleAvatarFile(f);
                  }}
                  className="hidden"
                />
              </label>

              <Field label="Or Direct Avatar Image URL">
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAvatarUrl(val);
                    localStorage.setItem('harun_avatar', val);
                  }}
                  placeholder="/harun_avatar.jpg or https://..."
                  className={`${inputCls} font-mono text-xs`}
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-cyan-400 mb-5">HERO OVERVIEW</h3>
          <div className="space-y-4">
            <Field label="Headline">
              <input type="text" value={form.headline} onChange={e => set('headline', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Designation / Subheadline">
              <input type="text" value={form.subheadline} onChange={e => set('subheadline', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Avatar Floating Badge (Profile Picture Tag)">
              <input type="text" value={form.avatar_badge || ''} onChange={e => set('avatar_badge', e.target.value)} placeholder="SOFT. ENGINEER" className={inputCls} />
            </Field>
            <Field label="Short Bio">
              <textarea rows={2} value={form.bio_short} onChange={e => set('bio_short', e.target.value)} className={textareaCls} />
            </Field>
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-mono text-white/80">
              <input type="checkbox" checked={form.available} onChange={e => set('available', e.target.checked)} className="rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-0 w-4 h-4" />
              Show &quot;Available for Projects&quot; badge
            </label>
          </div>
        </div>

        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-purple-400 mb-5">DETAILED ENGINEERING BIO</h3>
          <Field label="Long Bio (About Section)">
            <textarea rows={4} value={form.bio_long} onChange={e => set('bio_long', e.target.value)} className={textareaCls} />
          </Field>
        </div>

        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-white/50 mb-5">3 ENGINEERING PILLARS</h3>
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
// 3. SERVICES TAB
// ══════════════════════════════════════════════════════════════════════════════
function ServicesTab({ flash, defaultData }: { flash: (msg: string, type?: 'success' | 'error') => void; defaultData: Service[] }) {
  const [services, setServices] = useState<Service[]>(defaultData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('harun_services');
      if (saved) setServices(JSON.parse(saved));
    } catch {}

    devProjectsApi
      .getServices()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setServices(data);
      })
      .catch(() => {});
  }, []);

  const updateService = (idx: number, key: keyof Service, value: string) => {
    setServices(prev => prev.map((s, i) => i === idx ? { ...s, [key]: value } : s));
  };

  const addService = () => {
    const num = String(services.length + 1).padStart(2, '0');
    setServices(prev => [...prev, { number: num, title: 'NEW ENGINEERING SERVICE', description: '', tags: '' }]);
  };

  const removeService = (idx: number) => {
    setServices(prev => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, number: String(i + 1).padStart(2, '0') })));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await devProjectsApi.updateServices(services);
      flash('Services saved successfully!');
    } catch (err: any) {
      flash(err.message || 'Failed to save services', 'error');
    } finally { setSaving(false); }
  };


  return (
    <form onSubmit={handleSave}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Services &amp; Specializations</h2>
          <p className="text-xs font-mono text-white/50 mt-1">Add, edit, or delete engineering services shown on portfolio.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={addService} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 transition-all">
            <Plus className="w-3.5 h-3.5" /> Add Row
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

// ══════════════════════════════════════════════════════════════════════════════
// 4. CONTACT SECTION TAB (Editable by admin, extra sections & socials)
// ══════════════════════════════════════════════════════════════════════════════
function ContactTab({ flash }: { flash: (msg: string, type?: 'success' | 'error') => void }) {
  const [contact, setContact] = useState<PortfolioContact>(DEFAULT_CONTACT_DATA);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    devProjectsApi.getContactInfo().then(setContact).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await devProjectsApi.updateContactInfo(contact);
      setContact(updated);
      flash('Contact settings and extra sections saved successfully!');
    } catch (err: any) {
      flash(err.message || 'Failed to save contact info', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Social Links management
  const addSocial = () => {
    const newSocial = {
      id: Date.now().toString(),
      platform: 'New Platform',
      label: 'Profile Link',
      url: 'https://',
    };
    setContact(prev => ({ ...prev, socials: [...(prev.socials || []), newSocial] }));
  };

  const updateSocial = (id: string, field: 'platform' | 'label' | 'url', val: string) => {
    setContact(prev => ({
      ...prev,
      socials: prev.socials.map(s => s.id === id ? { ...s, [field]: val } : s),
    }));
  };

  const removeSocial = (id: string) => {
    setContact(prev => ({ ...prev, socials: prev.socials.filter(s => s.id !== id) }));
  };

  // Custom Extra Contact Sections
  const addCustomContact = () => {
    const newItem = {
      id: Date.now().toString(),
      label: 'Category / Title',
      value: 'Information or username',
      link: '',
    };
    setContact(prev => ({
      ...prev,
      custom_contacts: [...(prev.custom_contacts || []), newItem],
    }));
  };

  const updateCustomContact = (id: string, field: 'label' | 'value' | 'link', val: string) => {
    setContact(prev => ({
      ...prev,
      custom_contacts: prev.custom_contacts.map(c => c.id === id ? { ...c, [field]: val } : c),
    }));
  };

  const removeCustomContact = (id: string) => {
    setContact(prev => ({
      ...prev,
      custom_contacts: prev.custom_contacts.filter(c => c.id !== id),
    }));
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Contact Section Editor</h2>
          <p className="text-xs font-mono text-white/50 mt-1">
            Configure direct contact channels, social networks, and extra credentials sections.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50 hover:from-purple-500 hover:to-cyan-400 transition-all shadow-lg"
        >
          <Save className="w-4 h-4" /> {saving ? 'SAVING...' : 'SAVE CONTACT SETTINGS'}
        </button>
      </div>

      {/* Primary Details */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-cyan-400 mb-5">PRIMARY CONTACT INFO</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Email Address">
            <input
              type="email"
              value={contact.email}
              onChange={e => setContact({ ...contact, email: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Phone Number">
            <input
              type="text"
              value={contact.phone}
              onChange={e => setContact({ ...contact, phone: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="WhatsApp Number (with country code)">
            <input
              type="text"
              value={contact.whatsapp || ''}
              onChange={e => setContact({ ...contact, whatsapp: e.target.value })}
              placeholder="+880 1700 000000"
              className={inputCls}
            />
          </Field>
          <Field label="Location / Working Mode">
            <input
              type="text"
              value={contact.location}
              onChange={e => setContact({ ...contact, location: e.target.value })}
              className={inputCls}
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Contact Intro Tagline">
            <textarea
              rows={2}
              value={contact.tagline || ''}
              onChange={e => setContact({ ...contact, tagline: e.target.value })}
              className={textareaCls}
            />
          </Field>
        </div>
      </div>

      {/* Extra Custom Sections */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-purple-400">EXTRA CONTACT SECTIONS &amp; CREDENTIALS</h3>
            <p className="text-xs font-mono text-white/50 mt-0.5">Showcase academic degree, institution, Telegram, calendar links, or custom details.</p>
          </div>
          <button
            type="button"
            onClick={addCustomContact}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 text-xs font-mono text-white/80 hover:text-white hover:bg-white/5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Section
          </button>
        </div>

        <div className="space-y-3">
          {contact.custom_contacts?.map(item => (
            <div key={item.id} className="p-4 bg-white/[0.02] border border-white/10 rounded-xl flex flex-col md:flex-row gap-3 items-center">
              <input
                type="text"
                placeholder="Label (e.g. Degree)"
                value={item.label}
                onChange={e => updateCustomContact(item.id, 'label', e.target.value)}
                className={`${inputCls} md:w-1/4`}
              />
              <input
                type="text"
                placeholder="Value (e.g. Systems & Software Engineer)"
                value={item.value}
                onChange={e => updateCustomContact(item.id, 'value', e.target.value)}
                className={`${inputCls} md:w-1/3`}
              />
              <input
                type="url"
                placeholder="Optional link (e.g. https://example.com)"
                value={item.link || ''}
                onChange={e => updateCustomContact(item.id, 'link', e.target.value)}
                className={`${inputCls} md:flex-1 font-mono`}
              />
              <button
                type="button"
                onClick={() => removeCustomContact(item.id)}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg border border-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Social Media Channels */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-emerald-400">SOCIAL MEDIA &amp; PROFILES</h3>
            <p className="text-xs font-mono text-white/50 mt-0.5">LinkedIn, GitHub, Twitter, Discord, YouTube, etc.</p>
          </div>
          <button
            type="button"
            onClick={addSocial}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 text-xs font-mono text-white/80 hover:text-white hover:bg-white/5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Social Link
          </button>
        </div>

        <div className="space-y-3">
          {contact.socials?.map(soc => (
            <div key={soc.id} className="p-4 bg-white/[0.02] border border-white/10 rounded-xl flex flex-col md:flex-row gap-3 items-center">
              <input
                type="text"
                placeholder="Platform (e.g. LinkedIn)"
                value={soc.platform}
                onChange={e => updateSocial(soc.id, 'platform', e.target.value)}
                className={`${inputCls} md:w-1/4`}
              />
              <input
                type="text"
                placeholder="Label to show (e.g. linkedin.com/in/harun)"
                value={soc.label}
                onChange={e => updateSocial(soc.id, 'label', e.target.value)}
                className={`${inputCls} md:w-1/3`}
              />
              <input
                type="url"
                placeholder="Full URL (https://...)"
                value={soc.url}
                onChange={e => updateSocial(soc.id, 'url', e.target.value)}
                className={`${inputCls} md:flex-1 font-mono`}
              />
              <button
                type="button"
                onClick={() => removeSocial(soc.id)}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg border border-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 5. CV / RESUME TAB (Upload PDF, manage multiple CVs)
// ══════════════════════════════════════════════════════════════════════════════
function CVsTab({ flash }: { flash: (msg: string, type?: 'success' | 'error') => void }) {
  const [cvs, setCvs] = useState<PortfolioCV[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New CV form
  const [cvTitle, setCvTitle] = useState('Systems Engineering CV');
  const [cvSubtitle, setCvSubtitle] = useState('Comprehensive systems engineering, technical achievements & credentials');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUrl, setCvUrl] = useState('');
  const [cvIsPrimary, setCvIsPrimary] = useState(true);

  useEffect(() => {
    loadCVs();
  }, []);

  const loadCVs = async () => {
    setLoading(true);
    try {
      const data = await devProjectsApi.getCVs();
      setCvs(data);
    } catch {
      setCvs(DEFAULT_CVS_DATA);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvTitle) { flash('CV title is required', 'error'); return; }
    if (!cvFile && !cvUrl) { flash('Please upload a PDF file or provide a URL', 'error'); return; }

    setUploading(true);
    try {
      let finalUrl = cvUrl;
      let filename = 'Engineering_CV.pdf';
      let fileSize = '250 KB';

      if (cvFile) {
        filename = cvFile.name;
        try {
          const res = await devProjectsApi.uploadFile(cvFile);
          if (res && res.url) {
            finalUrl = res.url;
            if (res.size) fileSize = res.size;
          } else {
            throw new Error('Upload returned no URL');
          }
        } catch (uploadErr: any) {
          flash(uploadErr.message || 'Failed to upload PDF file to server. Please try again.', 'error');
          setUploading(false);
          return;
        }
      }


      const newCV: PortfolioCV = {
        id: `cv_${Date.now()}`,
        title: cvTitle,
        subtitle: cvSubtitle,
        file_url: finalUrl,
        filename,
        file_size: fileSize,
        uploaded_at: new Date().getFullYear().toString(),
        is_primary: cvIsPrimary,
        published: true,
      };

      const updatedList = await devProjectsApi.saveCV(newCV);
      setCvs(updatedList);
      setIsModalOpen(false);
      setCvFile(null);
      setCvUrl('');
      flash('CV added successfully! Visitors can now view & download it.');
    } catch (err: any) {
      flash(err.message || 'Failed to save CV', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const updated = await devProjectsApi.deleteCV(id);
      setCvs(updated);
      flash('CV deleted.');
    } catch (err: any) {
      flash(err.message || 'Failed to delete CV', 'error');
    }
  };

  const handleTogglePrimary = async (id: string) => {
    try {
      const updated = await devProjectsApi.togglePrimaryCV(id);
      setCvs(updated);
      flash('Primary CV updated.');
    } catch (err: any) {
      flash(err.message || 'Failed to toggle primary', 'error');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Curriculum Vitae &amp; Credentials
            <GraduationCap className="w-5 h-5 text-cyan-400" />
          </h2>
          <p className="text-xs font-mono text-white/50 mt-1">
            Upload PDF resumes/CVs. You can upload multiple CVs (e.g. Systems Engineering, Specialized CV, etc.).
          </p>
        </div>
        <button
          onClick={() => {
            setCvTitle('Systems Engineering Resume');
            setCvSubtitle('Specialized in systems engineering, backend platforms & architecture');
            setCvFile(null);
            setCvUrl('');
            setCvIsPrimary(cvs.length === 0);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:scale-105"
        >
          <Plus className="w-4 h-4" /> UPLOAD NEW CV (PDF)
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : cvs.length === 0 ? (
        <div className="py-20 text-center bg-[#121212] border border-white/10 rounded-2xl p-8">
          <FileText className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No CVs Uploaded Yet</h3>
          <p className="text-xs text-white/50 font-mono mb-4">Upload your PDF CV so employers and clients can download it directly.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider"
          >
            Upload First CV
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cvs.map(cv => {
            const resolvedFile = resolveImageUrl(cv.file_url);
            return (
              <div key={cv.id} className="p-6 bg-[#121212] border border-white/10 rounded-2xl flex flex-col justify-between shadow-xl relative group">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 uppercase">
                      <FileText className="w-4 h-4 text-purple-400" />
                      PDF {cv.file_size ? `• ${cv.file_size}` : ''}
                    </span>
                    {cv.is_primary ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                        <Check className="w-3 h-3" /> PRIMARY CV
                      </span>
                    ) : (
                      <button
                        onClick={() => handleTogglePrimary(cv.id)}
                        className="text-[10px] font-mono text-white/40 hover:text-white px-2 py-0.5 rounded border border-white/10 hover:border-white/30"
                      >
                        Set as Primary
                      </button>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{cv.title}</h3>
                  {cv.subtitle && <p className="text-xs text-white/60 mb-4">{cv.subtitle}</p>}
                  <p className="text-[11px] font-mono text-white/40 mb-6 truncate">{cv.filename}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <a
                      href={resolvedFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-mono font-bold hover:bg-neutral-200"
                    >
                      <Download className="w-3 h-3" /> Download
                    </a>
                    <a
                      href={resolvedFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/10 text-white/70 hover:text-white text-xs font-mono"
                    >
                      <ExternalLink className="w-3 h-3" /> Preview
                    </a>
                  </div>
                  <button
                    onClick={() => handleDelete(cv.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg border border-red-500/20"
                    title="Delete CV"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload CV Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#141414] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Upload CV (PDF)
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCV} className="space-y-4">
              <Field label="CV Title *">
                <input
                  type="text"
                  required
                  value={cvTitle}
                  onChange={e => setCvTitle(e.target.value)}
                  placeholder="e.g. Systems & Software Engineering CV"
                  className={inputCls}
                />
              </Field>

              <Field label="Subtitle / Brief Notes">
                <input
                  type="text"
                  value={cvSubtitle}
                  onChange={e => setCvSubtitle(e.target.value)}
                  placeholder="e.g. Comprehensive technical profile, coursework & achievements"
                  className={inputCls}
                />
              </Field>

              <Field label="Select PDF File *">
                <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer text-xs font-mono text-white/70 hover:text-white transition-all text-center">
                  <Upload className="w-6 h-6 text-purple-400 mb-1" />
                  <span className="font-bold text-white">
                    {cvFile ? cvFile.name : 'Click to choose PDF file'}
                  </span>
                  <span className="text-[10px] text-white/40">Accepts .pdf files</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) setCvFile(f);
                    }}
                    className="hidden"
                  />
                </label>
              </Field>

              <Field label="Or External PDF URL (Optional alternative)">
                <input
                  type="url"
                  value={cvUrl}
                  onChange={e => setCvUrl(e.target.value)}
                  placeholder="https://example.com/harun-cv.pdf"
                  className={`${inputCls} font-mono text-xs`}
                />
              </Field>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-mono text-white/80 pt-2">
                <input
                  type="checkbox"
                  checked={cvIsPrimary}
                  onChange={e => setCvIsPrimary(e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-purple-600 focus:ring-0 w-4 h-4"
                />
                Mark as Primary / Default CV
              </label>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-white/10 text-xs font-mono text-white/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  {uploading ? 'UPLOADING...' : 'SAVE & PUBLISH CV'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 6. MESSAGES (INBOX) TAB
// ══════════════════════════════════════════════════════════════════════════════
function MessagesTab({
  flash,
  onUnreadChange,
}: {
  flash: (msg: string, type?: 'success' | 'error') => void;
  onUnreadChange: (n: number) => void;
}) {
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await devProjectsApi.getMessages();
      setMessages(data);
      onUnreadChange(data.filter((m) => m.status === 'unread').length);
    } catch (e: any) {
      flash(e.message || 'Failed to load messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    try {
      await devProjectsApi.updateMessageStatus(id, 'read');
      setMessages((prev) => {
        const updated = prev.map((m) => m.id === id ? { ...m, status: 'read' as const } : m);
        onUnreadChange(updated.filter((m) => m.status === 'unread').length);
        return updated;
      });
    } catch {
      flash('Could not update status', 'error');
    }
  };

  const markUnread = async (id: number) => {
    try {
      await devProjectsApi.updateMessageStatus(id, 'unread');
      setMessages((prev) => {
        const updated = prev.map((m) => m.id === id ? { ...m, status: 'unread' as const } : m);
        onUnreadChange(updated.filter((m) => m.status === 'unread').length);
        return updated;
      });
    } catch {
      flash('Could not update status', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this message permanently?')) return;
    setDeleting(id);
    try {
      await devProjectsApi.deleteMessage(id);
      setMessages((prev) => {
        const updated = prev.filter((m) => m.id !== id);
        onUnreadChange(updated.filter((m) => m.status === 'unread').length);
        return updated;
      });
      flash('Message deleted', 'success');
    } catch {
      flash('Could not delete message', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const unread = messages.filter((m) => m.status === 'unread').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <Mail className="w-6 h-6 text-purple-400" />
            Inbox
            {unread > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-sm font-bold border border-purple-500/30">
                {unread} unread
              </span>
            )}
          </h2>
          <p className="text-white/40 text-sm mt-1 font-mono">
            Inquiries submitted via the portfolio contact form. Notifications sent to hr1349891@gmail.com.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-xs font-mono text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Empty state */}
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-2xl">
          <Mail className="w-14 h-14 text-white/10 mb-4" />
          <p className="text-white/30 font-mono text-sm uppercase tracking-widest">No messages yet</p>
          <p className="text-white/20 text-xs mt-2">Messages submitted via your contact form will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const isExpanded = expandedId === msg.id;
            const isUnread = msg.status === 'unread';
            return (
              <div
                key={msg.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isUnread
                    ? 'border-purple-500/30 bg-purple-500/5'
                    : 'border-white/5 bg-white/[0.02]'
                }`}
              >
                {/* Row header */}
                <div
                  className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => {
                    setExpandedId(isExpanded ? null : msg.id);
                    if (isUnread) markRead(msg.id);
                  }}
                >
                  {/* Status dot */}
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    isUnread ? 'bg-purple-400 shadow-lg shadow-purple-500/50' : 'bg-white/10'
                  }`} />

                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`font-bold text-sm ${
                        isUnread ? 'text-white' : 'text-white/70'
                      }`}>{msg.name}</span>
                      <span className="text-white/30 font-mono text-xs truncate">{msg.email}</span>
                      {msg.phone && (
                        <span className="text-white/30 font-mono text-xs">{msg.phone}</span>
                      )}
                    </div>
                    <p className="text-white/40 text-xs mt-0.5 font-mono truncate max-w-xl">
                      {msg.message.replace(/^\[HARUN RASHID - ENGINEER INQUIRY\]:\s*/i, '').slice(0, 120)}{msg.message.length > 120 ? '…' : ''}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <span className="text-white/30 font-mono text-xs">
                      {new Date(msg.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`mailto:${msg.email}?subject=Re: Your Inquiry`}
                      title="Reply"
                      className="p-2 rounded-lg text-white/30 hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                    {isUnread ? (
                      <button
                        onClick={() => markRead(msg.id)}
                        title="Mark as read"
                        className="p-2 rounded-lg text-white/30 hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => markUnread(msg.id)}
                        title="Mark as unread"
                        className="p-2 rounded-lg text-white/30 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(msg.id)}
                      disabled={deleting === msg.id}
                      title="Delete"
                      className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded message body */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-white/5">
                    <div className="pt-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 block mb-2">Message</label>
                        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap bg-white/5 rounded-xl p-4 border border-white/5">
                          {msg.message.replace(/^\[HARUN RASHID - ENGINEER INQUIRY\]:\s*/i, '')}
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 block mb-1">Email</label>
                          <a href={`mailto:${msg.email}`} className="text-purple-400 hover:text-purple-300 text-sm font-mono break-all">{msg.email}</a>
                        </div>
                        {msg.phone && (
                          <div>
                            <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 block mb-1">Phone</label>
                            <a href={`tel:${msg.phone}`} className="text-cyan-400 hover:text-cyan-300 text-sm font-mono">{msg.phone}</a>
                          </div>
                        )}
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 block mb-1">Received</label>
                          <span className="text-white/60 text-xs font-mono">
                            {new Date(msg.createdAt).toLocaleString('en-GB', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <a
                          href={`mailto:${msg.email}?subject=Re: Your Inquiry to Harun Rashid`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-colors w-full justify-center"
                        >
                          <Mail className="w-3 h-3" /> Reply via Email
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
