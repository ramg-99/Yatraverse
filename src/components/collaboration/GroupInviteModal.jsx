import { useState } from 'react';
import { Copy, Check, Users, UserPlus, Shield, X, Sparkles, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button.jsx';
import { useWorldStore } from '@/store/useWorldStore.js';
import { useAuthStore } from '@/store/useAuthStore.js';

export function GroupInviteModal({ isOpen, onClose, trip }) {
  const [copied, setCopied] = useState(false);
  const world = useWorldStore();
  const currentUser = useAuthStore((s) => s.user);
  const tripMembers = (world.tripMembers || []).filter((m) => m.trip_id === trip?.id);

  if (!isOpen || !trip) return null;

  const joinUrl = `${window.location.origin}/trips/${trip.id}?join=true`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(joinUrl);
    setCopied(true);
    toast.success('Join link copied to clipboard! Share it with your friends.');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleQuickAdd = (user) => {
    world.addMemberToTrip(trip.id, user.id, 'member');
    toast.success(`${user.name} joined the expedition!`);
  };

  // Find users not yet in this trip
  const existingUids = tripMembers.map((m) => m.user_id);
  const availableUsers = (world.users || []).filter((u) => !existingUids.includes(u.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
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

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-saffron/15 text-saffron border border-saffron/30">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-parchment">
              Trip Crew & Join Link
            </h2>
            <p className="text-xs text-muted">
              Invite friends to vote on activities and auto-split expenses
            </p>
          </div>
        </div>

        {/* Join Link Bar */}
        <div className="mb-6 rounded-2xl border border-border/70 bg-ink/60 p-3.5 space-y-2">
          <label className="text-[10px] uppercase font-mono tracking-wider text-muted font-bold flex items-center gap-1.5">
            <Link2 className="h-3 w-3 text-saffron" /> Shareable Invite Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={joinUrl}
              className="flex-1 rounded-xl border border-border/50 bg-surface/50 px-3 py-2 text-xs font-mono text-parchment truncate select-all outline-none"
            />
            <Button
              size="sm"
              onClick={handleCopy}
              className="bg-saffron text-slate-950 font-bold shrink-0 hover:bg-saffron/90"
            >
              {copied ? (
                <>
                  <Check className="mr-1 h-3.5 w-3.5 stroke-[3]" /> Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-3.5 w-3.5" /> Copy Link
                </>
              )}
            </Button>
          </div>
          <p className="text-[11px] text-muted">
            Anyone with this link can join your itinerary crew, vote 👍/👎 on stops, and log shared expenses.
          </p>
        </div>

        {/* Current Crew Members */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono uppercase tracking-wider text-muted font-bold">
              Active Crew ({tripMembers.length})
            </p>
            <span className="text-[11px] text-aurora font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Realtime Collaborators
            </span>
          </div>

          <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
            {tripMembers.map((member) => {
              const u = (world.users || []).find((usr) => usr.id === member.user_id) || {
                name: 'Explorer',
                email: 'collaborator@yatraverse.app',
              };
              const isMe = u.id === currentUser?.id;
              const isOwner = member.role === 'owner' || trip.user_id === u.id;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-2xl border border-border/40 bg-surface/40 p-2.5 text-xs transition-colors hover:border-border/70"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128'}
                      alt={u.name}
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-border/80"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-parchment">{u.name}</span>
                        {isMe && (
                          <span className="rounded bg-white/10 px-1 py-0.2 font-mono text-[9px] text-muted">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted font-mono">{u.email}</p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                      isOwner
                        ? 'border border-saffron/40 bg-saffron/15 text-saffron'
                        : 'border border-border/60 bg-white/5 text-muted'
                    }`}
                  >
                    {isOwner ? '👑 Owner' : member.role}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Invite Friends Section */}
        {availableUsers.length > 0 && (
          <div className="border-t border-border/40 pt-4">
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted mb-2 font-bold">
              Simulate Adding Demo Friends
            </p>
            <div className="flex flex-wrap gap-2">
              {availableUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickAdd(u)}
                  className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-white/5 px-2.5 py-1 text-xs text-muted hover:border-saffron hover:text-parchment hover:bg-saffron/10 transition-all cursor-pointer"
                >
                  <UserPlus className="h-3 w-3 text-saffron" />
                  <span>Add {u.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
