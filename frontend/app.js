document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOM fully loaded");

    const API = "https://ai-chat-api-a3wn.onrender.com";

    const loginBtn = document.getElementById("loginBtn");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    if (!loginBtn || !emailInput || !passwordInput) {
        console.error("❌ Login elements missing");
        return;
    }

    loginBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        console.log("🔥 LOGIN BUTTON CLICKED");

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            alert("Email and password required");
            return;
        }

        try {
            const res = await fetch(`${API}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok || !data.token) {
                alert(data.error || "Login failed");
                return;
            }

            localStorage.setItem("token", data.token);

            // ✅ SUCCESS
            document.getElementById("authOverlay").style.display = "none";
            document.getElementById("chat").style.display = "flex";

        } catch (err) {
            console.error("FETCH FAILED:", err);
            alert("Network error. Backend unreachable.");
        }
    });
});
