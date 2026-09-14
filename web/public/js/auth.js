/**
 * AgriMark Production Authentication Client JS
 * Interacts with FastAPI /api/v1/auth/* endpoints
 */

const API_BASE = "/api/v1";

class AgriMarkAuth {
    static getToken() {
        return localStorage.getItem("agrimark_token");
    }

    static setToken(token) {
        localStorage.setItem("agrimark_token", token);
    }

    static clearSession() {
        localStorage.removeItem("agrimark_token");
        localStorage.removeItem("agrimark_user");
    }

    static setUser(user) {
        localStorage.setItem("agrimark_user", JSON.stringify(user));
    }

    static getUser() {
        const u = localStorage.getItem("agrimark_user");
        return u ? JSON.parse(u) : null;
    }

    static async login(phone_or_email, password) {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone_or_email, password })
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || "Authentication failed.");
        }
        this.setToken(data.access_token);
        this.setUser(data.user);
        return data;
    }

    static async register(userData) {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || "Registration failed.");
        }
        this.setToken(data.access_token);
        this.setUser(data.user);
        return data;
    }

    static async fetchMe() {
        const token = this.getToken();
        if (!token) return null;
        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) {
            this.clearSession();
            return null;
        }
        const user = await res.json();
        this.setUser(user);
        return user;
    }

    static async logout() {
        const token = this.getToken();
        if (token) {
            try {
                await fetch(`${API_BASE}/auth/logout`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` }
                });
            } catch (e) {
                console.warn("Logout endpoint error:", e);
            }
        }
        this.clearSession();
    }

    static redirectForUser(user) {
        if (!user) {
            window.location.href = "/login.html";
            return;
        }
        const role = (user.role || "").toLowerCase();
        if (role === "buyer") {
            window.location.href = "/developer_portal.html";
        } else if (role === "admin") {
            window.location.href = "/national_control_tower.html";
        } else {
            window.location.href = "/farmer_outcomes_dashboard.html";
        }
    }
}

window.AgriMarkAuth = AgriMarkAuth;
