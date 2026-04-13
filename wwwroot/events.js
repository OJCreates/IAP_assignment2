const API_BASE_PUBLIC = "http://localhost:5201";

document.addEventListener("DOMContentLoaded", async () => {
    checkUserAuth();
    // Finds container from events.html page
    fetchAndDisplayEvents(); // loads all events
});

async function fetchAndDisplayEvents(searchTerm = "") {
    const container = document.getElementById("public-events-container");
    if (!container) return;

    try {
        let url = `${API_BASE_PUBLIC}/api/v2/events`;
        if (searchTerm) {
            url += `?search=${encodeURIComponent(searchTerm)}`;
        }

        const res = await fetch(url);
        
        if (!res.ok) {
            throw new Error("Failed to fetch events from the database.");
        }

        const events = await res.json();
        
        // Clear out any old loading text
        container.innerHTML = "";

        // If the database is empty, display message saying so
        if (events.length === 0) {
            container.innerHTML = "<p>No upcoming events at this time. Check back later!</p>";
            return;
        }

        // Loop through the database data and build HTML for each event
        events.forEach(event => {
            const eventCard = document.createElement("div");
            eventCard.classList.add("event-card");

            const commentsHtml = (event.comments && event.comments.length > 0) 
                ? event.comments.map(c => `<p style="font-size:0.85rem; border-bottom:1px solid #eee; margin: 5px 0;"><strong>${c.username || c.Username || "User"}:</strong> ${c.content || c.Content || "No content"}</p>`).join('') 
                : "<p style='font-size:0.85rem; color:#888;'>No comments yet.</p>";
            
            eventCard.innerHTML = `
                <img src="${event.displayImage || 'images/company_logo.png'}" alt="Event Image" onerror="this.src='images/company_logo.png'">
                <h3>${event.title}</h3>
                <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Location:</strong> ${event.location || "TBD"}</p>
                <p>${event.description}</p>

                <div class="comments-section" style="text-align: left; background: #f9f9f9; padding: 10px; margin-top: 15px; border-radius: 5px;">
                    <h4 style="margin-top: 0; font-size: 1rem;">Comments</h4>
                    <div style="max-height: 100px; overflow-y: auto; margin-bottom: 10px;">
                        ${commentsHtml}
                    </div>
                    <div style="display: flex; gap: 5px;">
                        <input type="text" id="comment-input-${event.id}" placeholder="Add a comment..." style="flex-grow: 1; padding: 5px; border: 1px solid #ccc; border-radius: 3px;">
                        <button onclick="addComment(${event.id})" style="padding: 5px 10px; background: #333; color: white; border: none; border-radius: 3px; cursor: pointer;">Post</button>
                    </div>
                </div>

                <button onclick="bookEvent(${event.id})" class="event-btn" style="border: none; cursor: pointer; width: 100%;">Book Ticket</button>
            `;
            
            container.appendChild(eventCard);
        });

    } catch (err) {
        console.error("Public Event Load Error:", err);
        container.innerHTML = "<p style='color: red;'>Sorry, we couldn't load the events right now. Please try again later.</p>";
    }

}

async function bookEvent(eventId) {
    const token = localStorage.getItem("ayvent_token");

    if (!token) {
        alert("You must be logged in to book a ticket! Please log in on the Admin page.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE_PUBLIC}/api/v2/bookings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ eventId: eventId })
        });

        if (res.ok) {
            window.location.href = "booking-confirmed.html";
        } else {
            const errorMsg = await res.text();
            alert("Failed to book the event: " + errorMsg);
        }
    } catch (err) {
        console.error("Booking Error:", err);
        alert("Could not connect to the server.");
    }
}


function checkUserAuth() {
    const token = localStorage.getItem("ayvent_token");
    const registerSection = document.getElementById("register-section");
    if (token) {
        document.getElementById("user-login-form").style.display = "none";
        document.getElementById("user-logout-div").style.display = "block";
        if (registerSection) registerSection.style.display = "none";
    } else {
        document.getElementById("user-login-form").style.display = "block";
        document.getElementById("user-logout-div").style.display = "none";
        if (registerSection) registerSection.style.display = "block";
    }
}

async function userLogin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch(`${API_BASE_PUBLIC}/api/v2/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) return alert("Invalid credentials!");

        const data = await res.json();
        localStorage.setItem("ayvent_token", data.token);
        localStorage.setItem("ayvent_role", data.role);
        checkUserAuth();
        alert("Logged in successfully! You can now book tickets.");
    } catch (err) {
        alert("Server error.");
    }
}

function userLogout() {
    localStorage.removeItem("ayvent_token");
    localStorage.removeItem("ayvent_role");
    checkUserAuth();
}

async function displayEvents(events) {
    const container = document.getElementById("events-container");
    container.innerHTML = "";

    const bookingsRes = await fetch(`${API_BASE}/api/v2/bookings/all`);
    const allBookings = await bookingsRes.json();

    events.forEach(event => {
        const takenSpots = allBookings.filter(b => b.eventId === event.id).length;
        const isFull = takenSpots >= event.capacity;

        const div = document.createElement("div");
        div.className = "event-card";

        div.innerHTML = `
            <h3>${event.title}</h3>
            <p>Capacity: ${takenSpots} / ${event.capacity}</p>
            ${isFull 
                ? `<button class="btn-full" disabled style="background-color: #ccc; cursor: not-allowed;">Fully Booked</button>`
                : `<button onclick="bookEvent(${event.id})" class="btn-book">Book Ticket</button>`
            }
        `;
        container.appendChild(div);
    });
}

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("reg-username").value;
        const password = document.getElementById("reg-password").value;

        if (username.length < 3) {
        alert("Username must be at least 3 characters long.");
        return;
    }

    if (password.length < 5) {
        alert("Password must be at least 5 characters long.");
        return;
    }

        try {
            const res = await fetch(`${API_BASE_PUBLIC}/api/v2/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    username: username, 
                    password: password,
                    role: "user" 
                })
            });

            if (res.ok) {
                alert("Registration successful! You can now log in.");
                registerForm.reset();
            } else {
                const error = await res.text();
                alert(error || "Registration failed. Username might be taken.");
            }
        } catch (err) {
            console.error("Register Error:", err);
            alert("Could not connect to the server.");
        }
    });
}

function searchEvents() {
    const searchTerm = document.getElementById("searchInput").value;
    fetchAndDisplayEvents(searchTerm);
}

async function addComment(eventId) {
    const inputField = document.getElementById(`comment-input-${eventId}`);
    const content = inputField.value.trim();
    const token = localStorage.getItem("ayvent_token");

    if (!token) {
        alert("You must be logged in to leave a comment!");
        return;
    }

    if (!content) {
        alert("Comment cannot be empty!");
        return;
    }

    try {
        const res = await fetch(`${API_BASE_PUBLIC}/api/v2/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ eventId: eventId, content: content })
        });

        if (res.ok) {
            inputField.value = ""; 
            fetchAndDisplayEvents(document.getElementById("searchInput")?.value || ""); 
        } else {
            const errorMsg = await res.text();
            alert("Failed to post comment: " + errorMsg);
        }
    } catch (err) {
        console.error("Comment Error:", err);
        alert("Could not connect to the server.");
    }
}