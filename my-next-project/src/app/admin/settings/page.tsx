'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, Save, Plus, X, Mail } from 'lucide-react';

export default function AgencySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    agency_name: '',
    tagline: '',
    logo_url: '',
    address: '',
    phone: '',           // maps to backend "phone"
    email: '',
    website: '',
    facebook_url: '',
    instagram_url: '',
    founder_name: '',
    founder_designation: '',
    default_currency: '',
    default_country: '',
    bkash_number: '',
    nagad_number: '',
    rocket_number: '',
    bank_name: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_branch: '',
    bank_routing: '',
    bank2_name: '',
    bank2_account_name: '',
    bank2_account_number: '',
    bank2_branch: '',
    bank2_routing: ''
  });

  // Notification emails managed separately as an array
  const [notificationEmails, setNotificationEmails] = useState<string[]>(['velouracreations@gmail.com']);
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.get('/admin/agency-settings');
      if (data && Object.keys(data).length > 0) {
        // Map all backend fields to form state (null → empty string)
        setFormData(prev => ({
          ...prev,
          agency_name:          data.agency_name          ?? '',
          tagline:              data.tagline              ?? '',
          logo_url:             data.logo_url             ?? '',
          address:              data.address              ?? '',
          phone:                data.phone                ?? '',
          email:                data.email                ?? '',
          website:              data.website              ?? '',
          facebook_url:         data.facebook_url         ?? '',
          instagram_url:        data.instagram_url        ?? '',
          founder_name:         data.founder_name         ?? '',
          founder_designation:  data.founder_designation  ?? '',
          default_currency:     data.default_currency     ?? '',
          default_country:      data.default_country      ?? '',
          bkash_number:         data.bkash_number         ?? '',
          nagad_number:         data.nagad_number         ?? '',
          rocket_number:        data.rocket_number        ?? '',
          bank_name:            data.bank_name            ?? '',
          bank_account_name:    data.bank_account_name    ?? '',
          bank_account_number:  data.bank_account_number  ?? '',
          bank_branch:          data.bank_branch          ?? '',
          bank_routing:         data.bank_routing         ?? '',
          bank2_name:           data.bank2_name           ?? '',
          bank2_account_name:   data.bank2_account_name   ?? '',
          bank2_account_number: data.bank2_account_number ?? '',
          bank2_branch:         data.bank2_branch         ?? '',
          bank2_routing:        data.bank2_routing        ?? '',
        }));

        // Load notification emails
        if (Array.isArray(data.notification_emails) && data.notification_emails.length > 0) {
          setNotificationEmails(data.notification_emails);
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/admin/agency-settings', {
        ...formData,
        notification_emails: notificationEmails,
      });
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const INP = "w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d8c3a5]/50 transition-colors placeholder:text-white/20";
  const LBL = "block text-xs uppercase tracking-widest text-white/50 mb-2";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="w-7 h-7 animate-spin text-[#d8c3a5]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-white mb-1">Agency Settings</h1>
          <p className="text-sm text-white/40">Manage permanent official details for the agency.</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest font-medium transition-colors disabled:opacity-50 self-start sm:self-auto ${
            message.includes('successfully') ? 'bg-green-500 text-white' : 'bg-[#d8c3a5] text-black hover:bg-white'
          }`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {message.includes('successfully') ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {message && !message.includes('successfully') && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info */}
        <div className="bg-[#161616] border border-white/5 rounded-xl p-8">
          <h2 className="text-[#d8c3a5] font-serif text-xl mb-6">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={LBL}>Agency Name *</label>
              <input required type="text" name="agency_name" value={formData.agency_name} onChange={handleChange} className={INP} />
            </div>
            <div>
              <label className={LBL}>Logo URL</label>
              <input type="text" name="logo_url" value={formData.logo_url} onChange={handleChange} placeholder="https://..." className={INP} />
            </div>
            <div className="md:col-span-2">
              <label className={LBL}>Tagline</label>
              <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} className={INP} />
            </div>
            <div className="md:col-span-2">
              <label className={LBL}>Official Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className={INP + ' resize-none'} />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-[#161616] border border-white/5 rounded-xl p-8">
          <h2 className="text-[#d8c3a5] font-serif text-xl mb-6">Contact Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={LBL}>Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={INP} />
            </div>
            <div>
              <label className={LBL}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={INP} />
            </div>
            <div>
              <label className={LBL}>Website</label>
              <input type="text" name="website" value={formData.website} onChange={handleChange} className={INP} />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-[#161616] border border-white/5 rounded-xl p-8">
          <h2 className="text-[#d8c3a5] font-serif text-xl mb-6">Social Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={LBL}>Facebook URL</label>
              <input type="text" name="facebook_url" value={formData.facebook_url} onChange={handleChange} className={INP} />
            </div>
            <div>
              <label className={LBL}>Instagram URL</label>
              <input type="text" name="instagram_url" value={formData.instagram_url} onChange={handleChange} className={INP} />
            </div>
          </div>
        </div>

        {/* Founder Info */}
        <div className="bg-[#161616] border border-white/5 rounded-xl p-8">
          <h2 className="text-[#d8c3a5] font-serif text-xl mb-6">Founder Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={LBL}>Founder Name</label>
              <input type="text" name="founder_name" value={formData.founder_name} onChange={handleChange} className={INP} />
            </div>
            <div>
              <label className={LBL}>Founder Designation</label>
              <input type="text" name="founder_designation" value={formData.founder_designation} onChange={handleChange} placeholder="e.g. Founder & CEO" className={INP} />
            </div>
            <div className="md:col-span-2 mt-2">
              <h3 className="text-white/70 text-sm font-semibold uppercase tracking-widest mt-2 mb-4 border-b border-white/10 pb-2">Regional Settings</h3>
            </div>
            <div>
              <label className={LBL}>Default Currency</label>
              <input type="text" name="default_currency" value={formData.default_currency} onChange={handleChange} placeholder="e.g. BDT" className={INP} />
            </div>
            <div>
              <label className={LBL}>Default Country</label>
              <input type="text" name="default_country" value={formData.default_country} onChange={handleChange} placeholder="e.g. Bangladesh" className={INP} />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-[#161616] border border-white/5 rounded-xl p-8">
          <h2 className="text-[#d8c3a5] font-serif text-xl mb-6">Payment Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={LBL}>bKash Number</label>
              <input type="text" name="bkash_number" value={formData.bkash_number} onChange={handleChange} placeholder="Leave blank for N/A" className={INP} />
            </div>
            <div>
              <label className={LBL}>Nagad Number</label>
              <input type="text" name="nagad_number" value={formData.nagad_number} onChange={handleChange} placeholder="Leave blank for N/A" className={INP} />
            </div>
            <div>
              <label className={LBL}>Rocket Number</label>
              <input type="text" name="rocket_number" value={formData.rocket_number} onChange={handleChange} placeholder="Leave blank for N/A" className={INP} />
            </div>
            <div className="md:col-span-3">
              <h3 className="text-white/70 text-sm font-semibold uppercase tracking-widest mt-2 mb-4 border-b border-white/10 pb-2">Bank Details</h3>
            </div>
            <div>
              <label className={LBL}>Bank Name</label>
              <input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} className={INP} />
            </div>
            <div>
              <label className={LBL}>Account Name</label>
              <input type="text" name="bank_account_name" value={formData.bank_account_name} onChange={handleChange} className={INP} />
            </div>
            <div>
              <label className={LBL}>Account Number</label>
              <input type="text" name="bank_account_number" value={formData.bank_account_number} onChange={handleChange} className={INP} />
            </div>
            <div>
              <label className={LBL}>Branch</label>
              <input type="text" name="bank_branch" value={formData.bank_branch} onChange={handleChange} className={INP} />
            </div>
            <div>
              <label className={LBL}>Routing Number</label>
              <input type="text" name="bank_routing" value={formData.bank_routing} onChange={handleChange} className={INP} />
            </div>
            <div className="md:col-span-2 mt-4">
              <h3 className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Bank Details 2 (Optional)</h3>
            </div>
            <div>
              <label className={LBL}>Bank Name</label>
              <input type="text" name="bank2_name" value={formData.bank2_name} onChange={handleChange} className={INP} />
            </div>
            <div>
              <label className={LBL}>Account Name</label>
              <input type="text" name="bank2_account_name" value={formData.bank2_account_name} onChange={handleChange} className={INP} />
            </div>
            <div>
              <label className={LBL}>Account Number</label>
              <input type="text" name="bank2_account_number" value={formData.bank2_account_number} onChange={handleChange} className={INP} />
            </div>
            <div>
              <label className={LBL}>Branch</label>
              <input type="text" name="bank2_branch" value={formData.bank2_branch} onChange={handleChange} className={INP} />
            </div>
            <div>
              <label className={LBL}>Routing Number</label>
              <input type="text" name="bank2_routing" value={formData.bank2_routing} onChange={handleChange} className={INP} />
            </div>
          </div>
        </div>

        {/* ─── Email Notifications ─────────────────────────────────────── */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-8">
          <h2 className="text-white font-serif text-xl mb-1 flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#d8c3a5]" />
            Booking Notification Recipients
          </h2>
          <p className="text-white/40 text-sm mb-6">
            Every time a customer places a new booking, an email alert will be sent to <strong className="text-white/60">all</strong> addresses listed below.
          </p>

          <div className="space-y-3 mb-5">
            {notificationEmails.map((email, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-3 bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3">
                  <Mail className="w-4 h-4 text-[#d8c3a5] shrink-0" />
                  <span className="text-white text-sm">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationEmails(prev => prev.filter((_, i) => i !== idx))}
                  className="p-2 rounded-lg bg-red-900/20 border border-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (newEmail.trim() && !notificationEmails.includes(newEmail.trim())) {
                    setNotificationEmails(prev => [...prev, newEmail.trim()]);
                    setNewEmail('');
                  }
                }
              }}
              placeholder="Add email address..."
              className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d8c3a5]/50 transition-colors placeholder:text-white/20 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                if (newEmail.trim() && !notificationEmails.includes(newEmail.trim())) {
                  setNotificationEmails(prev => [...prev, newEmail.trim()]);
                  setNewEmail('');
                }
              }}
              className="flex items-center gap-2 bg-[#d8c3a5]/10 border border-[#d8c3a5]/30 text-[#d8c3a5] hover:bg-[#d8c3a5]/20 px-4 py-3 rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          <p className="text-white/30 text-xs mt-3">Press Enter or click Add. Changes are saved when you click Save Settings above.</p>
        </div>

      </form>

      {/* Data Cleanup */}
      <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-8 mt-12">
        <h2 className="text-red-400 font-serif text-xl mb-4">Danger Zone</h2>
        <p className="text-white/60 text-sm mb-6">
          This action will permanently delete all bookings, clients, and history from the database. This cannot be undone.
        </p>
        <button
          type="button"
          onClick={async () => {
            if (confirm('Are you absolutely sure you want to wipe all data? This cannot be undone.')) {
              try {
                await api.delete('/admin/wipe-data');
                alert('Data wiped successfully.');
                window.location.reload();
              } catch (err: any) {
                alert(err.message || 'Failed to wipe data.');
              }
            }
          }}
          className="bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white px-6 py-3 rounded-lg text-xs uppercase tracking-widest transition-colors font-semibold"
        >
          Wipe All Data
        </button>
      </div>
    </div>
  );
}
