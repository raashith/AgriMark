# Sandbox Architecture & Environment Isolation

Project environments are strictly scoped: `SANDBOX`, `VALIDATION`, `STAGING`, `PILOT`, and `PRODUCTION`. Default is `SANDBOX_ONLY`. Production financial transactions, order placement, inventory modification, and physical actions are blocked in sandbox environments.
