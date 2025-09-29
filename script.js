console.log("✅ script.js loaded");

// Sample tower dataset
const towers = [
  { id: "TWR-001", city: "Mumbai", type: "SST", antennas: 8, status: "Active", lat: 19.0760, lng: 72.8777, lastMaint: "2025-07-03" },
  { id: "TWR-002", city: "Delhi", type: "SST", antennas: 6, status: "Under Maintenance", lat: 28.7041, lng: 77.1025, lastMaint: "2025-05-20" },
  { id: "TWR-003", city: "Bangalore", type: "Monopole", antennas: 5, status: "Active", lat: 12.9716, lng: 77.5946, lastMaint: "2025-06-15" },
  { id: "TWR-004", city: "Chennai", type: "TPL", antennas: 7, status: "Non-functional", lat: 13.0827, lng: 80.2707, lastMaint: "2025-06-01" }
];

// Hardcoded current date for demo purposes (based on September 29, 2025)
const currentDate = new Date('2025-09-29');
const maintenanceThresholdDays = 90; // Example threshold: alert if more than 90 days since last maintenance

// Map setup
const map = L.map("map").setView([20.5937, 78.9629], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Use MarkerClusterGroup for better handling of multiple markers
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
  let tableRows = "";
  
  // Clear alerts
  const alertsList = document.getElementById("alerts");
  alertsList.innerHTML = "";

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
    
    // Table rows (build string for efficiency)
    tableRows += `
      <tr>
        <td>${t.id}</td><td>${t.city}</td><td>${t.type}</td>
        <td>${t.antennas}</td><td>${t.status}</td><td>${t.lastMaint}</td>
      </tr>`;
    
    // Calculate days since last maintenance
    const lastMaintDate = new Date(t.lastMaint);
    const timeDiff = currentDate - lastMaintDate;
    const daysSince = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    // Add alerts
    let alertMessage = '';
    if (t.status !== "Active") {
      alertMessage = `${t.id} in ${t.city} is ${t.status} (Last Maintenance: ${t.lastMaint})`;
    } else if (daysSince > maintenanceThresholdDays) {
      alertMessage = `${t.id} in ${t.city} is overdue for maintenance by ${daysSince - maintenanceThresholdDays} days (Last Maintenance: ${t.lastMaint})`;
    }
    
    if (alertMessage) {
      const alertItem = document.createElement("li");
      alertItem.textContent = alertMessage;
      alertsList.appendChild(alertItem);
    }
  });
  
  // Set table content once
  tbody.innerHTML = tableRows;
  
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
  
  // Pie chart (Tower Type distribution)
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
