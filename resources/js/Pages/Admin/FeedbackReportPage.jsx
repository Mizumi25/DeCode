



// Admin/FeedbackReportPage.jsx
import { MessageSquare } from 'lucide-react';

export default function FeedbackReportPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-muted)] p-8 text-[var(--color-text)]">
      <h1 className="text-[var(--fs-xl)] font-semibold mb-6 flex items-center gap-2">
        <MessageSquare size={24} /> Feedback & Reports
      </h1>
      <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-md)] shadow-md">
        <ul className="space-y-4">
          <li className="border-b border-[var(--color-border)] pb-4">
            <p className="text-[var(--fs-base)] font-medium">"Drag feature sometimes doesn’t align properly."</p>
            <p className="text-[var(--color-text-muted)] text-[var(--fs-sm)]">Submitted by: alex@example.com</p>
          </li>
          <li className="border-b border-[var(--color-border)] pb-4">
            <p className="text-[var(--fs-base)] font-medium">"Love the UI, but the preview lag is real."</p>
            <p className="text-[var(--color-text-muted)] text-[var(--fs-sm)]">Submitted by: kaye@example.com</p>
          </li>
        </ul>
      </div>
    </div>
  );
}