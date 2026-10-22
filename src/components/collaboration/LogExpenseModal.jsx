import { useState } from 'react';
import { PlusCircle, DollarSign, Users, X, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button.jsx';
import { Input, Label } from '@/components/ui/input.jsx';
import { useWorldStore } from '@/store/useWorldStore.js';
import { useAuthStore } from '@/store/useAuthStore.js';

export function LogExpenseModal({ isOpen, onClose, tripId }) {
  const world = useWorldStore();
  const currentUser = useAuthStore((s) => s.user);

  const tripMembers = (world.tripMembers || []).filter((m) => m.trip_id === tripId);
  const tripStops = world.stops.filter((s) => s.trip_id === tripId);
  const stopIds = tripStops.map((s) => s.id);
  const tripStopActs = world.stopActivities.filter((sa) => stopIds.includes(sa.stop_id));

  const [category, setCategory] = useState('activities');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(currentUser?.id || 'u_demo');
  const [stopActivityId, setStopActivityId] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState(
    tripMembers.map((m) => m.user_id)
  );

  if (!isOpen) return null;

  const handleToggleMember = (uid) => {
    if (selectedMemberIds.includes(uid)) {
      if (selectedMemberIds.length === 1) {
        toast.error('Expense must be split with at least 1 person');
        return;
      }
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== uid));
    } else {
      setSelectedMemberIds([...selectedMemberIds, uid]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      toast.error('Please enter a valid expense amount');
      return;
    }

    world.addExpenseWithSplits({
      tripId,
      category,
      amount: num,
      paidBy,
      stopActivityId: stopActivityId || null,
      notes: notes || 'Group Activity Expense',
      date: new Date().toISOString().split('T')[0],
      memberIds: selectedMemberIds,
    });

    toast.success(`Logged ₹${num.toLocaleString()}! Split between ${selectedMemberIds.length} members.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass relative w-full max-w-lg rounded-3xl border border-border/80 bg-surface/95 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-muted hover:bg-white/10 hover:text-parchment transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-saffron/15 text-saffron border border-saffron/30">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-parchment">
              Log Shared Expense
            </h2>
            <p className="text-xs text-muted">
              Record who paid and auto-calculate who owes whom
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="expAmount">Total Amount (₹)</Label>
              <Input
                id="expAmount"
                type="number"
                placeholder="e.g. 4500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 font-mono font-bold text-base"
                required
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="expCategory">Category</Label>
              <select
                id="expCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-border/60 bg-surface/80 px-3 text-xs font-semibold text-parchment outline-none"
              >
                <option value="activities">Activities & Experiences</option>
                <option value="meals">Food & Drinks</option>
                <option value="transport">Transport & Hops</option>
                <option value="stay">Accommodations</option>
              </select>
            </div>
          </div>

          {/* Activity Link (optional) */}
          <div>
            <Label htmlFor="linkedActivity">Linked Activity (Optional)</Label>
            <select
              id="linkedActivity"
              value={stopActivityId}
              onChange={(e) => {
                setStopActivityId(e.target.value);
                const selected = tripStopActs.find((sa) => sa.id === e.target.value);
                if (selected) {
                  const act = world.activities.find((a) => a.id === selected.activity_id);
                  if (act && !notes) setNotes(act.name);
                }
              }}
              className="mt-1 h-10 w-full rounded-xl border border-border/60 bg-surface/80 px-3 text-xs text-parchment outline-none"
            >
              <option value="">General Trip Expense (No specific activity)</option>
              {tripStopActs.map((sa) => {
                const act = world.activities.find((a) => a.id === sa.activity_id);
                return (
                  <option key={sa.id} value={sa.id}>
                    {act?.name || 'Experience'} ({sa.day_date})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="expNotes">Description / Notes</Label>
            <Input
              id="expNotes"
              type="text"
              placeholder="e.g. Sunset Ferry tickets & Snacks"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Paid By */}
          <div>
            <Label htmlFor="expPaidBy">Who Paid?</Label>
            <select
              id="expPaidBy"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-border/60 bg-surface/80 px-3 text-xs font-semibold text-saffron outline-none"
            >
              {tripMembers.map((m) => {
                const u = world.users.find((usr) => usr.id === m.user_id) || { name: 'Member' };
                return (
                  <option key={m.user_id} value={m.user_id}>
                    {u.name} {u.id === currentUser?.id ? '(You)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Split with checkboxes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Split With ({selectedMemberIds.length} members)</Label>
              {amount && selectedMemberIds.length > 0 && (
                <span className="font-mono text-xs font-bold text-aurora">
                  ₹{Math.round(parseFloat(amount) / selectedMemberIds.length).toLocaleString()} / person
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {tripMembers.map((m) => {
                const u = world.users.find((usr) => usr.id === m.user_id) || { name: 'Member' };
                const isChecked = selectedMemberIds.includes(m.user_id);

                return (
                  <button
                    key={m.user_id}
                    type="button"
                    onClick={() => handleToggleMember(m.user_id)}
                    className={`flex items-center gap-2 rounded-xl border p-2 text-left text-xs transition-colors cursor-pointer ${
                      isChecked
                        ? 'border-saffron/50 bg-saffron/10 text-parchment font-semibold'
                        : 'border-border/40 bg-surface/40 text-muted opacity-60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="accent-amber-500 rounded"
                    />
                    <span className="truncate">{u.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex justify-end gap-2.5 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-saffron text-slate-950 font-bold hover:bg-saffron/90">
              <PlusCircle className="mr-1.5 h-3.5 w-3.5 stroke-[2.5]" />
              Save & Split
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
