document.addEventListener("mousemove", e => {
  const c = document.querySelector(".cursor");
  c.style.left = e.clientX + "px";
  c.style.top = e.clientY + "px";
});

function analyze() {
  document.getElementById("ai-text").innerText =
    "Analyzing input… determining severity and response team.";

  setTimeout(() => {
    const categories = ["Police", "Ambulance", "Fire Station"];
    const severity = ["Low", "Medium", "High", "Critical"];

    const c = categories[Math.floor(Math.random()*categories.length)];
    const s = severity[Math.floor(Math.random()*severity.length)];

    document.getElementById("category").innerText = c;
    document.getElementById("severity").innerText = s;

    document.getElementById("message").innerText =
`Emergency Category: ${c}
Severity Level: ${s}

Description:
${description.value}

Status:
Forwarded to nearest unit immediately.`;

    document.getElementById("time").innerText =
      "Timestamp: " + new Date().toLocaleString();

    document.getElementById("result").classList.remove("hidden");
    document.getElementById("ai-text").innerText =
      "Assessment complete. Emergency teams have been notified.";
  }, 2200);
}
