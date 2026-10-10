'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Mail, MailOpen, Trash2, Calendar, MapPin, Phone } from 'lucide-react';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  eventDate: string | null;
  eventLocation: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export default function MessagesAdmin() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await api.get('/contact');
      setMessages(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/contact/${id}/status`, { status: 'read' });
      setMessages(messages.map(msg => msg.id === id ? { ...msg, status: 'read' } : msg));
    } catch (err: any) {
      alert('Failed to update status');
    }
  };

  const deleteMessage = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.delete(`/contact/${id}`);
      setMessages(messages.filter(msg => msg.id !== id));
    } catch (err: any) {
      alert('Failed to delete message');
    }
  };

  if (loading) return <div className="text-white/50">Loading messages...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-white mb-2">Inbox</h1>
        <p className="text-white/50 text-sm">Manage inquiries from the contact form.</p>
      </div>

      {messages.length === 0 ? (
        <div className="bg-[#111] border border-white/5 rounded-lg p-12 text-center">
          <Mail className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`bg-[#111] border rounded-lg p-6 transition-colors ${
                msg.status === 'unread' ? 'border-[#d8c3a5]/30' : 'border-white/5'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    {msg.status === 'unread' ? (
                      <Mail className="w-4 h-4 text-[#d8c3a5]" />
                    ) : (
                      <MailOpen className="w-4 h-4 text-white/40" />
                    )}
                    {msg.name}
                  </h3>
                  <a href={`mailto:${msg.email}`} className="text-[#d8c3a5] text-sm hover:underline">{msg.email}</a>
                </div>
                <div className="text-right">
                  <span className="text-xs text-white/40 block mb-2">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                  <div className="flex gap-2 justify-end">
                    {msg.status === 'unread' && (
                      <button 
                        onClick={() => markAsRead(msg.id)}
                        className="text-[10px] uppercase tracking-widest text-black bg-[#d8c3a5] px-3 py-1 rounded hover:bg-white transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                    <button 
                      onClick={() => deleteMessage(msg.id)}
                      className="text-white/40 hover:text-red-400 p-1 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-4 text-xs text-white/60">
                {msg.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-white/40" /> {msg.phone}
                  </div>
                )}
                {msg.eventDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-white/40" /> {msg.eventDate}
                  </div>
                )}
                {msg.eventLocation && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-white/40" /> {msg.eventLocation}
                  </div>
                )}
              </div>

              <div className="bg-[#0a0a0a] p-4 rounded text-white/80 text-sm whitespace-pre-wrap">
                {msg.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
