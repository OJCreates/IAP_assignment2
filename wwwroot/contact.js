const API_BASE = "http://localhost:5201";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const newMessage = {
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                content: document.getElementById("message").value 
            };

            try {
                const res = await fetch(`${API_BASE}/api/v2/messages`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(newMessage)
                });

                if (res.ok) {
                    window.location.href = "contact-confirmed.html";
                } else {
                    alert("Failed to send message. Please try again.");
                }
            } catch (err) {
                console.error("Message Error:", err);
                alert("Could not connect to the server.");
            }
        });
    }
});