// Track cursor position for insertion
const textarea = document.getElementById('template');
let caretPosition = 0;
textarea.addEventListener('click', saveCaret);
textarea.addEventListener('keyup', saveCaret);
textarea.addEventListener('select', saveCaret);
function saveCaret() { caretPosition = textarea.selectionStart; }

// Insert token at cursor when button clicked
document.querySelectorAll('.token-btn').forEach(btn => {
  btn.addEventListener('mousedown', e => e.preventDefault()); // keep focus
  btn.addEventListener('click', e => {
    if (e.target.classList.contains('copy-icon')) return; // skip if copy icon
    const token = btn.dataset.token;
    const start = textarea.value.substring(0, caretPosition);
    const end = textarea.value.substring(caretPosition);
    textarea.value = start + token + end;
    caretPosition += token.length;
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = caretPosition;
  });
});

// Copy token directly when copy icon clicked
document.querySelectorAll('.copy-icon').forEach(icon => {
  icon.addEventListener('click', e => {
    e.stopPropagation();
    const token = e.target.parentElement.dataset.token;
    navigator.clipboard.writeText(token).then(() => {
      const original = e.target.textContent;
      e.target.textContent = "✅";
      setTimeout(() => { e.target.textContent = original; }, 800);
    });
  });
});

// Copy generated JSON button
document.getElementById('copy-json').addEventListener('click', () => {
  const jsonText = document.getElementById('output').textContent.trim();
  if (!jsonText) return;
  navigator.clipboard.writeText(jsonText).then(() => {
    const btn = document.getElementById('copy-json');
    const original = btn.textContent;
    btn.textContent = "✅ Copied!";
    setTimeout(() => { btn.textContent = original; }, 1000);
  });
});

// Dummy data arrays
const firstNames = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy", "Trevor", "Susan"];
const lastNames = ["Smith", "Jones", "Brown", "Taylor", "Wilson", "Davis", "Miller", "Moore", "Banister", "Walpole"];
const cities = ["London", "New York", "Berlin", "Sydney", "Tokyo", "Paris", "Toronto"];
const countries = ["United Kingdom", "United States", "Germany", "Australia", "Japan", "France", "Canada"];

function randomLoremIpsum() {
  const words = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt".split(" ");
  return Array.from({ length: Math.floor(Math.random() * 5) + 3 }, () => words[Math.floor(Math.random() * words.length)]).join(" ");
}
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16);
  });
}

// Generate JSON
document.getElementById('generate').addEventListener('click', () => {
  const template = textarea.value;
  const count = parseInt(document.getElementById('count').value, 10);
  const result = [];
  let increment = 1;

  for (let i = 0; i < count; i++) {
    const thisFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const thisLastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    let jsonStr = template
      .replace(/\|\|firstName\|\|/g, thisFirstName)
      .replace(/\|\|lastName\|\|/g, thisLastName)
      .replace(/\|\|fullName\|\|/g, `${thisFirstName} ${thisLastName}`)
      .replace(/\|\|email\|\|/g, `${thisFirstName.toLowerCase()}.${thisLastName.toLowerCase()}@example.com`)
      .replace(/\|\|city\|\|/g, cities[Math.floor(Math.random() * cities.length)])
      .replace(/\|\|country\|\|/g, countries[Math.floor(Math.random() * countries.length)])
      .replace(/\|\|age\|\|/g, Math.floor(Math.random() * 48) + 18)
      .replace(/\|\|randomNumber\|\|/g, Math.floor(Math.random() * 100000))
      .replace(/\|\|randomLoremIpsum\|\|/g, randomLoremIpsum)
      .replace(/\|\|uuid\|\|/g, uuid)
      .replace(/\|\|increment\|\|/g, increment++);
    console.log(jsonStr);

    result.push(jsonStr);
  }
  console.log(result);

  document.getElementById('output').textContent = "[\n" + result.join(",\n") + "\n]";
});

// Load a random developer wisdom
fetch('/wisdoms/wisdom.json')
  .then(res => res.json())
  .then(data => {
    const w = data.wisdoms;
    document.getElementById('wisdom').textContent = w[Math.floor(Math.random() * w.length)];
  });
