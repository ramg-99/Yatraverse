/**
 * Group Expense Settlement Engine
 * Calculates net balances and minimal debt resolution transactions.
 */

/**
 * @typedef {Object} MemberBalance
 * @property {string} userId
 * @property {number} totalPaid - Amount this member paid out of pocket
 * @property {number} totalShare - Amount this member owes based on splits
 * @property {number} netBalance - Positive: gets back; Negative: owes
 */

/**
 * @typedef {Object} SettlementTransfer
 * @property {string} id
 * @property {string} fromUserId - Debtor (owes money)
 * @property {string} toUserId - Creditor (receives money)
 * @property {number} amount - Amount to transfer
 * @property {boolean} isSettled - Whether settled
 */

/**
 * Calculate balances for all members in a trip
 * @param {Array} members
 * @param {Array} expenses
 * @param {Array} splits
 * @returns {Record<string, MemberBalance>}
 */
export function calculateMemberBalances(members = [], expenses = [], splits = []) {
  /** @type {Record<string, MemberBalance>} */
  const balances = {};

  // Initialize for all members
  members.forEach((m) => {
    const uid = m.user_id || m.userId;
    balances[uid] = {
      userId: uid,
      totalPaid: 0,
      totalShare: 0,
      netBalance: 0,
    };
  });

  // Sum total paid by each user
  expenses.forEach((exp) => {
    const payerId = exp.paid_by || exp.paidById;
    if (payerId) {
      if (!balances[payerId]) {
        balances[payerId] = { userId: payerId, totalPaid: 0, totalShare: 0, netBalance: 0 };
      }
      balances[payerId].totalPaid += Number(exp.amount) || 0;
    }
  });

  // Sum total share owed by each user from splits
  splits.forEach((sp) => {
    const uid = sp.user_id || sp.userId;
    if (uid) {
      if (!balances[uid]) {
        balances[uid] = { userId: uid, totalPaid: 0, totalShare: 0, netBalance: 0 };
      }
      // Only count unsettled shares toward current debt balance
      if (!sp.is_settled && !sp.isSettled) {
        balances[uid].totalShare += Number(sp.share) || 0;
      }
    }
  });

  // Calculate net balances
  Object.values(balances).forEach((b) => {
    b.netBalance = Math.round((b.totalPaid - b.totalShare) * 100) / 100;
  });

  return balances;
}

/**
 * Calculate the minimal transactions to settle all debts (Greedy approach)
 * @param {Record<string, MemberBalance>} balances
 * @returns {SettlementTransfer[]}
 */
export function calculateSettlementTransfers(balances = {}) {
  // Separate into debtors (< 0) and creditors (> 0)
  const debtors = [];
  const creditors = [];

  Object.values(balances).forEach((b) => {
    if (b.netBalance < -0.01) {
      debtors.push({ userId: b.userId, amount: Math.abs(b.netBalance) });
    } else if (b.netBalance > 0.01) {
      creditors.push({ userId: b.userId, amount: b.netBalance });
    }
  });

  // Sort descending
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transfers = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settleAmount = Math.min(debtor.amount, creditor.amount);

    if (settleAmount > 0.01) {
      transfers.push({
        id: `st_${debtor.userId}_${creditor.userId}_${Math.round(settleAmount)}`,
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount: Math.round(settleAmount),
        isSettled: false,
      });
    }

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount <= 0.01) dIdx++;
    if (creditor.amount <= 0.01) cIdx++;
  }

  return transfers;
}
