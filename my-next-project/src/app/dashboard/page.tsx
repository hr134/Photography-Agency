'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Loader2, Calendar, CreditCard, Package, ArrowRight, FileText, Download, CheckCircle, Clock, X, Eye, Share2 } from "lucide-react";
import Link from "next/link";

interface Document {
  id: number;
  doc_type: string;
  doc_number: string;
  pdf_path: string;
  generated_at: string;
}

interface Booking {
  id: number;
  package_name: string;
  event_date: string;
  status: string;
  total_amount: number;
  advance_paid: number;
  created_at: string;
  workflow_status?: string;
  delivery_status?: string;
  delivery_link?: string;
  agreement_text?: string;
  agreement_status?: string;
  documents?: Document[];
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  CONFIRMED: 'bg-green-500/15 text-green-400 border border-green-500/30',
  COMPLETED: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  CANCELLED: 'bg-red-500/15 text-red-400 border border-red-500/30',
};

export default function Dashboard() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedAgreement, setSelectedAgreement] = useState<{ id: number; text: string; status: string } | null>(null);
  const [accepting, setAccepting] = useState(false);

  const handleAcceptAgreement = async (id: number) => {
    setAccepting(true);
    try {
      await api.put(`/bookings/${id}/accept_agreement`, {});
      setBookings(bookings.map(b => b.id === id ? { ...b, agreement_status: 'Confirmed' } : b));
      setSelectedAgreement(prev => prev ? { ...prev, status: 'Confirmed' } : null);
    } catch (err: any) {
      alert(err.message || 'Failed to accept agreement');
    } finally {
      setAccepting(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchBookings = async () => {
        try {
          const data = await api.get('/bookings/');
          setBookings(data.bookings || []);
        } catch (err: any) {
          setError(err.message || 'Failed to load bookings');
        } finally {
          setLoading(false);
        }
      };
      fetchBookings();
    }
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#d8c3a5]" />
      </div>
    );
  }

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'U';
  const totalSpent = bookings.reduce((sum, b) => sum + b.advance_paid, 0);
  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container mx-auto px-6 max-w-5xl">

        {/* Header */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#d8c3a5]/15 border border-[#d8c3a5]/30 flex items-center justify-center overflow-hidden">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-[#d8c3a5] text-lg font-bold font-serif">{initials}</span>
              )}
            </div>

            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-white">
                Welcome, {user?.username || 'Guest'}
              </h1>
              <p className="text-white/40 text-sm mt-1">{user?.email}</p>
            </div>
          </div>
          <Link
            href="/packages"
            className="self-start sm:self-auto flex items-center gap-2 border border-[#d8c3a5] text-[#d8c3a5] px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-[#d8c3a5] hover:text-black transition-colors"
          >
            Book a Package <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Total Bookings', value: bookings.length, icon: Package },
            { label: 'Advance Paid', value: `৳ ${totalSpent.toLocaleString()}`, icon: CreditCard },
            { label: 'Pending Confirmation', value: pendingCount, icon: Calendar },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-[#161616] border border-white/5 rounded-xl p-5 flex items-center gap-4">
              <div className="p-3 bg-[#d8c3a5]/10 rounded-lg">
                <Icon className="w-5 h-5 text-[#d8c3a5]" />
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-widest">{label}</p>
                <p className="text-white text-xl font-serif mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bookings */}
        <div className="space-y-4">
          <h2 className="text-lg font-serif tracking-wide text-white border-l-2 border-[#d8c3a5] pl-4">Your Bookings</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-4 rounded-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-[#d8c3a5]" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-[#161616] border border-white/5 rounded-xl p-12 text-center">
              <p className="text-white/50 mb-6">You haven't made any bookings yet.</p>
              <Link
                href="/packages"
                className="inline-block border border-[#d8c3a5] text-[#d8c3a5] px-6 py-3 uppercase text-xs tracking-widest hover:bg-[#d8c3a5] hover:text-black transition-colors"
              >
                Browse Packages
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {bookings.map((booking) => {
                const due = booking.total_amount - booking.advance_paid;
                return (
                  <div key={booking.id} className="bg-[#161616] border border-white/5 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/15 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-serif text-white">{booking.package_name}</h3>
                        <span className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full ${STATUS_STYLES[booking.status] || STATUS_STYLES.PENDING}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-5 text-sm text-white/50">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#d8c3a5]" />
                          {new Date(booking.event_date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-[#d8c3a5]" />
                          Total: ৳ {booking.total_amount.toLocaleString()}
                        </span>
                      </div>
                      
                      {/* New Workflow & Delivery Info */}
                      <div className="pt-2 flex flex-wrap gap-3">
                        {booking.workflow_status && (
                          <div className="flex items-center gap-1.5 text-xs text-white/70 bg-white/5 px-3 py-1.5 rounded-md border border-white/10">
                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                            Workflow: <span className="text-white">{booking.workflow_status}</span>
                          </div>
                        )}
                        {booking.delivery_status && booking.delivery_status !== 'Not Started' && (
                          <div className="flex items-center gap-1.5 text-xs text-white/70 bg-white/5 px-3 py-1.5 rounded-md border border-white/10">
                            <Package className="w-3.5 h-3.5 text-[#d8c3a5]" />
                            Delivery: <span className="text-white">{booking.delivery_status}</span>
                          </div>
                        )}
                        {booking.delivery_link && (
                          <a
                            href={booking.delivery_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-black bg-[#d8c3a5] hover:bg-white px-3 py-1.5 rounded-md transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download Delivery
                          </a>
                        )}
                        {booking.agreement_text && (
                          <button
                            onClick={() => setSelectedAgreement({ id: booking.id, text: booking.agreement_text!, status: booking.agreement_status || 'Pending' })}
                            className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md border border-white/10 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#d8c3a5]" />
                            {booking.agreement_status === 'Confirmed' ? 'View Agreement' : 'Review Agreement'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-1.5 border-t border-white/5 md:border-t-0 pt-4 md:pt-0 flex-shrink-0">
                      <p className="text-sm text-white/40">
                        Advance paid: <span className="text-white">৳ {booking.advance_paid.toLocaleString()}</span>
                      </p>
                      {due > 0 && (
                        <p className="text-sm text-white/40">
                          Balance due: <span className="text-[#d8c3a5] font-medium">৳ {due.toLocaleString()}</span>
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {booking.status === 'PENDING' && (
                          <Link
                            href={`/book/edit/${booking.id}`}
                            className="text-[10px] uppercase tracking-widest border border-[#d8c3a5]/50 text-[#d8c3a5] px-3 py-1.5 hover:bg-[#d8c3a5]/10 transition-colors rounded"
                          >
                            Edit Booking
                          </Link>
                        )}
                        {booking.status === 'CONFIRMED' && due > 0 && (
                          <a
                            href="https://wa.me/8801673694261"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] uppercase tracking-widest bg-[#d8c3a5] text-black px-4 py-1.5 hover:bg-white transition-colors"
                          >
                            Contact to Pay
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Documents Section */}
        {bookings.some(b => b.documents && b.documents.length > 0) && (
          <div className="mt-12 space-y-4">
            <h2 className="text-lg font-serif tracking-wide text-white border-l-2 border-[#d8c3a5] pl-4">My Documents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {bookings.flatMap(b => (b.documents || []).map(doc => (
                <div key={doc.id} className="bg-[#161616] border border-white/5 rounded-xl p-5 flex flex-col justify-between hover:border-white/15 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg text-[#d8c3a5]">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-serif text-white">{doc.doc_type === 'INVOICE' ? 'Invoice' : 'Agreement'}</p>
                        <p className="text-[10px] text-white/50">{doc.doc_number}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <p className="text-[10px] text-white/40">Generated: {new Date(doc.generated_at).toLocaleDateString()}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                           if (!doc.pdf_path) { alert('Document PDF not generated yet.'); return; }
                           const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
                           window.open(backendUrl + doc.pdf_path, '_blank');
                        }}
                        className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#d8c3a5] hover:text-white transition-colors"
                        title="View / Print"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          if (!doc.pdf_path) {
                            alert('Document PDF not generated yet.');
                            return;
                          }
                          const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
                          try {
                            const response = await fetch(backendUrl + doc.pdf_path);
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = doc.doc_number + '.pdf';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                          } catch (err) {
                            console.error('Failed to download PDF', err);
                            alert('Failed to download PDF');
                          }
                        }}
                        className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#d8c3a5] hover:text-white transition-colors"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
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
                        className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#d8c3a5] hover:text-white transition-colors"
                        title="Share"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )))}
            </div>
          </div>
        )}
      </div>

      {/* Agreement Modal */}
      {selectedAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161616] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-serif text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#d8c3a5]" />
                Booking Agreement
              </h2>
              <button
                onClick={() => setSelectedAgreement(null)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: selectedAgreement.text }} />
            </div>

            <div className="p-6 border-t border-white/5 flex items-center justify-between bg-black/20 rounded-b-2xl">
              <div>
                {selectedAgreement.status === 'Confirmed' ? (
                  <span className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Agreement Accepted
                  </span>
                ) : (
                  <span className="text-yellow-400/80 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending Your Acceptance
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write('<html><head><title>Agreement</title></head><body style="font-family: sans-serif; padding: 40px; line-height: 1.6;">');
                      printWindow.document.write(selectedAgreement.text);
                      printWindow.document.write('</body></html>');
                      printWindow.document.close();
                      printWindow.focus();
                      setTimeout(() => printWindow.print(), 250);
                    }
                  }}
                  className="px-4 py-2 border border-white/20 text-white text-xs uppercase tracking-widest hover:bg-white/5 transition-colors rounded-lg"
                >
                  Print
                </button>
                {selectedAgreement.status !== 'Confirmed' && (
                  <button
                    onClick={() => handleAcceptAgreement(selectedAgreement.id)}
                    disabled={accepting}
                    className="px-4 py-2 bg-[#d8c3a5] text-black text-xs uppercase tracking-widest hover:bg-white transition-colors rounded-lg disabled:opacity-50 flex items-center gap-2"
                  >
                    {accepting && <Loader2 className="w-3 h-3 animate-spin" />}
                    Accept Agreement
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
