# KampusPay — Security Self-Assessment Report

1. Executive Summary
KampusPay is an AI financial agent that executes financial actions within a **sandbox environment**. Because Kai acts as a financial participant, security and compliance are treated as foundational design principles.

Scope Disclaimer: All transfers are simulated against synthetic accounts. The prototype is **not ready for real-money transactions**. This report evaluates architectural controls designed to prevent AI misbehavior.

* Pass Rate: 100% (15/15 test cases)
* Permission Tiers: 4 (T0–T3)
* Audit Trail: Application-level append-only

---

2. Threat Model
| Threat | Description | Mitigation |
| :--- | :--- | :--- |
| T1: Prompt Injection | Coercing the LLM into ignoring rules. | **Deterministic Risk Gate.** Handled by Python/PostgreSQL, not the LLM. |
| T2: Unauthorised Transfer | Moving funds to an unintended beneficiary. | Per-tx limits, new-beneficiary detection, step-up confirmation. |
| T3: Replay Attacks | Duplicating a valid transfer request. | SHA-256 idempotency keys. |
| T4: Race Conditions | Concurrent requests draining an account. | PostgreSQL `SELECT ... FOR UPDATE` lock. |
| T5: Credential Leakage | Exposing API keys in source control. | `.gitignore`, GitHub secret scanning, immediate rotation. |

---

3. Controls Inventory

3.1 Transaction & Input Validation
Every transfer passes through strict validation before funds move:
1. User Validation: Sender and recipient must exist.
2. Amount Validation: Must be positive and ≤ balance.
3. Currency Validation:** Sender and recipient must match currency.
4. Beneficiary Validation: Checked against prior transactions.
5. Server-Side Enforcement:** Re-validated inside the PostgreSQL RPC.

3.2 Risk Gate Precedence
The risk gate uses ordered precedence. The first matching condition dictates the outcome.
1. Missing account / insufficient funds / cross-currency → Rejected
2. Risk Score ≥ 70 → Blocked (Hard Limit)
3. Risk Score 30–69 → Awaiting Confirmation (Step-up)
4. Risk Score < 30 and all validation passes → Auto-execute

Score Rules:
* Amount > 5,000: +40
* First-time beneficiary: +20
* New beneficiary + amount > 1,000: +15

3.3 Permission-Tier Implementation
KampusPay enforces a four-tier role model:

| Tier | Role | Capabilities | Restrictions |
| :--- | :--- | :--- | :--- |
| T0 | Observer | View balances, logs | No AI actions, no transfers |
| T1 | Student (Basic) | Balance lookup, FX analysis | No transfers permitted |
| T2 | Student (Verified) | Full transaction capability | Per-tx limit 5,000; confirmation for risk ≥ 30 |
| T3 | Admin / Governance | Override blocks, manage users | All actions logged with elevated scrutiny |

Note: The demo account ("Aiman") operates at T2.

### 3.4 Audit Trail — Application-Level Append-Only
The audit trail is application-level append-only, not cryptographically immutable. Our code never issues `UPDATE` or `DELETE` on `audit_log`. However, a DB admin could alter rows. Production hardening requires daily SHA-256 signed exports.

---

## 4. Incident Response — Credential Exposure
* Trigger: A git commit accidentally included the `.env` file.
* Detection: GitHub secret scanning blocked the push.
* Remediation: `git filter-branch` removed the file; API key revoked and regenerated.
* Time to Resolve: Under 15 minutes.

---

## 5. Known Risk List & Limitations
| Risk | Severity | Impact | Mitigation / Status |
| :--- | :--- | :--- | :--- |
| Sandbox Only| High | Cannot handle real money | Disclosure: Prototype only. |
| Cross-Currency | Medium | Only same-currency transfers work | RPC rejects mismatched currencies. |
| App-level Log | Medium | Not cryptographically immutable | See §3.4. |
| Prompt Injection | High | Coercing the AI | Mitigated by deterministic gate. |
| In-Memory Sessions | Medium | Lost on restart | Acceptable for demo. |
| No Auth Login | Medium | Single-user demo mode | Role-based identity exists. |

---
Submitted by: The FinMinds · October 2026