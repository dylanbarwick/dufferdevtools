// -------------------------
// Normalization + converters
// -------------------------
function normalizeString(str) {
  return String(str || '')
    .trim()
    .replace(/[_\-]+/g, ' ')    // underscores & dashes -> spaces
    .replace(/\s+/g, ' ')       // collapse multiple spaces
    .replace(/[^a-zA-Z0-9 ]/g, '') // remove remaining non-alphanumeric (except space)
    ;
}

// For sentence case, we want to preserve punctuation; so don't use normalizeString there
function toSentenceCase(str) {
  if (!str) return '';
  // Trim and collapse whitespace but keep punctuation
  str = String(str).trim().replace(/\s+/g, ' ');
  // Lowercase everything first, then capitalise start of string and after sentence enders
  return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
}

function toUpperCaseNorm(str) { return normalizeString(str).toUpperCase(); }
function toLowerCaseNorm(str) { return normalizeString(str).toLowerCase(); }

function toTitleCase(str) {
  return normalizeString(str)
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

function toCamelCase(str) {
  str = normalizeString(str).toLowerCase();
  // replace spaces with uppercase char, then lowercase leading char
  return str.replace(/ (.)/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, c => c.toLowerCase());
}

function toPascalCase(str) {
  str = normalizeString(str).toLowerCase();
  // upper-case first letter of each word, then remove spaces
  return str.replace(/ (.)/g, (_, c) => c.toUpperCase()).replace(/^[a-z]/, c => c.toUpperCase()).replace(/ /g, '');
}

function toSnakeCase(str) {
  return normalizeString(str).toLowerCase().replace(/ /g, '_');
}

function toKebabCase(str) {
  return normalizeString(str).toLowerCase().replace(/ /g, '-');
}

// -------------------------
// UI interactions
// -------------------------
const inputEl = document.getElementById('inputText');
const outputEl = document.getElementById('output');
const convertBtn = document.getElementById('convert');
const copyBtn = document.getElementById('copyResult');
const selectEl = document.getElementById('caseSelect');

convertBtn.addEventListener('click', () => {
  const input = inputEl.value || '';
  const method = selectEl.value;
  let result = '';

  switch (method) {
    case 'upper': result = toUpperCaseNorm(input); break;
    case 'lower': result = toLowerCaseNorm(input); break;
    case 'title': result = toTitleCase(input); break;
    case 'sentence': result = toSentenceCase(input); break;
    case 'camel': result = toCamelCase(input); break;
    case 'pascal': result = toPascalCase(input); break;
    case 'snake': result = toSnakeCase(input); break;
    case 'kebab': result = toKebabCase(input); break;
    default: result = input;
  }

  outputEl.value = result;
  // Set focus to output so users can quickly copy if they want
  outputEl.focus();
  outputEl.selectionStart = 0;
  outputEl.selectionEnd = outputEl.value.length;
});

// Copy to clipboard for result
copyBtn.addEventListener('click', async () => {
  const text = outputEl.value || '';
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    const original = copyBtn.textContent;
    copyBtn.textContent = '✅ Copied!';
    setTimeout(() => { copyBtn.textContent = original; }, 1000);
  } catch (err) {
    // Fallback: try selecting and execCommand
    try {
      outputEl.select();
      document.execCommand('copy');
      const original = copyBtn.textContent;
      copyBtn.textContent = '✅ Copied!';
      setTimeout(() => { copyBtn.textContent = original; }, 1000);
    } catch (err2) {
      alert('Copy failed — your browser may block clipboard access.');
    }
  }
});

// Load a random developer wisdom (shared file)
(function loadWisdom() {
  const el = document.getElementById('wisdom');
  if (!el) return;
  fetch('/wisdoms/wisdom.json').then(res => {
    if (!res.ok) throw new Error('no wisdom');
    return res.json();
  }).then(data => {
    if (!data || !Array.isArray(data.wisdoms)) return;
    el.textContent = data.wisdoms[Math.floor(Math.random() * data.wisdoms.length)];
  }).catch(() => {
    el.textContent = '';
  });
})();