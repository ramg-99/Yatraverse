import { Button } from '@/components/ui/button.jsx';

/**
 * @param {{ open: boolean, title: string, body: string, confirmLabel?: string, onConfirm: () => void, onClose: () => void }} props
 */
export function ConfirmDialog({ open, title, body, confirmLabel = 'Delete', onConfirm, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="glass max-w-md rounded-2xl p-6">
        <h2 className="font-display text-2xl">{title}</h2>
        <p className="mt-2 text-sm text-muted">{body}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Keep it
          </Button>
          <Button variant="coral" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
