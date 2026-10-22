import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { SiteContent } from '../types/portfolio';

interface ContactSectionProps {
  siteContent: SiteContent;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ siteContent }) => {
  const { contacts } = siteContent;
  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
  };

  return (
    <section id="contacts" className="relative border-b border-[var(--border-subtle)] py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Direct Info & Social Channels */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="text-xs uppercase tracking-widest text-[var(--accent)] font-mono-code mb-1">
                Contacts
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                Get In Touch
              </h2>
              <p className="mt-3 text-sm text-[var(--text-muted)] leading-relaxed">
                Have a production in mind or interested in collaborating? Reach out directly or send an inquiry below.
              </p>
            </div>

            <div className="space-y-4">
              <a
                href={`mailto:${contacts.email}`}
                className="flex items-center gap-3 text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors group"
              >
                <div className="flex h-10 w-10 items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--accent)] group-hover:border-[var(--accent)] transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono-code text-[var(--text-muted)]">Email</div>
                  <div className="font-mono-code text-xs">{contacts.email}</div>
                </div>
              </a>

              {contacts.phone && (
                <div className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
                  <div className="flex h-10 w-10 items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--accent)]">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-mono-code text-[var(--text-muted)]">Phone / WhatsApp</div>
                    <div className="font-mono-code text-xs">{contacts.phone}</div>
                  </div>
                </div>
              )}

              {contacts.location && (
                <div className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
                  <div className="flex h-10 w-10 items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--accent)]">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-mono-code text-[var(--text-muted)]">Location</div>
                    <div className="font-mono-code text-xs">{contacts.location}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Social Channels */}
            <div className="pt-6 border-t border-[var(--border-subtle)]">
              <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono-code mb-3">
                Social Platforms
              </div>
              <div className="flex flex-wrap gap-4 text-xs font-mono-code text-[var(--text-primary)]">
                {contacts.socials.vimeo && (
                  <a href={contacts.socials.vimeo} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors">
                    Vimeo ↗
                  </a>
                )}
                {contacts.socials.youtube && (
                  <a href={contacts.socials.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors">
                    YouTube ↗
                  </a>
                )}
                {contacts.socials.instagram && (
                  <a href={contacts.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors">
                    Instagram ↗
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Direct Message Form */}
          <div className="lg:col-span-7">
            <div className="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8">
              {formSent ? (
                <div className="py-12 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--accent)]" />
                  <h3 className="mt-4 text-xl font-bold text-[var(--text-primary)]">Message Sent</h3>
                  <p className="mt-2 text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                    Thank you. I have received your message and will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setFormSent(false)}
                    className="mt-6 border border-[var(--border-strong)] px-4 py-2 text-xs uppercase font-mono-code text-[var(--text-primary)] hover:border-[var(--accent)] cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1.5">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell me about your project, timeline, and deliverables..."
                      className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 w-full bg-[var(--accent)] py-3 text-xs font-semibold uppercase tracking-wider text-white hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
