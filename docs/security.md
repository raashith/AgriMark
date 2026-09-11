# AgriMark Security & Privacy Specification

## 1. Authentication & RBAC
- **OAuth2 Bearer Flow**: JWT tokens with configurable expiration (`ACCESS_TOKEN_EXPIRE_MINUTES`).
- **Password Hashing**: Bcrypt with salt rounds via Passlib.
- **Role Enforcement**: Strict RBAC checking across endpoints (`FARMER`, `FPO`, `BUYER`, `ADMIN`, `LOGISTICS`, `QUALITY`).

## 2. Multi-Tenant Data Isolation (IDOR / BOLA Prevention)
Object-level authorization is enforced on every user query to prevent cross-user data leakage. Farmer A cannot access Farmer B's farm, crop, inventory, or financial data.

## 3. Secret Isolation
- `OPENAI_API_KEY`, database credentials, and JWT secret keys reside strictly in server-side `.env` files.
- `.env` files are excluded from git via `.gitignore`.
- Secrets are never embedded in client bundles (Android APK or Web JavaScript).
