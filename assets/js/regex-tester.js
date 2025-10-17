const inputText = document.getElementById('inputText');
const textareaWrapper = document.getElementById('textareaWrapper');
const regexField = document.getElementById('regex');
const output = document.getElementById('output');
const flagGlobal = document.getElementById('flagGlobal');
const flagInsensitive = document.getElementById('flagInsensitive');
const flagMultiline = document.getElementById('flagMultiline');
const replacement = document.getElementById('replacement');
const mode = document.getElementById('mode');

const testButton = document.getElementById('testRegex');
const resetButton = document.getElementById('resetAll');

const regexFlagsDisplay = document.getElementById('regexFlags');
const copyBareBtn = document.getElementById('copyBare');
const copyFullBtn = document.getElementById('copyFull');

function getActiveFlags() {
  let flags = '';
  if (flagGlobal.checked) flags += 'g';
  if (flagInsensitive.checked) flags += 'i';
  if (flagMultiline.checked) flags += 'm';
  return flags;
}

function updateFlagsDisplay() {
  regexFlagsDisplay.textContent = getActiveFlags();
}

[flagGlobal, flagInsensitive, flagMultiline].forEach(flag => {
  flag.addEventListener('change', updateFlagsDisplay);
});
updateFlagsDisplay();

// Copy bare pattern
copyBareBtn.addEventListener('click', () => {
  const pattern = regexField.value.trim();
  if (!pattern) {
    alert('No regex to copy.');
    return;
  }
  navigator.clipboard.writeText(pattern)
    .then(() => alert(`Copied bare pattern: ${pattern}`))
    .catch(() => alert('Failed to copy.'));
});

// Copy full literal form
copyFullBtn.addEventListener('click', () => {
  const pattern = regexField.value.trim();
  if (!pattern) {
    alert('No regex to copy.');
    return;
  }
  const flags = getActiveFlags();
  const full = `/${pattern}/${flags}`;
  navigator.clipboard.writeText(full)
    .then(() => alert(`Copied full regex: ${full}`))
    .catch(() => alert('Failed to copy.'));
});


// Show/hide replacement field
mode.addEventListener('change', () => {
  replacement.classList.toggle('hidden', mode.value !== 'replace');
});

// Reset all
resetButton.addEventListener('click', () => {
  inputText.value = '';
  regexField.value = '';
  output.value = '';
  flagGlobal.checked = false;
  flagInsensitive.checked = false;
  flagMultiline.checked = false;
  replacement.value = '';
  replacement.classList.add('hidden');
  mode.value = 'match';
});

// Test regex
const inputTextArea = document.getElementById('inputText');
const highlightOverlay = document.getElementById('highlightOverlay');

// Keep overlay in sync with textarea scroll
inputTextArea.addEventListener('scroll', () => {
  highlightOverlay.scrollTop = inputTextArea.scrollTop;
  highlightOverlay.scrollLeft = inputTextArea.scrollLeft;
});

// Run highlighting when testing regex
function highlightMatches(pattern, flags) {
  const text = inputTextArea.value;
  if (!pattern) {
    highlightOverlay.innerHTML = escapeHtml(text);
    return;
  }

  try {
    const regex = new RegExp(pattern, flags);
    if (!flags.includes('g')) {
      // If not global, highlight only first match
      const match = text.match(regex);
      if (!match) {
        highlightOverlay.innerHTML = escapeHtml(text);
        return;
      }
      const [m] = match;
      const before = escapeHtml(text.slice(0, match.index));
      const after = escapeHtml(text.slice(match.index + m.length));
      highlightOverlay.innerHTML = `${before}<mark>${escapeHtml(m)}</mark>${after}`;
      return;
    }

    const highlighted = escapeHtml(text).replace(regex, m => `<mark>${escapeHtml(m)}</mark>`);
    highlightOverlay.innerHTML = highlighted;
  } catch {
    highlightOverlay.innerHTML = escapeHtml(text);
  }
}

// Escape HTML to prevent rendering issues
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, tag => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[tag]
  ));
}

testButton.addEventListener('click', () => {
  const pattern = regexField.value.trim();
  const flags = getActiveFlags();
  highlightMatches(pattern, flags);
  const text = inputText.value;

  if (!pattern) {
    alert('Please enter a regular expression.');
    return;
  }

  try {
    const regex = new RegExp(pattern, flags);
    if (mode.value === 'match') {
      const matches = text.match(regex);
      output.value = matches ? matches.join('\n') : '[No matches found]';
    } else {
      const replaced = text.replace(regex, replacement.value);
      output.value = replaced;
    }
  } catch (err) {
    output.value = `Error: Invalid regular expression\n\n${err.message}`;
  }
});

regexField.addEventListener('input', () => {
  const pattern = regexField.value.trim();
  const flags = getActiveFlags();
  highlightMatches(pattern, flags);
});

const presetTests = document.getElementById('presetTests');
const loadDemoText = document.getElementById('loadDemoText');

const demoText = `We have been persuaded by some that are careful of our safety, to take heed how we commit our selves to armed multitudes, for fear of treachery; but I assure you I do not desire to live to distrust my faithful and loving people.

Let tyrants fear. I have always so behaved myself that, under God, I have placed my chiefest strength and safeguard in the loyal hearts and good-will of my subjects; and therefore I am come amongst you, as you see, at this time, not for my recreation and disport, but being resolved, in the midst and heat of the battle, to live and die amongst you all; to lay down for my God, and for my kingdom, and my people, my honour and my blood, even in the dust.`;

loadDemoText.addEventListener('click', e => {
  e.preventDefault();
  inputTextArea.value = demoText;
  highlightOverlay.innerHTML = escapeHtml(demoText);
});

presetTests.addEventListener('change', () => {
  const v = presetTests.value;
  resetFlagsAndMode();
  replacement.value = '';
  replacement.classList.add('hidden');

  switch (v) {
    case 'upperLetters':
      regexField.value = '[A-Z]';
      mode.value = 'match';
      flagGlobal.checked = true;
      break;

    case 'upperWords':
      regexField.value = '\\b[A-Z][a-zA-Z]*';
      mode.value = 'match';
      flagGlobal.checked = true;
      break;

    case 'vowelWords':
      regexField.value = '[aeiouAEIOU]\\w*';
      mode.value = 'match';
      flagGlobal.checked = true;
      break;

    case 'replaceUpper':
      regexField.value = '[A-Z]';
      mode.value = 'replace';
      flagGlobal.checked = true;
      replacement.value = '#';
      replacement.classList.remove('hidden');
      break;

    case 'replaceBrackets':
      regexField.value = '\\b([A-Z][a-zA-Z]*)\\b';
      mode.value = 'replace';
      flagGlobal.checked = true;
      replacement.value = '<<$1>>';
      replacement.classList.remove('hidden');
      break;

    case 'replaceVowels':
      regexField.value = '[aeiouAEIOU]\\w*';
      mode.value = 'replace';
      flagGlobal.checked = true;
      replacement.value = '@';
      replacement.classList.remove('hidden');
      break;
  }

  updateFlagsDisplay();
});

function resetFlagsAndMode() {
  flagGlobal.checked = false;
  flagInsensitive.checked = false;
  flagMultiline.checked = false;
  mode.value = 'match';
}

// Sync overlay and textarea heights
function syncOverlayHeightInitial() {
  inputTextArea.style.height = 'auto'; // let it shrink/expand naturally
  const trueHeight = textareaWrapper.offsetHeight;
  inputTextArea.style.height = ''; // reset to CSS value
  highlightOverlay.style.height = (trueHeight - 3) + 'px';
  console.log('Textarea scrollHeightInitial:', trueHeight);
  console.log('textareaWrapper height: ' + textareaWrapper.offsetHeight);
}

function syncOverlayHeight() {
  console.log('currentScrollHeight: ' + inputTextArea.scrollHeight);
  console.log(textareaWrapper.offsetHeight);
  //inputTextArea.style.height = 'auto'; // let it shrink/expand naturally
  const trueHeight = textareaWrapper.offsetHeight;
  //inputTextArea.style.height = ''; // reset to CSS value
  highlightOverlay.style.height = (trueHeight - 3) + 'px';
  console.log('Textarea scrollHeight: ' + inputTextArea.scrollHeight + ' | trueHeight: ' + trueHeight);
}


// After loading demo text
loadDemoText.addEventListener('click', e => {
  e.preventDefault();
  inputTextArea.value = demoText;
  highlightOverlay.innerHTML = escapeHtml(demoText);
  syncOverlayHeight();
});

// While typing
inputTextArea.addEventListener('input', syncOverlayHeight);

// While resizing (user drags corner)
inputTextArea.addEventListener('mouseup', syncOverlayHeight);

// On window resize (text reflows)
window.addEventListener('resize', syncOverlayHeight);

// After initial page load
document.addEventListener('DOMContentLoaded', syncOverlayHeightInitial);
