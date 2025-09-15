// Sample tower dataset
const towers = [
  { id: "TWR-001", city: "Mumbai", type: "SST", antennas: 8, status: "Active", lat: 19.0760, lng: 72.8777, lastMaint: "2025-07-03" },
  { id: "TWR-002", city: "Delhi", type: "SST", antennas: 6, status: "Under Maintenance", lat: 28.7041, lng: 77.1025, lastMaint: "2025-05-20" },
  { id: "TWR-003", city: "Bangalore", type: "Monopole", antennas: 5, status: "Active", lat: 12.9716, lng: 77.5946, lastMaint: "2025-06-15" },
  { id: "TWR-004", city: "Chennai", type: "TPL", antennas: 7, status: "Non-functional", lat: 13.0827, lng: 80.2707, lastMaint: "2025-06-01" }
];

// Map setup
const map = L.map("map").setView([20.5937, 78.9629], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);
const markers = L.markerClusterGroup();
map.addLayer(markers);

// Chart setup
let pieChart, barChart;

// Function to render towers
function renderTowers(filteredTowers) {
  // Clear markers
  markers.clearLayers();

  // Clear table
  const tbody = document.querySelector("#towerTable tbody");
  tbody.innerHTML = "";

  filteredTowers.forEach(t => {
    // Map markers
    const marker = L.circleMarker([t.lat, t.lng], {
      radius: 8,
      color: t.status === "Active" ? "green" :
             t.status === "Under Maintenance" ? "orange" : "red"
    });
    marker.bindPopup(`
      <b>${t.id}</b><br>
      City: ${t.city}<br>
      Type: ${t.type}<br>
      Status: ${t.status}<br>
      <button onclick="alert('Health Report for ${t.id}')">View Report</button>
    `);
    markers.addLayer(marker);

    // Table
    tbody.innerHTML += `
      <tr>
        <td>${t.id}</td><td>${t.city}</td><td>${t.type}</td>
        <td>${t.antennas}</td><td>${t.status}</td><td>${t.lastMaint}</td>
      </tr>`;
  });

  // Update total towers
  document.getElementById("totalTowers").textContent = filteredTowers.length;

  // Update charts
  updateCharts(filteredTowers);
}

// Function to update charts
function updateCharts(data) {
  // Destroy old charts before re-creating
  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();

  // Pie chart (Antenna Types distribution)
  const typeCounts = data.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
    return acc;
  }, {});
  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: Object.keys(typeCounts),
      datasets: [{
        data: Object.values(typeCounts),
        backgroundColor: ["#4CAF50", "#FF9800", "#2196F3"]
      }]
    }
  });

  // Bar chart (Towers by City)
  const cityCounts = data.reduce((acc, t) => {
    acc[t.city] = (acc[t.city] || 0) + 1;
    return acc;
  }, {});
  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: Object.keys(cityCounts),
      datasets: [{
        label: "Towers by City",
        data: Object.values(cityCounts),
        backgroundColor: "#2196F3"
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}

// Function to apply filters
function applyFilters() {
  const region = document.getElementById("regionFilter").value;
  const type = document.getElementById("towerTypeFilter").value;
  const status = document.getElementById("statusFilter").value;

  const filtered = towers.filter(t => {
    return (region === "All" || t.city === region) &&
           (type === "All" || t.type === type) &&
           (status === "All" || t.status === status);
  });

  renderTowers(filtered);
}

// Hook filters
document.getElementById("regionFilter").addEventListener("change", applyFilters);
document.getElementById("towerTypeFilter").addEventListener("change", applyFilters);
document.getElementById("statusFilter").addEventListener("change", applyFilters);

// Initial render
applyFilters();
