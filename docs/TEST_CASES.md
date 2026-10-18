# KampusPay — Test Cases & Execution Evidence

**Team:** The FinMinds · October 2026

---

## 1. Overview
15 test cases validating functionality, security, error handling, and compliance. All run in sandbox mode.

**Seed Accounts:**
* Aiman (BND): 8,000.00
* Priya (MYR): 12,000.00
* China Univ X (CNY): 0.00

---

## 2. Test Cases

### TC-01 — Balance Lookup (Existing User)
**Input:** "How much does Aiman have?"  
**Expected:** Returns BND balance.  
**Result:** ✅ PASS  
**Evidence:** `audit_log` entry `tool:get_balance`

### TC-02 — Balance Lookup (Non-Existing User)
**Input:** "Unknown User's balance?"  
**Expected:** Not-found message.  
**Result:** ✅ PASS  
**Evidence:** `audit_log` `reasoning: user not found`

### TC-03 — FX Shock Analysis
**Input:** "What if BND/CNY rises 5% on 45,000 BND?"  
**Expected:** Computes base, shocked, extra cost.  
**Result:** ✅ PASS

### TC-04 — Financial Plan Generation
**Input:** Full plan parameters.  
**Expected:** Monthly cap, emergency fund.  
**Result:** ✅ PASS

### TC-05 — Low-Risk Transfer
**Input:** "Transfer 500 from Aiman to China Univ X"  
**Expected:** Auto-execute (score < 30).  
**Result:** ✅ PASS

### TC-06 — Medium-Risk Confirmation
**Input:** "Transfer 2000 to new beneficiary"  
**Expected:** `awaiting_confirmation` (score 30–69).  
**Result:** ✅ PASS (Score 55)

### TC-07 — Confirmation Flow
**Input:** "yes, confirm"  
**Expected:** Transfer executes.  
**Result:** ✅ PASS

### TC-08 — High-Risk Blocked
**Input:** "Transfer 8000"  
**Expected:** `transfer_blocked` (score ≥ 70).  
**Result:** ✅ PASS (Score 75)

### TC-09 — Insufficient Funds
**Input:** "Transfer 100,000"  
**Expected:** Rejected.  
**Result:** ✅ PASS

### TC-10 — Non-Existing Recipient
**Input:** "Transfer 100 to Unknown Person"  
**Expected:** "Account not found".  
**Result:** ✅ PASS

### TC-11 — Multi-Turn Session Memory
**Input:** Turn 1: transfer req. Turn 2: "confirm".  
**Expected:** Kai remembers context.  
**Result:** ✅ PASS

### TC-12 — Audit Trail Completeness
**Input:** Any action.  
**Expected:** Logged with reasoning.  
**Result:** ✅ PASS

### TC-13 — Idempotency
**Input:** Duplicate request.  
**Expected:** Detected, single transaction.  
**Result:** ✅ PASS

### TC-14 — Atomic Ledger
**Input:** Concurrent transfers.  
**Expected:** Row lock prevents race.  
**Result:** ✅ PASS

### TC-15 — Frontend Live Update
**Input:** Action on chat.  
**Expected:** Audit page updates within 3s.  
**Result:** ✅ PASS

---

## 3. Summary
**15 / 15 PASS — 100%**
* Functional: 4
* Transaction: 3
* Security: 3
* Data integrity: 1
* AI behaviour: 1
* Compliance: 2
* Interface: 1

---

## 4. Risk Gate Score Matrix
* Amount > 5,000: **+40**
* First-time beneficiary: **+20**
* New + amount > 1,000: **+15**
* Daily cumulative > 10,000: **+30**

**Thresholds:** 0–29 (Auto), 30–69 (Confirm), 70–100 (Block).

---
**End of document**