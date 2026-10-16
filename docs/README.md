# KampusPay — Documentation Index

**Team:** The FinMinds
**Agent:** Kai (Kaya)
**Topic:** C — Cross-border & Student Finance Assistant
**Competition:** 2026 8th FinTechathon · Shenzhen

---

## 📚 Documents

### 1. [Technical Documentation](./TECHNICAL_DOCUMENTATION.md)
Architecture, components, data model, API reference, deployment.

### 2. [Security Self-Assessment](./SECURITY_REPORT.md)
Threat model, controls, risk gate, permission tiers, known-risk list.

### 3. [Test Cases](./TEST_CASES.md)
15 test cases with pass/fail evidence.

---

## 🔗 Source Code

| Repo | Link |
|---|---|
| Agent backend | github.com/farahaliaa/kampuspay-agent |
| Web frontend | github.com/farahaliaa/kampuspay-web |

---

## 🚀 Quick Start

```bash
# Backend
cd kampuspay-agent
source .venv/bin/activate
uvicorn api:app --port 8000

# Frontend
cd kampuspay-web
npm run dev

# Open
http://localhost:3000/dashboard
