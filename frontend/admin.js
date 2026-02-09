// Fetch emergencies (for now from localStorage)
let emergencies = JSON.parse(localStorage.getItem("adminEmergencies")) || [];

// If coming from user submit, add one (demo purpose)
const latest = JSON.parse(localStorage.getItem("emergencyStatus"));
if (latest) {
  emergencies.push({
    id: emergencies.length + 1,
    category: latest.category,
    severity: latest.severity,
    department: latest.departments,
    time: latest.time,
    status: "Active"
  });

  localStorage.setItem("adminEmergencies", JSON.stringify(emergencies));
}

// Stats
document.getElementById("total").innerText = emergencies.length;
document.getElementById("active").innerText =
  emergencies.filter(e => e.status === "Active").length;
document.getElementById("critical").innerText =
  emergencies.filter(e => e.severity === "Critical").length;

// Populate table
const table = document.getElementById("reportTable");

emergencies.forEach(e => {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${e.id}</td>
    <td>${e.category}</td>
    <td class="sev-${e.severity}">${e.severity}</td>
    <td>${e.department}</td>
    <td>${e.time}</td>
    <td>${e.status}</td>
  `;

  table.appendChild(row);
});
