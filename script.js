// Sample data
const towers = [
  { id: "I-KA-MGDI-ENB-0018", city: "Mumbai", type: "SST", antennas: 8, status: "Active", lat: 19.0760, lng: 72.8777, lastMaint: "2025-07-03" },
  { id: "TWR-002", city: "Delhi", type: "SST", antennas: 6, status: "Under Maintenance", lat: 28.7041, lng: 77.1025, lastMaint: "2025-05-20" },
  { id: "TWR-003", city: "Bangalore", type: "Monopole", antennas: 5, status: "Active", lat: 12.9716, lng: 77.5946, lastMaint: "2025-06-15" }
];

// Metrics
document.getElementById("totalTowers").textContent = towers.length;

// Table
const tbody = document.querySelector("#towerTable tbody");
towers.forEach(t => {
  const row = `<tr>
    <td>${t.id}</td><td>${t.city}</td><td>${t.type}</td>
    <td>${t.antennas}</td><td>${t.status}</td><td>${t.lastMaint}</td>
  </tr>`;
  tbody.innerHTML += row;
});

// Alerts
const alerts = document.getElementById("alerts");
towers.filter(t => t.status === "Under Maintenance").forEach(t => {
  const li = document.createElement("li");
  li.textContent = `${t.id} in ${t.city} is under maintenance.`;
  alerts.appendChild(li);
});

// Charts
new Chart(document.getElementById("pieChart"), {
  type: "pie",
  data: {
    labels: [...new Set(towers.map(t => t.type))],
    datasets: [{
      data: towers.map(t => t.antennas),
      backgroundColor: ["#4CAF50", "#FF9800", "#2196F3"]
    }]
  }
});

new Chart(document.getElementById("barChart"), {
  type: "bar",
  data: {
    labels: [...new Set(towers.map(t => t.city))],
    datasets: [{
      label: "Towers by City",
      data: towers.reduce((acc, t) => { acc[t.city] = (acc[t.city]||0)+1; return acc; }, {}),
      backgroundColor: "#2196F3"
    }]
  }
});

// Map
const map = L.map("map").setView([20, 78], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
towers.forEach(t => {
  const marker = L.circleMarker([t.lat, t.lng], { radius: 8, color: t.status === "Active" ? "green" : "orange" });
  marker.bindPopup(`<b>${t.id}</b><br>${t.city}<br>Status: ${t.status}<br><button onclick="alert('Report for ${t.id}')">View Report</button>`);
  marker.addTo(map);
});
