import { api } from './api';

export interface DevProject {
  id: number;
  title: string;
  slug?: string;
  description: string;
  thumbnail: string;
  external_url: string;
  technologies?: string;
  category?: string;
  year?: string;
  display_order: number;
  featured?: boolean;
  published?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon?: string;
}

export interface CustomContact {
  id: string;
  label: string;
  value: string;
  link?: string;
}

export interface PortfolioContact {
  email: string;
  phone: string;
  whatsapp?: string;
  location: string;
  available: boolean;
  avatar_url?: string;
  tagline?: string;
  socials: SocialLink[];
  custom_contacts: CustomContact[];
}

export interface PortfolioCV {
  id: string;
  title: string;
  subtitle?: string;
  file_url: string;
  filename: string;
  file_size?: string;
  uploaded_at?: string;
  is_primary?: boolean;
  published?: boolean;
}

export interface PortfolioAbout {
  headline: string;
  subheadline: string;
  avatar_badge?: string;
  bio_short: string;
  bio_long: string;
  available: boolean;
  pillar1_title: string;
  pillar1_desc: string;
  pillar2_title: string;
  pillar2_desc: string;
  pillar3_title: string;
  pillar3_desc: string;
}

export interface PortfolioService {
  number: string;
  title: string;
  description: string;
  tags: string;
}

export const DEFAULT_ABOUT_DATA: PortfolioAbout = {
  headline: "HI, I'M HARUN",
  subheadline: 'SOFTWARE & SYSTEMS ENGINEER',
  avatar_badge: 'SOFT. ENGINEER',
  bio_short: 'Engineer focused on architecting resilient software systems, scalable backends, and modern computational platforms with high technical precision.',
  bio_long: 'I am an engineer dedicated to designing robust software systems, computational workflows, and scalable architectures. With a disciplined engineering background, I bridge foundational engineering principles with modern full-stack technologies to deliver software that is reliable, secure, and built for scale.',
  available: true,
  pillar1_title: 'ENGINEERING ARCHITECTURE',
  pillar1_desc: 'Applying core computer science & software engineering principles to design resilient, fault-tolerant platforms.',
  pillar2_title: 'SYSTEMS & SCALE',
  pillar2_desc: 'Designing clean relational schemas, secure auth flows, and resilient API endpoints engineered for production reliability.',
  pillar3_title: 'MOTION & INTERACTIVE UX',
  pillar3_desc: 'Crafting fluid GPU micro-animations, accessible interfaces, and refined interactions inspired by editorial design.',
};

export const DEFAULT_SERVICES_DATA: PortfolioService[] = [
  {
    number: '01',
    title: 'FULL-STACK SYSTEMS ENGINEERING',
    description: 'End-to-end responsive web applications built with Next.js, React, TypeScript, and modern ecosystem tooling.',
    tags: 'Next.js, React, TypeScript, Tailwind CSS',
  },
  {
    number: '02',
    title: 'SOFTWARE ARCHITECTURE & API DESIGN',
    description: 'Robust RESTful API design, authentication systems, and service layers with Python and Flask.',
    tags: 'Python, Flask, REST APIs, JWT Security',
  },
  {
    number: '03',
    title: 'DATABASE & DATA MODELING',
    description: 'Relational schema design, migrations, efficient queries, and data integrity using PostgreSQL and SQLAlchemy.',
    tags: 'PostgreSQL, SQLite, SQLAlchemy, Alembic',
  },
  {
    number: '04',
    title: 'INTERACTIVE UI & 3D MOTION UX',
    description: 'Editorial-grade typography, 3D scroll-driven mechanics, and smooth GPU-accelerated micro-interactions.',
    tags: 'Framer Motion, 3D Perspective, Responsive UI',
  },
];

export const FALLBACK_PROJECTS: DevProject[] = [
  {
    id: 1,
    title: 'Distributed Cloud Architecture & API Core',
    slug: 'cloud-architecture-api',
    description: 'Scalable service layer engineered with high concurrency, structured REST endpoints, and containerized microservices.',
    thumbnail: '/project_mockup_preview.jpg',
    external_url: 'https://example.com',
    technologies: 'Next.js, Python, Flask, PostgreSQL, Docker',
    category: 'Systems Engineering',
    year: '2026',
    display_order: 1,
    featured: true,
    published: true,
  },
  {
    id: 2,
    title: 'Enterprise Management & Kitchen POS Platform',
    slug: 'enterprise-management-pos',
    description: 'High-performance cloud ordering, reservation management, and real-time kitchen display system engineered for scale.',
    thumbnail: '/project_mockup_preview.jpg',
    external_url: 'https://example.com/restaurant',
    technologies: 'React, Tailwind CSS, Flask, PostgreSQL',
    category: 'Full-Stack Engineering',
    year: '2025',
    display_order: 2,
    featured: true,
    published: true,
  },
  {
    id: 3,
    title: 'Creative Agency Interactive Experience',
    slug: 'creative-agency-platform',
    description: 'Interactive client showcase, booking workflows, and automated pipeline delivery with smooth GPU-accelerated motion.',
    thumbnail: '/harun_avatar.jpg',
    external_url: 'https://valoureouscreation.com',
    technologies: 'Next.js, TypeScript, Framer Motion, Python',
    category: 'Interactive Platform',
    year: '2026',
    display_order: 3,
    featured: false,
    published: true,
  },
];

export const DEFAULT_CONTACT_DATA: PortfolioContact = {
  email: 'hr1349891@gmail.com',
  phone: '+880 1700 000000',
  whatsapp: '+880 1700 000000',
  location: 'Dhaka, Bangladesh',
  available: true,
  avatar_url: '/harun_avatar.jpg',
  tagline: 'Software & Systems Engineer available for architecture, engineering development, and technical collaboration.',
  socials: [
    { id: '1', platform: 'LinkedIn', label: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin' },
    { id: '2', platform: 'GitHub', label: 'GitHub', url: 'https://github.com', icon: 'github' },
    { id: '3', platform: 'Email', label: 'hr1349891@gmail.com', url: 'mailto:hr1349891@gmail.com', icon: 'mail' },
  ],
  custom_contacts: [
    { id: 'c1', label: 'Role', value: 'Software & Systems Engineer', link: '' },
    { id: 'c2', label: 'Expertise', value: 'Full-Stack Architecture', link: '' },
  ],
};

export const DEFAULT_CVS_DATA: PortfolioCV[] = [
  {
    id: 'cv-1',
    title: 'Engineering Resume (Comprehensive)',
    subtitle: 'Systems engineering, software architecture, and technical achievements',
    file_url: '/Harun_Rashid_CV.pdf',
    filename: 'Harun_Rashid_Engineering_Resume.pdf',
    file_size: '240 KB',
    uploaded_at: '2026',
    is_primary: true,
    published: true,
  },
];


export const devProjectsApi = {
  // Public - NEVER requires authentication
  getPublic: async (): Promise<DevProject[]> => {
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${BASE_URL}/dev-projects`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
      return FALLBACK_PROJECTS;
    } catch {
      return FALLBACK_PROJECTS;
    }
  },

  // Admin
  getAllAdmin: async (): Promise<DevProject[]> => {
    try {
      const data = await api.get('/dev-projects/all');
      if (Array.isArray(data)) {
        return data;
      }
      return FALLBACK_PROJECTS;
    } catch (err) {
      console.error('Failed to fetch admin projects:', err);
      throw err;
    }
  },

  create: async (data: FormData | any): Promise<DevProject> => {
    const res = await api.post('/dev-projects', data);
    return res.project;
  },

  update: async (id: number, data: FormData | any): Promise<DevProject> => {
    const res = await api.put(`/dev-projects/${id}`, data);
    return res.project;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/dev-projects/${id}`);
  },

  togglePublish: async (id: number): Promise<DevProject> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${BASE_URL}/dev-projects/${id}/toggle-publish`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      throw new Error('Failed to toggle publish status');
    }
    const json = await response.json();
    return json.project;
  },

  reorder: async (orders: { id: number; display_order: number }[]): Promise<void> => {
    await api.post('/dev-projects/reorder', { orders });
  },

  // Upload file (images, PDFs)
  uploadFile: async (file: File): Promise<{ url: string; filename: string; size: string; ext: string }> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await api.post('/dev-projects/upload-file', fd);
    return res;
  },

  // Contact Info (Public fetch, no auth required)
  getContactInfo: async (): Promise<PortfolioContact> => {
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${BASE_URL}/dev-projects/contact-info`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.email) return data;
      }
      const cached = typeof window !== 'undefined' ? localStorage.getItem('portfolio_contact') : null;
      if (cached) return JSON.parse(cached);
      return DEFAULT_CONTACT_DATA;
    } catch {
      const cached = typeof window !== 'undefined' ? localStorage.getItem('portfolio_contact') : null;
      if (cached) return JSON.parse(cached);
      return DEFAULT_CONTACT_DATA;
    }
  },

  updateContactInfo: async (contact: PortfolioContact): Promise<PortfolioContact> => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio_contact', JSON.stringify(contact));
    }
    try {
      const res = await api.put('/dev-projects/contact-info', contact);
      return res.contact;
    } catch {
      return contact;
    }
  },

  // CV / Resumes (Public fetch, no auth required)
  getCVs: async (): Promise<PortfolioCV[]> => {
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${BASE_URL}/dev-projects/cvs`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
      const cached = typeof window !== 'undefined' ? localStorage.getItem('portfolio_cvs') : null;
      if (cached) return JSON.parse(cached);
      return DEFAULT_CVS_DATA;
    } catch {
      const cached = typeof window !== 'undefined' ? localStorage.getItem('portfolio_cvs') : null;
      if (cached) return JSON.parse(cached);
      return DEFAULT_CVS_DATA;
    }
  },

  saveCV: async (cv: PortfolioCV): Promise<PortfolioCV[]> => {
    try {
      const res = await api.post('/dev-projects/cvs', cv);
      if (typeof window !== 'undefined' && res.cvs) {
        localStorage.setItem('portfolio_cvs', JSON.stringify(res.cvs));
      }
      return res.cvs;
    } catch {
      // Local fallback
      const cached = typeof window !== 'undefined' ? localStorage.getItem('portfolio_cvs') : null;
      let list: PortfolioCV[] = cached ? JSON.parse(cached) : [...DEFAULT_CVS_DATA];
      const idx = list.findIndex((c) => c.id === cv.id);
      if (cv.is_primary) {
        list = list.map((c) => ({ ...c, is_primary: false }));
      }
      if (idx >= 0) list[idx] = cv;
      else list.push(cv);
      if (typeof window !== 'undefined') {
        localStorage.setItem('portfolio_cvs', JSON.stringify(list));
      }
      return list;
    }
  },

  deleteCV: async (cvId: string): Promise<PortfolioCV[]> => {
    try {
      const res = await api.delete(`/dev-projects/cvs/${cvId}`);
      if (typeof window !== 'undefined' && res.cvs) {
        localStorage.setItem('portfolio_cvs', JSON.stringify(res.cvs));
      }
      return res.cvs;
    } catch {
      const cached = typeof window !== 'undefined' ? localStorage.getItem('portfolio_cvs') : null;
      let list: PortfolioCV[] = cached ? JSON.parse(cached) : [...DEFAULT_CVS_DATA];
      list = list.filter((c) => c.id !== cvId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('portfolio_cvs', JSON.stringify(list));
      }
      return list;
    }
  },

  togglePrimaryCV: async (cvId: string): Promise<PortfolioCV[]> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    try {
      const res = await fetch(`${BASE_URL}/dev-projects/cvs/${cvId}/toggle-primary`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (typeof window !== 'undefined' && json.cvs) {
        localStorage.setItem('portfolio_cvs', JSON.stringify(json.cvs));
      }
      return json.cvs;
    } catch {
      const cached = typeof window !== 'undefined' ? localStorage.getItem('portfolio_cvs') : null;
      let list: PortfolioCV[] = cached ? JSON.parse(cached) : [...DEFAULT_CVS_DATA];
      list = list.map((c) => ({ ...c, is_primary: c.id === cvId }));
      if (typeof window !== 'undefined') {
        localStorage.setItem('portfolio_cvs', JSON.stringify(list));
      }
      return list;
    }
  },

  // About Content (Public fetch, Admin update)
  getAbout: async (): Promise<PortfolioAbout> => {
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${BASE_URL}/dev-projects/about`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.headline) return data;
      }
      const cached = typeof window !== 'undefined' ? localStorage.getItem('harun_about') : null;
      if (cached) return JSON.parse(cached);
      return DEFAULT_ABOUT_DATA;
    } catch {
      const cached = typeof window !== 'undefined' ? localStorage.getItem('harun_about') : null;
      if (cached) return JSON.parse(cached);
      return DEFAULT_ABOUT_DATA;
    }
  },

  updateAbout: async (about: PortfolioAbout): Promise<PortfolioAbout> => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('harun_about', JSON.stringify(about));
    }
    try {
      const res = await api.put('/dev-projects/about', about);
      return res.about;
    } catch {
      return about;
    }
  },

  // Services Content (Public fetch, Admin update)
  getServices: async (): Promise<PortfolioService[]> => {
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${BASE_URL}/dev-projects/services`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
      const cached = typeof window !== 'undefined' ? localStorage.getItem('harun_services') : null;
      if (cached) return JSON.parse(cached);
      return DEFAULT_SERVICES_DATA;
    } catch {
      const cached = typeof window !== 'undefined' ? localStorage.getItem('harun_services') : null;
      if (cached) return JSON.parse(cached);
      return DEFAULT_SERVICES_DATA;
    }
  },

  updateServices: async (services: PortfolioService[]): Promise<PortfolioService[]> => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('harun_services', JSON.stringify(services));
    }
    try {
      const res = await api.put('/dev-projects/services', services);
      return res.services;
    } catch {
      return services;
    }
  },

  // ── Contact Messages (Admin only) ────────────────────────────────────────
  getMessages: async (): Promise<ContactMessageItem[]> => {
    const data = await api.get('/contact');
    return data as ContactMessageItem[];
  },

  updateMessageStatus: async (id: number, status: 'read' | 'unread'): Promise<void> => {
    await api.put(`/contact/${id}/status`, { status });
  },

  deleteMessage: async (id: number): Promise<void> => {
    await api.delete(`/contact/${id}`);
  },
};

// ── Contact Message interface (kept near usage) ───────────────────────────
export interface ContactMessageItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  eventDate: string | null;
  eventLocation: string | null;
  message: string;
  status: 'read' | 'unread';
  createdAt: string;
}


