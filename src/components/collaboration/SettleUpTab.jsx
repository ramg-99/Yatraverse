import { useState, useMemo } from 'react';
import {
  Users,
  PlusCircle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Receipt,
  Sparkles,
  DollarSign,
  Clock,
  Check,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button.jsx';
import { useWorldStore } from '@/store/useWorldStore.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { calculateMemberBalances, calculateSettlementTransfers } from '@/lib/settlement.js';
import { money } from '@/lib/utils.js';
import { onImgError } from '@/lib/image.js';
import { LogExpenseModal } from './LogExpenseModal.jsx';

export function SettleUpTab({ tripId }) {
  const world = useWorldStore();
  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?.id || 'u_demo';

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Group members for this trip
  const tripMembers = useMemo(() => {
    return (world.tripMembers || []).filter((m) => m.trip_id === tripId);
  }, [world.tripMembers, tripId]);

  // All expenses for this trip that have paid_by or are shared
  const tripExpenses = useMemo(() => {
    return (world.expenses || []).filter((e) => e.trip_id === tripId && e.paid_by);
  }, [world.expenses, tripId]);

  // Splits for these expenses
  const expIds = useMemo(() => tripExpenses.map((e) => e.id), [tripExpenses]);
  const tripSplits = useMemo(() => {
    return (world.expenseSplits || []).filter((sp) => expIds.includes(sp.expense_id));
  }, [world.expenseSplits, expIds]);

  // Calculate balances and minimal transfers
  const balances = useMemo(() => {
    return calculateMemberBalances(tripMembers, tripExpenses, tripSplits);
  }, [tripMembers, tripExpenses, tripSplits]);

  const transfers = useMemo(() => {
    return calculateSettlementTransfers(balances);
  }, [balances]);

  // Overall totals
  const totalShared = useMemo(() => {
    return tripExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [tripExpenses]);

  const settledCount = tripSplits.filter((s) => s.is_settled).length;
  const totalSplitsCount = tripSplits.length;
  const settlementPercentage = totalSplitsCount > 0 ? Math.round((settledCount / totalSplitsCount) * 100) : 100;

  const myBalance = balances[currentUserId]?.netBalance || 0;

  const handleSettleTransfer = (transfer) => {
    world.settleDebtBetween(tripId, transfer.fromUserId, transfer.toUserId);
    const debtor = world.users.find((u) => u.id === transfer.fromUserId)?.name || 'Member';
    const creditor = world.users.find((u) => u.id === transfer.toUserId)?.name || 'Member';
    toast.success(`Payment verified! ${debtor} paid ₹${transfer.amount.toLocaleString()} to ${creditor}.`);
  };

  const handleSettleAll = () => {
    transfers.forEach((t) => {
      world.settleDebtBetween(tripId, t.fromUserId, t.toUserId);
    });
    toast.success('All debts in the crew have been marked as settled! 🎉');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Shared Expense */}
        <div className="glass rounded-3xl border border-border/70 p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="font-mono uppercase tracking-wider font-bold">Total Group Spend</span>
            <Receipt className="h-4 w-4 text-saffron" />
          </div>
          <p className="font-display text-3xl font-bold text-parchment mt-2">
            ₹{totalShared.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted mt-1">
            Across {tripExpenses.length} logged collaborative expenses
          </p>
        </div>

        {/* Settlement Progress */}
        <div className="glass rounded-3xl border border-border/70 p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="font-mono uppercase tracking-wider font-bold">Settlement Progress</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-display text-3xl font-bold text-emerald-400">
              {settlementPercentage}%
            </span>
            <span className="text-xs text-muted">shares cleared</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${settlementPercentage}%` }}
            />
          </div>
        </div>

        {/* My Position */}
        <div className="glass rounded-3xl border border-border/70 p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="font-mono uppercase tracking-wider font-bold">Your Net Position</span>
            <Users className="h-4 w-4 text-aurora" />
          </div>
          <div className="mt-2">
            {myBalance > 0 ? (
              <p className="font-display text-3xl font-bold text-emerald-400">
                +₹{myBalance.toLocaleString()}
              </p>
            ) : myBalance < 0 ? (
              <p className="font-display text-3xl font-bold text-coral">
                -₹{Math.abs(myBalance).toLocaleString()}
              </p>
            ) : (
              <p className="font-display text-3xl font-bold text-parchment">
                ₹0
              </p>
            )}
          </div>
          <p className="text-[11px] text-muted mt-1 font-medium">
            {myBalance > 0
              ? '🟢 Crew owes you money back'
              : myBalance < 0
              ? '🔴 You have outstanding shares to pay'
              : '⚪ You are all squared up with the crew'}
          </p>
        </div>
      </div>

      {/* 2. Action Command Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface/50 border border-border/70 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-bold text-parchment">
            Crew Settlement Matrix
          </span>
          <span className="rounded-full bg-saffron/15 text-saffron px-2.5 py-0.5 text-xs font-mono font-bold">
            {transfers.length} pending transfer{transfers.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {transfers.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSettleAll}
              className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 font-semibold"
            >
              <Check className="mr-1.5 h-3.5 w-3.5 stroke-[2.5]" />
              Settle All ({transfers.length})
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => setIsLogModalOpen(true)}
            className="bg-saffron text-slate-950 font-bold hover:bg-saffron/90 shadow-glow"
          >
            <PlusCircle className="mr-1.5 h-3.5 w-3.5 stroke-[2.5]" />
            Log Shared Expense
          </Button>
        </div>
      </div>

      {/* 3. Who Owes Whom (Optimal Minimal Settlements) */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted font-bold flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-saffron" />
          Optimal Debt Clearance ("Who Owes Whom")
        </h3>

        {transfers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-500/5 p-8 text-center space-y-2">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
            <p className="font-display text-lg font-bold text-parchment">All Crew Debts Settled!</p>
            <p className="text-xs text-muted max-w-md mx-auto">
              Everyone is squared up. Log a new shared dinner, taxi ride, or boat tour to track new splits.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transfers.map((transfer) => {
              const debtor = world.users.find((u) => u.id === transfer.fromUserId) || {
                name: 'Explorer',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128',
              };
              const creditor = world.users.find((u) => u.id === transfer.toUserId) || {
                name: 'Explorer',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128',
              };

              const isMeDebtor = debtor.id === currentUserId;
              const isMeCreditor = creditor.id === currentUserId;

              return (
                <div
                  key={transfer.id}
                  className="glass group relative overflow-hidden rounded-2xl border border-border/80 p-4 transition-all hover:border-saffron/50 hover:shadow-lg flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Debtor */}
                    <div className="flex flex-col items-center shrink-0">
                      <img
                        src={debtor.avatar}
                        alt={debtor.name}
                        onError={(e) => onImgError(e, debtor.name)}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-coral/40"
                      />
                      <span className="text-[11px] font-semibold text-parchment mt-1 max-w-[70px] truncate text-center">
                        {debtor.name.split(' ')[0]} {isMeDebtor ? '(You)' : ''}
                      </span>
                    </div>

                    {/* Arrow with Amount */}
                    <div className="flex flex-col items-center px-2">
                      <span className="font-mono text-xs font-bold text-saffron">
                        ₹{transfer.amount.toLocaleString()}
                      </span>
                      <div className="flex items-center text-muted">
                        <span className="h-0.5 w-8 bg-border" />
                        <ArrowRight className="h-3.5 w-3.5 text-saffron -ml-1 stroke-[3]" />
                      </div>
                      <span className="text-[9px] uppercase font-mono text-muted tracking-wider">owes</span>
                    </div>

                    {/* Creditor */}
                    <div className="flex flex-col items-center shrink-0">
                      <img
                        src={creditor.avatar}
                        alt={creditor.name}
                        onError={(e) => onImgError(e, creditor.name)}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/40"
                      />
                      <span className="text-[11px] font-semibold text-parchment mt-1 max-w-[70px] truncate text-center">
                        {creditor.name.split(' ')[0]} {isMeCreditor ? '(You)' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Settle Action Button */}
                  <Button
                    size="sm"
                    onClick={() => handleSettleTransfer(transfer)}
                    className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs shadow-xs"
                  >
                    <Check className="mr-1 h-3.5 w-3.5 stroke-[3]" />
                    Settle
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Member Balances Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted font-bold">
          Crew Financial Summary
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {tripMembers.map((member) => {
            const u = world.users.find((usr) => usr.id === member.user_id) || {
              name: 'Crew Member',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128',
            };
            const bal = balances[member.user_id] || { totalPaid: 0, totalShare: 0, netBalance: 0 };

            return (
              <div
                key={member.id}
                className="glass rounded-2xl border border-border/70 p-4 space-y-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    onError={(e) => onImgError(e, u.name)}
                    className="h-9 w-9 rounded-full object-cover ring-1 ring-border"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-parchment truncate">{u.name}</p>
                    <span className="text-[10px] text-muted font-mono uppercase">{member.role}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs border-t border-border/40 pt-2 font-mono">
                  <div className="flex justify-between text-muted text-[11px]">
                    <span>Paid Out:</span>
                    <span>₹{bal.totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted text-[11px]">
                    <span>Share Owed:</span>
                    <span>₹{bal.totalShare.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t border-border/30">
                    <span>Balance:</span>
                    <span
                      className={
                        bal.netBalance > 0
                          ? 'text-emerald-400'
                          : bal.netBalance < 0
                          ? 'text-coral'
                          : 'text-muted'
                      }
                    >
                      {bal.netBalance > 0 ? `+₹${bal.netBalance.toLocaleString()}` : bal.netBalance < 0 ? `-₹${Math.abs(bal.netBalance).toLocaleString()}` : '₹0'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Detailed Shared Expenses Ledger */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted font-bold">
          Logged Shared Expenses Ledger ({tripExpenses.length})
        </h3>

        {tripExpenses.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/40 p-6 text-center text-xs text-muted">
            No group expenses logged yet. Click "Log Shared Expense" above to record activities, meals, or rides.
          </p>
        ) : (
          <div className="space-y-2">
            {tripExpenses.map((exp) => {
              const payer = world.users.find((u) => u.id === exp.paid_by) || { name: 'Member' };
              const splits = tripSplits.filter((s) => s.expense_id === exp.id);
              const allSplitsSettled = splits.every((s) => s.is_settled);

              return (
                <div
                  key={exp.id}
                  className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 p-3.5 text-xs transition-colors hover:border-border/80"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 font-mono text-sm font-bold text-saffron">
                      ₹
                    </span>
                    <div>
                      <p className="font-semibold text-parchment">
                        {exp.notes || 'Shared Expense'}
                      </p>
                      <p className="text-[10px] text-muted font-mono flex items-center gap-1.5 mt-0.5">
                        <span>Paid by <strong className="text-parchment">{payer.name}</strong></span>
                        <span>·</span>
                        <span>{exp.date}</span>
                        <span>·</span>
                        <span className="uppercase text-saffron">{exp.category}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-parchment">
                        ₹{Number(exp.amount).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted">
                        Split {splits.length} ways (₹{Math.round(exp.amount / Math.max(1, splits.length)).toLocaleString()} ea)
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${
                        allSplitsSettled
                          ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                          : 'border border-saffron/40 bg-saffron/15 text-saffron'
                      }`}
                    >
                      {allSplitsSettled ? '✓ Cleared' : '● Open Splits'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Expense Modal */}
      <LogExpenseModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        tripId={tripId}
      />
    </div>
  );
}
