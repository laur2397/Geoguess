'use client';

import { useState } from 'react';
import { SectionHeader } from './SectionHeader';

const AREAS = [
  'Procurement evaluation',
  'Technical integration',
  'Investor briefing',
  'Press / institutional inquiry',
  'Other',
];

export function TechnicalBriefCTA() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="technical-brief" className="relative py-28 md:py-36">
      <div className="absolute inset-0 grid-overlay opacity-[0.10] pointer-events-none" aria-hidden />
      <div className="shell grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeader
            index="09 / BRIEF"
            eyebrow="REQUEST THE TECHNICAL BRIEF"
            title={
              <>
                Request the DROM
                <span className="block text-text-secondary">Technical Brief.</span>
              </>
            }
            intro={
              <>
                For detailed specifications, integration requirements and deployment context,
                request the technical brief. Distribution is reviewed on a per-request basis.
              </>
            }
          />

          <div className="mt-10 space-y-4">
            <Row label="DELIVERY" value="DIGITAL · ON REVIEW" />
            <Row label="LANGUAGE" value="EN / RO" />
            <Row label="RESPONSE TARGET" value="2–5 BUSINESS DAYS" />
            <Row label="CONFIDENTIALITY" value="HANDLED ON REQUEST" />
          </div>
        </div>

        <div className="lg:col-span-7">
          <form
            className="panel hud-corner p-6 md:p-8"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            aria-label="Request the DROM technical brief"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="label">BRIEF REQUEST FORM</span>
              <span className="micro flex items-center gap-2 text-text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-signal-cyan animate-pulse-dim" />
                SECURE
              </span>
            </div>

            {submitted ? (
              <div className="py-12 text-center">
                <span className="micro text-signal-cyan">REQUEST RECEIVED</span>
                <h3 className="mt-3 font-display text-h4 text-text-primary">
                  Thank you. The product team will be in contact.
                </h3>
                <p className="mt-3 text-body text-text-secondary max-w-prose mx-auto">
                  Your request has been logged for review. A response will follow with the
                  technical brief and any next steps.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="NAME" name="name" required />
                  <Field label="ORGANIZATION" name="org" required />
                  <Field label="ROLE" name="role" />
                  <Field label="EMAIL" name="email" type="email" required />
                  <Select label="AREA OF INTEREST" name="area" options={AREAS} />
                  <Field label="COUNTRY" name="country" />
                </div>

                <Field
                  label="MESSAGE"
                  name="message"
                  textarea
                  className="mt-5"
                  placeholder="Briefly describe the evaluation context."
                />

                <div className="mt-7 flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-4">
                  <p className="micro text-text-muted max-w-md">
                    BY SUBMITTING, YOU ACKNOWLEDGE THIS IS A REQUEST. ACCESS TO THE TECHNICAL
                    BRIEF IS REVIEWED ON A PER-CASE BASIS.
                  </p>
                  <div className="flex gap-3">
                    <button type="button" className="btn-ghost">
                      Contact Product Team
                    </button>
                    <button type="submit" className="btn-primary">
                      Request Technical Brief
                    </button>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle py-3">
      <span className="micro text-text-muted">{label}</span>
      <span className="font-mono text-label text-text-primary">{value}</span>
    </div>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement> {
  label: string;
  textarea?: boolean;
  className?: string;
}

function Field({ label, name, textarea = false, className = '', ...rest }: FieldProps) {
  const id = `field-${name}`;
  const cn =
    'w-full bg-ink-950/70 border border-border-blue/40 focus:border-signal-blue/80 ' +
    'focus:outline-none px-3 py-2.5 font-sans text-body text-text-primary placeholder:text-text-muted ' +
    'rounded-sm transition-colors';
  return (
    <div className={className}>
      <label htmlFor={id} className="micro text-text-muted mb-2 block">
        {label}
        {rest.required && <span className="text-signal-amber"> *</span>}
      </label>
      {textarea ? (
        <textarea id={id} name={name} rows={4} className={cn} {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input id={id} name={name} className={cn} {...rest} />
      )}
    </div>
  );
}

function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  const id = `field-${name}`;
  return (
    <div>
      <label htmlFor={id} className="micro text-text-muted mb-2 block">
        {label}
      </label>
      <select
        id={id}
        name={name}
        className="w-full bg-ink-950/70 border border-border-blue/40 focus:border-signal-blue/80
          focus:outline-none px-3 py-2.5 font-sans text-body text-text-primary rounded-sm
          transition-colors"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-ink-900">
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
