const API_URL = "https://script.google.com/macros/s/AKfycbwT9-VeFVOitzmBYdo7l66_4rQCu3q8gWd6ZJYvCnijMTWovzGIVqm3sWRghWW49sKN3w/exec";

const deviceId = localStorage.getItem("device_id") ||
  (() => {
    const id = "DEV-" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem("device_id", id);
    return id;
  })();

function showMessage(text, success = true) {
  const msg = document.getElementById("message");
  msg.style.color = success ? "green" : "red";
  msg.innerText = text;
}

function sendScan(participantId) {
  const payload = {
    participant_id: participantId,
    device_id: deviceId
  };

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    if (data.result === "ON_TIME") showMessage("Recorded – On Time");
    else if (data.result === "LATE") showMessage("Recorded – Late");
    else if (data.result === "DUPLICATE") showMessage("Duplicate Scan", false);
    else showMessage(data.result, false);
  })
  .catch(() => {
    saveOffline(payload);
    showMessage("Saved Offline");
  });
}

function saveOffline(payload) {
  const queue = JSON.parse(localStorage.getItem("offline_queue") || "[]");
  queue.push(payload);
  localStorage.setItem("offline_queue", JSON.stringify(queue));
}

function syncOffline() {
  const queue = JSON.parse(localStorage.getItem("offline_queue") || "[]");
  if (!queue.length) return;

  queue.forEach(payload => {
    fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  });

  localStorage.removeItem("offline_queue");
}

window.addEventListener("online", syncOffline);

const scanner = new Html5Qrcode("scanner");

scanner.start(
  { facingMode: "environment" },
  { fps: 10, qrbox: 250 },
  (decodedText) => {
    sendScan(decodedText.trim());
  }
);


