console.log("✅ app.js loaded");

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

    loginBtn.addEventListener("click", () => {
        alert("🔥 LOGIN BUTTON CLICKED");
        console.log("Email:", emailInput.value);
        console.log("Password:", passwordInput.value);
    });
});
