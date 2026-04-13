const API_BASE = "http://localhost:5201";

function checkAuth() {
    const token = localStorage.getItem("ayvent_token");
    const role = localStorage.getItem("ayvent_role");

    if (token && role === "admin") {
        document.getElementById("login-section").style.display = "none";
        document.getElementById("admin-dashboard").style.display = "block";
        loadEvents(); 
        loadMessages();
    }

    else if (token && role === "user") {
        alert("Access Denied: Regular users are not allowed on the Admin Dashboard.");
        logout();
    }

    else {
        document.getElementById("login-section").style.display = "block";
        document.getElementById("admin-dashboard").style.display = "none";
    }
}

function logout() {
    localStorage.removeItem("ayvent_token");
    localStorage.removeItem("ayvent_role");
    checkAuth();
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        try {
            const res = await fetch(`${API_BASE}/api/v2/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) {
                alert("Invalid username or password!");
                return;
            }

            const data = await res.json();
            
            localStorage.setItem("ayvent_token", data.token);
            localStorage.setItem("ayvent_role", data.role);
            
            loginForm.reset();
            checkAuth();
            
        } catch (err) {
            console.error("Login Error:", err);
            alert("Could not connect to the server.");
        }
    });
}



async function loadEvents() {
    const res = await fetch(`${API_BASE}/api/v2/events`);
    if (!res.ok) throw new Error("Failed to fetch events");
    const events = await res.json();
    displayEvents(events);
}

function displayEvents(events) {
    const container = document.getElementById("events-container");
    if (!container) return;

    container.innerHTML ="";
    
    events.forEach(event => {
        const div = document.createElement("div");
        div.classList.add("event-row");
        
        div.innerHTML = `
            <strong>${event.title}</strong><br>
            Date: ${new Date(event.date).toLocaleDateString()}<br>
            Location: ${event.location || "No location set"}<br>
            <button onclick="deleteEvent(${event.id})" style="margin-top: 10px; background-color:#ff4c4c; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 5px;">Delete Event</button>
        `;
        container.appendChild(div);
    });   
}

async function deleteEvent(eventId) {
    if (!confirm("Are you sure you want to delete this event?")) return; 

    const token = localStorage.getItem("ayvent_token");

    try {
        const res = await fetch(`${API_BASE}/api/v2/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.ok) {
            alert("Event deleted successfully!");
            loadEvents();
        } else {
            alert("Failed to delete the event. Are you logged in as an Admin?");
        }
    } catch (err) {
        console.error("Error deleting event:", err);
    }
}

const addForm = document.getElementById("addEventForm");
if (addForm) {
    addForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("ayvent_token");
       
        const newEvent = {
            title: document.getElementById("title").value,
            description: document.getElementById("description").value,
            date: document.getElementById("date").value,
            capacity: parseInt(document.getElementById("capacity").value), 
            location: document.getElementById("location").value,
            organizerId: 1
        };

        const res = await fetch(`${API_BASE}/api/v2/events`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newEvent)
        });

        if (!res.ok) {
            alert("Failed to add event. Are you logged in as an Admin?");
            return;
        }

        alert("Event added successfully!");
        loadEvents();
        e.target.reset();
    });
}

    
async function loadMessages() {
    const token = localStorage.getItem("ayvent_token");
    const container = document.getElementById("messages-container");

    try {
        const res = await fetch(`${API_BASE}/api/v2/messages`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const messages = await res.json();
        container.innerHTML = "";

        messages.forEach(msg => {
            const div = document.createElement("div");
            div.classList.add("event-row");

            const messageBody = msg.content || msg.message || "No message content found";

            div.innerHTML = `
        <div style="flex-grow: 1;">
            <strong>From: ${msg.name || msg.Name || "Unknown Sender"}</strong> (${msg.email || msg.Email || "No email provided"})<br>
            <p>${msg.content || msg.message}</p>
        </div>
        <button onclick="deleteMessage(${msg.id})" style="margin-left: 20px; background-color: #ff4c4c; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Delete</button>
    `;
            container.appendChild(div);
        });
    } catch (err) {
        container.innerHTML = "<p>Error loading messages.</p>";
    }
}


async function deleteMessage(messageId) {
    if (!confirm("Are you sure you want to delete this message?")) return;

    const token = localStorage.getItem("ayvent_token");

    try {
        const res = await fetch(`${API_BASE}/api/v2/messages/${messageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.ok) {
            alert("Message deleted!");
            loadMessages();
        } else {
            const errorText = await res.text();
            console.error("Failed to delete message:", errorText);
            alert("Failed to delete message.");
        }
    } catch (err) {
        console.error("Error deleting message:", err);
        alert("Server error.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    checkAuth(); 


});