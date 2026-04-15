# Security policy

## Supported versions

We aim to fix security issues in the latest commit on the default branch (`main`). There are no separate LTS lines yet.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for undisclosed security vulnerabilities.

Instead, contact the maintainers privately, for example:

- Use GitHub **Security advisories** for this repository (*Security* → *Report a vulnerability*), if enabled, or
- Open a draft security advisory with minimal reproduction steps.

Include: affected component (backend / frontend), configuration (env flags), and impact (e.g. auth bypass, data leak).

We will try to acknowledge within a few days; fixes depend on severity and maintainer availability.

## Hardening notes

This project is a self-hosted builder. Default deployment expects you to configure `API_KEY`, `CORS_ORIGINS`, TLS at your reverse proxy, and secrets outside the repository. See the root `README.md` and `backend/.env.example`.
