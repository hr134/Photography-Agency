"use client";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    eventLocation: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", eventDate: "", eventLocation: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="pt-24 pb-20">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-[#d8c3a5] mb-6">Get in Touch</h1>
          <p className="text-white/70 font-light mb-4">Let&apos;s create something beautiful together.</p>
          <p className="text-[#d8c3a5] font-serif text-xl italic tracking-wide">
            🎥 “We Capture Emotions, Not Just Pictures.”
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-16 max-w-5xl mx-auto">
          {/* Info */}
          <div className="flex-1 space-y-10">
            <div>
              <h3 className="text-[#d8c3a5] uppercase tracking-widest text-[10px] mb-4">Our Location</h3>
              <div className="flex items-start gap-4 text-white/70 font-light">
                <MapPin className="w-5 h-5 text-[#d8c3a5] shrink-0" />
                <p>135/1 Gulshan Link Road,<br />Dhaka 1100</p>
              </div>
            </div>
            <div>
              <h3 className="text-[#d8c3a5] uppercase tracking-widest text-[10px] mb-4">Call & WhatsApp</h3>
              <div className="flex items-start gap-4 text-white/70 font-light">
                <Phone className="w-5 h-5 text-[#d8c3a5]" />
                <a href="tel:+8801673694261" className="hover:text-[#d8c3a5] transition-colors">+880 1673-694261</a>

              </div>
              <div className="flex items-start gap-4 text-white/70 font-light">
                <Phone className="w-5 h-5 text-[#d8c3a5]" />
                <a href="tel:+8801736569746" className="hover:text-[#d8c3a5] transition-colors">+880 1736-569746</a>

              </div>

            </div>
            <div>
              <h3 className="text-[#d8c3a5] uppercase tracking-widest text-[10px] mb-4">Email Us</h3>
              <div className="flex items-start gap-4 text-white/70 font-light">
                <Mail className="w-5 h-5 text-[#d8c3a5]" />
                <a href="mailto:velouracreations@gmail.com" className="hover:text-[#d8c3a5] transition-colors">velouracreations@gmail.com</a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="flex-[2] bg-[#161616] p-8 md:p-12">
            <h2 className="font-serif text-2xl text-white mb-8">Send Us a Message</h2>
            {status === "success" ? (
              <div className="bg-green-900/20 border border-green-500/50 p-6 text-green-200">
                <h3 className="font-serif text-xl mb-2">Message Sent!</h3>
                <p className="font-light text-sm">Thank you for reaching out. We will get back to you shortly.</p>
                <button onClick={() => setStatus("idle")} className="mt-4 text-[#d8c3a5] text-xs uppercase tracking-widest hover:text-white transition-colors">Send Another Message &rarr;</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Your Name" className="bg-[#0f0f0f] border border-white/10 p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#d8c3a5] transition-colors text-sm w-full" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email Address" className="bg-[#0f0f0f] border border-white/10 p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#d8c3a5] transition-colors text-sm w-full" />
                </div>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="bg-[#0f0f0f] border border-white/10 p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#d8c3a5] transition-colors text-sm w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" name="eventDate" value={formData.eventDate} onChange={handleChange} placeholder="Event Date" className="bg-[#0f0f0f] border border-white/10 p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#d8c3a5] transition-colors text-sm w-full" />
                  <input type="text" name="eventLocation" value={formData.eventLocation} onChange={handleChange} placeholder="Event Location" className="bg-[#0f0f0f] border border-white/10 p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#d8c3a5] transition-colors text-sm w-full" />
                </div>
                <textarea name="message" value={formData.message} onChange={handleChange} required placeholder="Tell us about your wedding..." rows={5} className="bg-[#0f0f0f] border border-white/10 p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#d8c3a5] transition-colors text-sm w-full resize-none"></textarea>
                {status === "error" && <p className="text-red-400 text-sm">Failed to send message. Please try again.</p>}
                <button type="submit" disabled={status === "submitting"} className="bg-[#d8c3a5] text-black uppercase tracking-widest text-xs px-8 py-4 hover:bg-white transition-colors w-full md:w-auto disabled:opacity-50">
                  {status === "submitting" ? "Sending..." : "Send Message \u2192"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
