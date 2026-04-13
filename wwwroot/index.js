const API_BASE_PUBLIC = "http://localhost:5201";

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("featured-events-container");
    if (!container) return; 

    try {
        const res = await fetch(`${API_BASE_PUBLIC}/api/v2/events`);
        
        if (!res.ok) throw new Error("Failed to fetch events.");

        const allEvents = await res.json();
        
        container.innerHTML = "";

        const featuredEvents = allEvents.slice(0, 3);

        if (featuredEvents.length === 0) {
            container.innerHTML = "<p style='grid-column: 1 / -1; text-align: center;'>No upcoming events at this time.</p>";
            return;
        }

        featuredEvents.forEach(event => {
            const eventCard = document.createElement("div");
            eventCard.classList.add("event-card");
            
            eventCard.innerHTML = `
                <img src="${event.displayImage || 'images/company_logo.png'}" alt="Event Image" onerror="this.src='images/company_logo.png'">
                <h3>${event.title}</h3>
                <p style="margin-bottom: 5px;"><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                <p style="margin-top: 0;"><strong>Location:</strong> ${event.location || "TBD"}</p>
                <a href="events.html" class="event-btn">View Details</a>
            `;
            
            container.appendChild(eventCard);
        });

    } catch (err) {
        console.error("Home Page Event Load Error:", err);
        container.innerHTML = "<p style='color: red; grid-column: 1 / -1; text-align: center;'>Sorry, we couldn't load the featured events right now.</p>";
    }
});