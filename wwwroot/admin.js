
//Base URL for the API
const API_BASE = "http://localhost:5201";
//Will store the authentication token after login
let TOKEN = null;

//login function to authenticate as admin
async function login() {
    //send a POST request to the login endpoint
    const res = await fetch(`${API_BASE}/api/auth?action=login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
    },
        // Send username and password in the request body
        body: JSON.stringify({
            username: "admin",
            password: "admin"
    })    
});
    //If the request fails, throw an error
if (!res.ok) {
    throw new Error("Login failed");
}  

// Convert response to JSON and store the token
const data = await res.json();
TOKEN = data.token;
console.log("Logged in, token:", TOKEN);
}
//Load events function to fetch and display events
async function loadEvents() {
    //send a GET request to the events endpoint with the authorization header
    const res = await fetch(`${API_BASE}/api/events`, {
        headers: {
            "Authorization": `Bearer ${TOKEN}` //Uses stored token for authentication
        }
    });
    // If request fails, throw an error
    if (!res.ok) {
        throw new Error("Failed to fetch events");
    }
// Convert the respponse to JSON
    const events = await res.json();
    //Display the events on the page
    displayEvents(events);
}
//display events function to render events in the admin interface
function displayEvents(events) {
    //Get the container element for events
    const container = document.getElementById("events-container");
    //clear existing event content
    container.innerHTML ="";
    //Iterate through each event
    events.forEach(event => {
        //Create a new div element for each event
        const div = document.createElement("div");
        div.classList.add("event-row");
        //insert event details into the div
        div.innerHTML = `
            <strong>${event.title}</strong><br>
            Date: ${event.date}<br>
            Capacity: ${event.capacity}<br>
            Remaining seats: ${event.remainingSeats ?? "N/A"}<br>
        `;
        //Add the event div to the container
        container.appendChild(div);
    });   
}
//Add event form submission handler
document.getElementById("addEventForm").addEventListener("submit", async (e) => {
    //Stops page from reloading on form submission
    e.preventDefault();
// Gathers input values from the form
    const newEvent = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        date: document.getElementById("date").value,
        capacity: parseInt(document.getElementById("capacity").value)
    };
// Send POST request to add the new event
    const res = await fetch(`${API_BASE}/api/events`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${TOKEN}` //admin authentication
        },
        body: JSON.stringify(newEvent)
    });
    //If request fails, throw an error
    if (!res.ok) {
        throw new Error("Failed to add event");
    }
    //Notify user of success, reload events, and reset the form
    alert("Event added!");
    loadEvents();
    //Reset form fields
    e.target.reset();
});
//Page load initialization
document.addEventListener("DOMContentLoaded", async () => {
    try {
        //Log in first to get the token
        await login();
        //Then load the events
        loadEvents();
    } catch (err) {
        //If any error occurs, log it and alert the user
        console.error("Admin error:", err);
        alert("Admin login failed. Check API.");
    }
});