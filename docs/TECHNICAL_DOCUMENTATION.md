KampusPay — Technical Documentation
Team: The FinMinds
Agent: Kai (Kaya)
Topic: C — Cross-border & Student Finance Assistant
Competition: 2026 8th FinTechathon · Shenzhen International FinTech Competition
Version: 2.0 | Date: October 2026

1. Executive Summary
KampusPay is an AI financial agent that helps international students plan, forecast, and execute cross-border financial operations in a controlled sandbox environment.

The system combines three core technologies:

Python + OpenAI Agents SDK — for agentic reasoning and tool execution.

Supabase (PostgreSQL) — for the database, sandbox ledger, and application-level audit trail.

Next.js — for the user interface.

The agent, named Kai, is not a chatbot. It is a financial participant: it reads accounts, computes FX exposure, generates budget plans, and executes transfers — all under a deterministic risk gate that the AI cannot override.

Important scope note: All transfers occur in a sandbox environment with synthetic accounts. KampusPay is a prototype and is not ready for real-money transactions.

2. System Architecture
2.1 High-Level Diagram
text
Browser (Next.js :3000)
    ↓ fetch()
FastAPI (:8000) — Session management, request routing
    ↓
Kai Agent (OpenAI SDK) — Tool selection, reasoning
    ↓
Supabase (PostgreSQL) — 6 tables, atomic RPC, RLS
2.2 Data Flow — A Transfer Request
User types "Transfer 2000 from Aiman to China Univ X" in the UI.

Next.js POSTs to FastAPI /chat with a session_id.

FastAPI retrieves the session history (multi-turn memory).

Kai (LLM) decides to call the execute_transfer tool.

execute_transfer runs the deterministic risk gate in Python.

Risk decision precedence: score ≥ 70 → hard block; score 30–69 → step-up confirmation; score < 30 → auto-execute only if all validation checks pass.

On confirmation, Supabase RPC executes the transfer atomically (SELECT ... FOR UPDATE).

An application-level audit log entry is written.

Next.js /audit page polls every 3s and renders the decision.

3. Component Breakdown
3.1 Agent (agent.py)
Tool	Purpose
get_balance(owner_name)	Balance lookup
fx_impact(amount, pair, shock_pct)	FX shock computation (see §3.4)
build_plan(income, savings, tuition, ...)	Financial plan generation
execute_transfer(from, to, amount, purpose, confirmed)	Risk-gated atomic transfer
Design principle: The LLM decides which tools to call. Python decides what is allowed.

3.2 API (api.py)
Endpoint	Method	Purpose
/	GET	Health check
/chat	POST	Multi-turn conversation
/reset/{session_id}	POST	Clear session
/dashboard/{user_id}	GET	Aggregated dashboard data
/fx-impact	POST	FX calculation
Session storage: In-memory Python dict, capped at 20 messages per session_id. Restarting the server clears all sessions.

3.3 Database (Supabase)
Six tables: users, accounts, budget_plans, fx_rates, transactions, audit_log.

Atomic transfer RPC:

sql
create or replace function execute_transfer(
  from_id bigint, to_id bigint, amt numeric,
  purpose_text text, risk numeric
) returns bigint as $$
declare
  tx_id bigint;
  src_balance numeric;
  src_ccy text;
  dst_ccy text;
begin
  -- Lock the source row to prevent concurrent double-spend
  select balance, currency into src_balance, src_ccy
  from accounts where id = from_id for update;

  select currency into dst_ccy from accounts where id = to_id;

  -- Server-side validation (independent of the LLM)
  if src_balance is null then raise exception 'source account not found'; end if;
  if dst_ccy is null then raise exception 'destination account not found'; end if;
  if amt <= 0 then raise exception 'amount must be positive'; end if;
  if src_balance < amt then raise exception 'insufficient funds'; end if;
  if src_ccy <> dst_ccy then
    raise exception 'cross-currency transfer not yet supported in sandbox';
  end if;

  update accounts set balance = balance - amt where id = from_id;
  update accounts set balance = balance + amt where id = to_id;

  insert into transactions (from_acct, to_acct, amount, ccy, purpose, status, risk_score)
  values (from_id, to_id, amt, src_ccy, purpose_text, 'executed', risk)
  returning id into tx_id;

  return tx_id;
end;
$$ language plpgsql;
3.4 FX Impact Calculation — Clarification
The fx_impact tool returns what a fixed tuition bill costs in home currency under different FX scenarios.

Example: BND/CNY = 5.15 → 5.4075 (a 5% appreciation of CNY).

Fixed destination bill: CNY 231,750.

Base cost (BND): 45,000.00.

Shocked cost (BND): 42,857.14.

Extra BND required: +2,142.86.

Recommended buffer: 7.5%.

Implementation status: The current fx_impact tool returns the reverse framing (fixed BND amount, variable CNY received). Judges should interpret the returned extra_cost value as additional destination currency received for a fixed home-currency amount, not as a monetary loss. A fix to support the fixed-bill framing is tracked as a known limitation.

4. Risk Gate — Explicit Precedence
The risk gate evaluates rules in order. The first matching threshold determines the outcome.

Step	Condition	Outcome
1	Amount ≤ 0 / missing account / insufficient funds / cross-currency	Rejected
2	Risk score ≥ 70	Blocked (hard limit)
3	Risk score 30–69	Awaiting confirmation
4	Risk score < 30 and validations pass	Auto-execute
Score computation (additive):

Amount > 5,000: +40

First-time beneficiary: +20

New beneficiary + amount > 1,000: +15

5. Validation Logic
Every transfer passes through these checks:

User Validation: Sender and recipient must exist in the users table.

Amount Validation: Must be positive and ≤ the sender's balance.

Currency Validation: Sender and recipient must be in the same currency.

Beneficiary Validation: transactions table is queried for prior history.

Server-Side Enforcement: All checks are re-validated inside the Supabase RPC.

6. Audit Trail — Application-Level Append-Only
Correction: The audit trail is application-level append-only, not cryptographically immutable.

What this means: KampusPay never issues UPDATE or DELETE on audit_log. All writes go through INSERT.

What it does not mean: A DB admin with direct SQL access could alter rows. Rows are not cryptographically signed.

Production Plan: Daily signed exports (SHA-256) to cold storage.

7. Testing & Execution Evidence
Test Cases: 15 executed. 15 passed (100%).

Execution Evidence: Screenshots in docs/screenshots/ and raw audit_log_export.csv.

Reproducibility: See §9.

8. Known Limitations
Limitation	Impact	Planned Fix
Sandbox only	Cannot handle real money	Real bank integration (v2)
Same-currency only	Cross-currency blocked	RPC-level FX conversion (v2)
FX tool framing	Returns destination delta, not home cost	Refactor to dual-mode output
In-memory sessions	Lost on restart	Redis-backed sessions
No user auth	Single-user demo mode	Supabase Auth + RLS per user
Append-only log	Not cryptographically immutable	Signed daily exports
9. Deployment & Local Setup
Environment Variables:

SUPABASE_URL, SUPABASE_KEY, OPENAI_API_KEY

Backend Setup:

bash
cd kampuspay-agent
python -m venv .venv
source .venv/bin/activate
pip install openai-agents supabase fastapi uvicorn python-dotenv
uvicorn api:app --port 8000
Frontend Setup:

bash
cd kampuspay-web
npm install
npm run dev
Database Setup:
Run docs/database_setup.sql in Supabase SQL Editor.

Submitted by: The FinMinds · October 2026