/* ===============================
   Custom Cursor
================================ */
document.addEventListener("mousemove", (e) => {
  const c = document.querySelector(".cursor");
  if (!c) return;
  c.style.left = e.clientX + "px";
  c.style.top = e.clientY + "px";
});

/* ===============================
   Submit Emergency (MAIN FLOW)
================================ */
function submitEmergency() {
  const descriptionEl = document.getElementById("description");
  const mediaEl = document.getElementById("media");

  if (!descriptionEl || descriptionEl.value.trim() === "") {
    alert("Please describe the emergency.");
    return;
  }

  // AI simulation
  const categories = ["Police", "Ambulance", "Fire Station"];
  const severityLevels = ["Low", "Medium", "High", "Critical"];

  const category =
    descriptionEl.value.toLowerCase().includes("fire")
      ? "Fire Station"
      : descriptionEl.value.toLowerCase().includes("injured")
      ? "Ambulance"
      : categories[Math.floor(Math.random() * categories.length)];

  const severity =
    descriptionEl.value.toLowerCase().includes("unconscious")
      ? "Critical"
      : severityLevels[Math.floor(Math.random() * severityLevels.length)];

  const emergencyData = {
    id: Date.now(),
    description: descriptionEl.value,
    category: category,
    severity: severity,
    departments: category,
    mediaCount: mediaEl ? mediaEl.files.length : 0,
    time: new Date().toLocaleString(),
    status: "Active"
  };

  /* ===============================
     Store for USER STATUS SCREEN
  ================================ */
  localStorage.setItem("emergencyStatus", JSON.stringify(emergencyData));

  /* ===============================
     Store for ADMIN DASHBOARD
  ================================ */
  const existing =
    JSON.parse(localStorage.getItem("adminEmergencies")) || [];

  existing.push(emergencyData);

  localStorage.setItem(
    "adminEmergencies",
    JSON.stringify(existing)
  );

  /* ===============================
     Redirect to Status Page
  ================================ */
  window.location.href = "status.html";
}
