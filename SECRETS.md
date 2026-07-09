Secrets and environment variables — provisioning guide

Required environment variables (backend):

- `MONGO_URI` — MongoDB connection string (use a managed cluster, do not embed credentials in code).
- `SENTRY_DSN` — Sentry project DSN for error/transaction reporting.
- `JWT_SECRET` — secret used to sign JWT tokens.
- `FRONTEND_URL` — frontend origin for CORS.
- Optional: `PORT`, `NODE_ENV`.

Recommendations:

- Use your cloud provider secret manager (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager) or GitHub Actions Secrets for CI.
- Do NOT commit `.env` to the repository. Use `.env.example` as a template.
- For Docker Compose, use an external `.env` file referenced by `docker-compose` or use environment variables from the host.
- For Kubernetes, create a `Secret` and mount it as env vars; reference secrets in deployment manifests.

Local development:

1. Copy `.env.example` to `.env` and fill values.
2. Run `npm run env-check` to validate required vars.

CI:

- Add required secrets to your repository's GitHub Settings → Secrets, then populate them in your workflow when needed.
