// Add this function definition somewhere in your codebase, e.g., utils/time.js

function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return `${hours}:${minutes}`;
}

module.exports = getCurrentTime;
