'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Loader2, ArrowLeft, FileText, CheckCircle, Download, FilePlus2, Share2 } from 'lucide-react';
import Link from 'next/link';

interface Document {
  id: number;
  doc_number: string;
  doc_type: string;
  generated_at: string;
  generated_by: string;
  pdf_path: string;
}

export default function AdminDocumentGeneration({ params }: { params: { id: string } }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [params.id]);

  const fetchDocuments = async () => {
    try {
      const data = await api.get(`/admin/bookings/${params.id}`);
      setDocuments(data.documents || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (docType: string) => {
    setGenerating(true);
    try {
      const data = await api.post(`/admin/bookings/${params.id}/documents`, { doc_type: docType });
      setDocuments(prev => [...prev, data.document]);
      alert(`${docType} generated successfully.`);
    } catch (err: any) {
      alert(err.message || 'Failed to generate document');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-60">
      <Loader2 className="w-7 h-7 animate-spin text-[#d8c3a5]" />
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/bookings/${params.id}`} className="w-10 h-10 rounded-full bg-[#161616] border border-white/5 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl text-white mb-1">Documents</h1>
            <p className="text-sm text-white/40">Manage Invoice & Agreement for Booking #{params.id}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-xl">{error}</div>
      )}

      {/* Generate Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {['INVOICE', 'AGREEMENT'].map((type) => {
          const exists = documents.some(d => d.doc_type === type);
          return (
            <div key={type} className="bg-[#161616] border border-white/5 rounded-xl p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
                  {exists ? <CheckCircle className="w-6 h-6 text-green-400" /> : <FilePlus2 className="w-6 h-6 text-[#d8c3a5]" />}
                </div>
                <h3 className="text-xl font-serif text-white mb-2">{type.charAt(0) + type.slice(1).toLowerCase()}</h3>
                <p className="text-white/40 text-sm mb-6">
                  {exists 
                    ? `A ${type.toLowerCase()} has been generated for this booking.`
                    : `Generate a new ${type.toLowerCase()} locking in the current package and event details.`}
                </p>
              </div>
              <button
                onClick={() => handleGenerate(type)}
                disabled={generating || exists}
                className="w-full flex items-center justify-center gap-2 bg-white/5 text-white/70 py-3 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 font-medium uppercase tracking-widest text-xs"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : (exists ? 'Regenerate' : `Generate ${type}`)}
              </button>
            </div>
          );
        })}
      </div>

      {/* Document History */}
      <div className="bg-[#161616] border border-white/5 rounded-xl overflow-hidden mt-8">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-[#d8c3a5] font-serif text-xl">Generated Documents</h2>
        </div>
        {documents.length === 0 ? (
          <div className="p-10 text-center text-white/40 text-sm">
            No documents generated yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-white/30 font-normal">Doc No.</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-white/30 font-normal">Type</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-white/30 font-normal">Generated On</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-white/30 font-normal">Generated By</th>
                <th className="text-right px-6 py-4 text-xs uppercase tracking-widest text-white/30 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {documents.map(doc => (
                <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-[#d8c3a5]">{doc.doc_number}</td>
                  <td className="px-6 py-4 text-white/70 font-medium">{doc.doc_type}</td>
                  <td className="px-6 py-4 text-white/40">
                    {doc.generated_at ? new Date(doc.generated_at).toLocaleString() : 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-white/40">{doc.generated_by}</td>
                  <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                    <button
                      onClick={() => {
                         if (!doc.pdf_path) { alert('Document PDF not generated yet.'); return; }
                         const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
                         window.open(backendUrl + doc.pdf_path, '_blank');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest bg-[#d8c3a5] hover:bg-white text-black px-3 py-1.5 rounded transition-colors font-medium"
                    >
                      <FileText className="w-3.5 h-3.5" /> View / Print
                    </button>
                    <a
                      href={doc.pdf_path ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '') + doc.pdf_path : '#'}
                      onClick={(e) => { if (!doc.pdf_path) { e.preventDefault(); alert('Document PDF not generated yet.'); } }}
                      download
                      className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest bg-[#d8c3a5] hover:bg-white text-black px-3 py-1.5 rounded transition-colors font-medium"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                    <button
                      onClick={async () => {
                        if (!doc.pdf_path) { alert('Document PDF not generated yet.'); return; }
                        const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
                        const url = backendUrl + doc.pdf_path;
                        if (navigator.share) {
                          try {
                            await navigator.share({
                              title: `${doc.doc_type} - ${doc.doc_number}`,
                              url: url
                            });
                          } catch (e) {
                            console.error(e);
                          }
                        } else {
                          navigator.clipboard.writeText(url);
                          alert('Link copied to clipboard!');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest bg-[#d8c3a5] hover:bg-white text-black px-3 py-1.5 rounded transition-colors font-medium"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this document?')) {
                          try {
                            await api.delete(`/admin/bookings/${params.id}/documents/${doc.id}`);
                            setDocuments(prev => prev.filter(d => d.id !== doc.id));
                          } catch (err: any) {
                            alert(err.message || 'Failed to delete');
                          }
                        }
                      }}
                      className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white px-3 py-1.5 rounded transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
