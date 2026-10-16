# KampusPay — Security Self-Assessment Report

**Team:** The FinMinds
**Agent:** Kai (Kaya)
**Topic:** C — Cross-border & Student Finance Assistant
**Competition:** 2026 8th FinTechathon · Shenzhen International FinTech Competition
**Version:** 1.0
**Date:** October 2026

---

## 1. Executive Summary

KampusPay is an AI financial agent that executes real financial actions within
a sandbox environment — planning, forecasting, and transferring funds on behalf
of international students. Because Kai is a **financial participant** rather
than a passive chatbot, security and compliance are foundational design
principles.

| Metric | Value |
|---|---|
| Test cases executed | 15 |
| Tests passing | 15 |
| Pass rate | 100% |
| Risk controls implemented | 8 |
| Hard blocks enforced | Yes (score ≥ 70) |
| Audit trail coverage | 100% of decisions |
| Permission tiers | 4 (T0–T3) |
| Known risks documented | 10 |
| Credentials rotated after exposure | Yes |

---

## 2. Threat Model

### T1 — Unauthorised Fund Transfer
**Mitigations:** Per-tx limit, daily limit, new-beneficiary detection,
step-up confirmation, hard block.

### T2 — Prompt Injection via LLM
**Mitigations:** Deterministic risk gate (Python, not LLM). Policy enforced
below the AI layer. Audit logging of every tool call.

### T3 — Duplicate / Replay Transfers
**Mitigations:** SHA-256 idempotency keys. Unique constraint on
`transactions.idempotency`.

### T4 — Race Conditions
**Mitigations:** PostgreSQL atomic RPC with `SELECT ... FOR UPDATE`.

### T5 — Credential Leakage
**Mitigations:** `.gitignore` excludes `.env`. GitHub secret scanning enabled
and exercised. Keys rotated after any suspected exposure.

### T6 — Compliance Gaps
**Mitigations:** Append-only `audit_log`. Every AI decision stored with
reasoning. Live audit viewer. Test case documentation.

---

## 3. Controls Inventory

### 3.1 Access Controls

| Control | Implementation |
|---|---|
| Role-based identity | `users.role` field |
| Session isolation | Per-session message history keyed by `session_id` |
| Sandbox mode | `accounts.is_sandbox = true` |

### 3.2 Transaction Controls

| Control | Implementation |
|---|---|
| Per-transaction limit | `if amount > 5000: risk_score += 40` |
| New beneficiary flag | History check |
| High-value new beneficiary | `amount > 1000 AND new_beneficiary` |
| Insufficient funds | Supabase RPC rejects |
| Unknown recipient | User lookup fails first |

### 3.3 Confirmation Controls

| Control | Implementation |
|---|---|
| Step-up confirmation | Score ≥ 30 → `awaiting_confirmation` |
| Hard block | Score ≥ 70 → `transfer_blocked` |
| Explicit user consent | `confirmed=True` on retry |

### 3.4 Integrity Controls

| Control | Implementation |
|---|---|
| Atomic transfer | Postgres RPC with row lock |
| Idempotency key | SHA-256 of transfer parameters |
| Rollback on error | `db.rollback()` in exception path |

### 3.5 Observability Controls

| Control | Implementation |
|---|---|
| Full audit trail | `audit_log` table |
| AI reasoning | `reasoning` column |
| Live monitoring | `/audit` page polls every 3s |

### 3.6 Permission-Tier Implementation

The competition brief explicitly requires a **permission-tier implementation**.
KampusPay enforces a **four-tier role model**:

| Tier | Role | Capabilities | Restrictions |
|---|---|---|---|
| **T0** | Observer | View balances, transactions, audit log | No AI actions, no transfers |
| **T1** | Student (Basic) | Balance lookup, FX analysis, plan generation | No transfers |
| **T2** | Student (Verified) | Full transaction capability | Per-tx limit 5,000; confirmation for risk ≥ 30 |
| **T3** | Admin / Governance | Override blocks, manage users, view full audit | All actions logged |

#### Tier Assignment in Demo

| Account | Tier | Rationale |
|---|---|---|
| Aiman (Brunei student) | T2 | Verified student with active tuition |
| Priya (Malaysia student) | T2 | Same |
| China Univ X | T0 (receiving only) | Can receive but not initiate |

#### Tier Elevation Rules

Elevation requires **all three**:
1. Explicit user action
2. Identity verification
3. Consent log entry

Failed elevations are rejected and logged.

#### Tier Restrictions in Code

| Rule | Location |
|---|---|
| T1 cannot initiate transfers | `agent.py` — `execute_transfer` guard |
| T2 per-tx limit | `agent.py` — risk scoring |
| T2 confirmation | `agent.py` — confirmation gate |
| T3 elevated logging | `log_action()` |
| T0 no actions | `api.py` — session filter |

#### Tier Change Audit

Every change writes to `audit_log` with actor, action, payload, reasoning, ts.

---

## 4. Risk Gate Specification

### 4.1 Scoring Rules

| Rule | Condition | Score | Reason Code |
|---|---|---|---|
| R1 | Amount > 5,000 | +40 | `exceeds_per_tx_limit(5000)` |
| R2 | First-time beneficiary | +20 | `new_beneficiary` |
| R3 | New beneficiary + amount > 1,000 | +15 | `new_beneficiary_high_value` |
| R4 | Daily cumulative > 10,000 | +30 | `exceeds_daily_limit` |

### 4.2 Decision Thresholds

| Score | Action |
|---|---|
| 0 – 29 | Auto-execute |
| 30 – 69 | Step-up confirmation |
| 70 – 100 | Hard block |

### 4.3 Worked Example — Blocked Transfer

8,000 BND to a new beneficiary:
- R1 fires (+40) → 40
- R2 fires (+20) → 60
- R3 fires (+15) → 75
- 75 ≥ 70 → **BLOCKED**

### 4.4 Worked Example — Medium Risk

2,000 BND to a new beneficiary:
- R2 fires (+20) → 20
- R3 fires (+15) → 35
- 30 ≤ 35 < 70 → **AWAITING CONFIRMATION**

---

## 5. Audit Trail Architecture

### 5.1 Log Schema

| Column | Type | Purpose |
|---|---|---|
| id | bigint | PK |
| actor | text | Who performed (user_id or "kai") |
| action | text | Action name |
| payload | jsonb | Structured data |
| reasoning | text | Human-readable explanation |
| ts | timestamptz | UTC timestamp, indexed |

### 5.2 Logged Events

- `user_message`
- `tool:get_balance`, `tool:fx_impact`, `tool:build_plan`
- `risk_gate`, `awaiting_confirmation`
- `transfer_blocked`, `transfer_executed`, `transfer_failed`
- `kai_reply`

### 5.3 Immutability

Append-only in application logic. No UPDATE or DELETE performed.

---

## 6. Compliance Alignment

| Framework | Principle | KampusPay |
|---|---|---|
| PCI-DSS | Access control, logging | Role-based, full audit |
| SOC 2 | Security, confidentiality | Deterministic risk gate |
| GDPR | Data minimisation | Synthetic sandbox data |
| MAS TRM | Transaction monitoring | Real-time scoring |
| PSD2 SCA | Strong auth | Step-up confirmation |
| AML/KYC | Beneficiary verification | New-beneficiary flagging |

---

## 7. Incident Response — Credential Exposure (Real Case)

### 7.1 Summary

| Field | Value |
|---|---|
| Date | October 2026 |
| Severity | High |
| Status | Resolved |
| Detection | GitHub secret scanning |
| Time to resolve | Under 15 minutes |

### 7.2 Timeline

1. **Trigger:** Dev commit accidentally included `.env`
2. **Detection:** GitHub secret scanner blocked the push
3. **Containment:** Push rejected — no secret reached public repo
4. **Remediation:** Removed from history, revoked key, regenerated, restarted
5. **Prevention:** `.gitignore` enforced, pre-commit hook recommended

### 7.3 Lessons

- Assume compromise
- Rotate immediately
- Document everything
- Automate detection

---

## 8. Known Risk List & Honest Disclosure

| Risk | Severity | Impact | Mitigation |
|---|---|---|---|
| Session storage in-memory | Medium | Lost on restart | Redis in production |
| Audit log not cryptographically signed | Medium | No non-repudiation | Signed storage |
| No user authentication | Medium | Any session can interact | Role-based identity exists |
| Single-region deployment | Low | No redundancy | Multi-region Supabase |
| LLM provider dependency | Low | Uptime coupling | Fallback model |
| Prompt injection | High | Attempted coercion | Deterministic risk gate below AI |
| Tier enforcement single-user | Medium | Untested multi-tenant | Documented §3.6 |
| No PII encryption at rest | Medium | Plaintext storage | Column encryption in prod |
| No rate limiting on /chat | Low | Potential DoS | Nginx rate limit |
| Idempotency only on transfers | Low | Duplicate chat messages | UX only |

---

## 9. Evidence Index

| Evidence | Location |
|---|---|
| Agent source code | github.com/farahaliaa/kampuspay-agent |
| Web source code | github.com/farahaliaa/kampuspay-web |
| Live audit trail | `/audit` page |
| Test cases | `docs/TEST_CASES.md` |
| Risk gate implementation | `agent.py` — `execute_transfer()` |
| Atomic ledger RPC | Supabase — `execute_transfer` function |

---

## 10. Conclusion

KampusPay treats security as a first-class design concern. Every action is
gated by a deterministic engine the AI cannot override, blocked at hard
thresholds, logged with full reasoning, and auditable in real time.

The system has survived a real credential exposure incident and responded
correctly within minutes.

---

**Submitted by: The FinMinds** · October 2026