// /wisdoms/wisdom.js

(async function showRandomWisdom() {
  const wisdomDisplay = document.getElementById("wisdomDisplay");
  if (!wisdomDisplay) return;

  const isUnwisdom = Math.random() < 0.5; // 50/50 chance
  const source = isUnwisdom ? "unwisdom" : "wisdom";

  try {
    const res = await fetch(`/wisdoms/${source}.json`);
    const list = await res.json();
    const randomItem = list[Math.floor(Math.random() * list.length)];

    // Create wrapper
    const span = document.createElement("span");
    span.textContent = randomItem;
    span.classList.add("wisdom-line");
    span.classList.add(isUnwisdom ? "unwisdom" : "wisdom");

    wisdomDisplay.innerHTML = "";
    wisdomDisplay.appendChild(span);
  } catch (err) {
    console.error("Error loading wisdoms:", err);
  }
})();
