const data = JSON.parse(localStorage.getItem("emergencyStatus"));

if (data) {
  category.innerText = data.category;
  severity.innerText = data.severity;
  departments.innerText = data.departments;
  time.innerText = data.time;
}

// Progress animation
setTimeout(() => {
  document.getElementById("p-analyze").classList.add("active");
}, 1000);

setTimeout(() => {
  document.getElementById("p-classify").classList.add("active");
}, 2200);

setTimeout(() => {
  document.getElementById("p-forward").classList.add("active");
}, 3500);

// Calming messages
const messages = [
  "You’re doing the right thing.",
  "Emergency services are responding.",
  "Stay calm. Help is on the way.",
  "I’m here with you until help arrives."
];

let i = 0;
setInterval(() => {
  calmText.innerText = messages[i % messages.length];
  i++;
}, 4000);
