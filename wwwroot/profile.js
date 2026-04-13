const API_BASE = "http://localhost:5201";

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("ayvent_token");
    const role = localStorage.getItem("ayvent_role");

    if (token) {
        document.getElementById("auth-check").style.display = "none";
        document.getElementById("bookings-section").style.display = "block";
        loadMyBookings();
    }
});

async function loadMyBookings() {
    const token = localStorage.getItem("ayvent_token");
    const container = document.getElementById("bookings-container");

    try {
        const res = await fetch(`${API_BASE}/api/v2/bookings`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Could not load bookings.");

        const bookings = await res.json();
        container.innerHTML = "";

        if (bookings.length === 0) {
            container.innerHTML = "<p>You haven't booked any tickets yet!</p>";
            return;
        }

        bookings.forEach(booking => {
            const div = document.createElement("div");
            div.classList.add("event-row");
            div.innerHTML = `
                <strong>${booking.event.title}</strong><br>
                Date: ${new Date(booking.event.date).toLocaleDateString()}<br>
                <button onclick="cancelBooking(${booking.id})" style="margin-top:10px; background-color:#ff4c4c; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Cancel Ticket</button>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        container.innerHTML = "<p>Error loading your tickets.</p>";
    }
}

async function cancelBooking(id) {
    if (!confirm("Are you sure you want to cancel this ticket?")) return;

    const token = localStorage.getItem("ayvent_token");
    try {
        const res = await fetch(`${API_BASE}/api/v2/bookings/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            alert("Ticket cancelled.");
            loadMyBookings();
        }
    } catch (err) {
        alert("Error cancelling ticket.");
    }
}