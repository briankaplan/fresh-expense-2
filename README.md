# 🚀 Fresh Expense - Modern Expense Management System

[![CI](https://github.com/briankaplan/fresh-expense-2/actions/workflows/ci.yml/badge.svg)](https://github.com/briankaplan/fresh-expense-2/actions/workflows/ci.yml)
[![Auto Clean Code](https://github.com/briankaplan/fresh-expense-2/actions/workflows/auto-clean-code.yml/badge.svg)](https://github.com/briankaplan/fresh-expense-2/actions/workflows/auto-clean-code.yml)
[![Deploy](https://github.com/briankaplan/fresh-expense-2/actions/workflows/deploy.yml/badge.svg)](https://github.com/briankaplan/fresh-expense-2/actions/workflows/deploy.yml)
[![Docker Publish](https://github.com/briankaplan/fresh-expense-2/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/briankaplan/fresh-expense-2/actions/workflows/docker-publish.yml)
[![Cloudflare](https://github.com/briankaplan/fresh-expense-2/actions/workflows/cloudflare.yml/badge.svg)](https://github.com/briankaplan/fresh-expense-2/actions/workflows/cloudflare.yml)

Fresh Expense is a modern, full-stack expense management platform designed for automation, integration, and insights — powered by **NestJS**, **React**, and **Cloudflare**.

---

## ✨ Features

### 💸 Expense Management

- Smart expense categorization (AI/ML)
- Multi-currency support & auto-conversion
- CSV, Excel, and PDF import/export
- Recurring expense rules and workflows

### 🧾 Receipt Bank

- OCR-powered receipt scanning
- Automated matching to bank transactions
- Searchable digital receipt vault
- Metadata tagging and versioning

### 📊 Reports & Analytics

- Dynamic, customizable reports
- Scheduled exports & alerts
- Visual dashboards with insights
- Team-based reporting views

### 🔌 Integration & Automation

- Gmail integration for receipts
- Teller API for bank transaction sync
- Scheduled sync jobs & pipelines
- Email parsing, PDF extraction, AI matching

### 👥 User & Team Management

- Role-based access control (RBAC)
- Approval workflows
- Multi-org support
- Audit trails & history tracking

---

## 🏗️ Architecture

| Layer     | Stack                            |
|-----------|----------------------------------|
| Frontend  | React, Vite, Tailwind, Zustand   |
| Backend   | NestJS, MongoDB, Redis, JWT      |
| Storage   | Cloudflare R2                    |
| Infra     | GitHub Actions, Docker, Wrangler |
| Testing   | Vitest, Jest, Playwright         |

---

## 📁 Project Structure

```text
fresh-expense/
├── apps/
│   ├── backend/        # NestJS app (API, auth, services)
│   └── frontend/       # React app (UI, pages, components)
├── libs/               # Shared modules (types, UI, utils)
├── scripts/            # Migration, CLI, cleanup
├── .github/workflows/  # CI/CD pipelines
├── pnpm-lock.yaml      # Workspace lock file
└── tsconfig.base.json  # Shared TypeScript config
```

---

## ⚙️ Setup Instructions

### 🧰 Requirements

- Node.js v20+
- PNPM v8+
- MongoDB 6+
- Redis 7+
- Cloudflare Account (for R2 + Workers)

### 🚀 Quickstart

```bash
git clone https://github.com/briankaplan/fresh-expense-2.git
cd fresh-expense-2
pnpm install
cp .env.example .env
```

> Fill out `.env` with your credentials/secrets.

```bash
# Start backend
pnpm dev:backend

# Start frontend
pnpm dev:frontend
```

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Individual tests
pnpm test:backend
pnpm test:frontend
pnpm test:e2e
```

```bash
# Generate coverage
pnpm test:coverage
```

---

## 🔧 Environment Variables

> For full config, check `.env.example`

### Backend

- `MONGODB_URI`
- `JWT_SECRET`
- `ENCRYPTION_KEY`, `ENCRYPTION_IV`
- Gmail OAuth tokens
- R2 & Cloudflare credentials

### Frontend

- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_GOOGLE_REDIRECT_URI`

---

## 🔄 CI/CD Workflows

| Workflow            | Purpose                                  |
|---------------------|------------------------------------------|
| `ci.yml`            | Lint, test, and verify backend/frontend  |
| `auto-clean-code.yml` | Auto-format, prune unused code         |
| `deploy.yml`        | Full production deploy to Cloudflare     |
| `docker-publish.yml`| Build & publish Docker images            |
| `cloudflare.yml`    | Deploy backend to Workers, frontend to Pages |
| `renovate.yml`      | Automated dependency upgrades            |

---

## 📦 Deployment

```bash
pnpm build              # Build all apps
pnpm build:backend
pnpm build:frontend
```

### Docker

```bash
docker build -t fresh-expense-backend ./apps/backend
docker build -t fresh-expense-frontend ./apps/frontend
```

### Cloudflare

```bash
# Using Wrangler
pnpm wrangler deploy
```

---

## 📊 Monitoring & Logs

- **Cloudflare Logs**: Worker & API traffic
- **Database Monitoring**: Slow queries, indexes
- **Frontend Analytics**: (optional integration)
- **Error Tracking**: Sentry / Cloudflare insights

---

## 📚 API Documentation

When running locally:

- Swagger: [`http://localhost:3000/api/docs`](http://localhost:3000/api/docs)
- Postman Collection: coming soon...

---

## 🧠 Contributing

1. Fork the repository
2. Create a new branch: `feat/my-feature`
3. Make changes + tests
4. Commit: `git commit -m "feat: add xyz"`
5. Push and create PR 🙌

---

## 📝 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- 🧠 [NestJS](https://nestjs.com)
- 📦 [PNPM](https://pnpm.io)
- ☁️ [Cloudflare](https://cloudflare.com)
- 📷 OCR.space
- 🧪 Vitest, Playwright, Jest
