

document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOM fully loaded");

    const loginBtn = document.getElementById("loginBtn");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    console.log("loginBtn:", loginBtn);

    if (!loginBtn) {
        alert("❌ loginBtn NOT found — check HTML id");
        return;
    }

    loginBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            alert("Email and password required");
            return;
        }

        try {
            const res = await fetch("https://ai-chat-api-a3wn.onrender.com/api/auth/login", {
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

            // ✅ SUCCESS: hide login, show chat
            document.getElementById("authOverlay").style.display = "none";
            document.getElementById("chat").style.display = "flex";

        } catch (err) {
            console.error(err);
            alert("Network error");
        }
    });

});
