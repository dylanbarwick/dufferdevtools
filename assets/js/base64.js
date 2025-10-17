const input = document.getElementById('input');
const output = document.getElementById('output');
const encodeBtn = document.getElementById('encode');
const decodeBtn = document.getElementById('decode');
const copyOutput = document.getElementById('copyOutput');
const downloadOutput = document.getElementById('downloadOutput');
const fileInput = document.getElementById('fileInput');
const resetFile = document.getElementById('resetFile');
const fileInfo = document.getElementById('fileInfo');
const MAX_SIZE = 1 * 1024 * 1024; // 1 MB

let currentBlobUrl = null;

// --- Utility functions ---
function utf8ToB64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function b64ToUtf8(str) {
  return decodeURIComponent(escape(atob(str)));
}
function isProbablyText(data) {
  return /^[\x09\x0A\x0D\x20-\x7EÀ-ž]+$/.test(data);
}
function formatSize(bytes) {
  return bytes < 1024
    ? `${bytes} B`
    : bytes < 1048576
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1048576).toFixed(2)} MB`;
}

// --- Update button labels ---
function updateButtonLabels() {
  const hasText = input.value.trim().length > 0;
  const hasFile = fileInput.files.length > 0;

  if (hasText && !hasFile) {
    encodeBtn.textContent = "Encode Text";
    decodeBtn.textContent = "Decode Text";
  } else if (!hasText && hasFile) {
    encodeBtn.textContent = "Encode File";
    decodeBtn.textContent = "Decode File";
  } else {
    encodeBtn.textContent = "Encode";
    decodeBtn.textContent = "Decode";
  }
}

// --- File input listener ---
fileInput.addEventListener('change', () => {
  updateButtonLabels();

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    fileInfo.textContent = `File loaded: ${file.name} (${formatSize(file.size)})`;
    fileInfo.style.display = "block";
  } else {
    fileInfo.textContent = "";
    fileInfo.style.display = "none";
  }
});

// --- Reset file button ---
resetFile.addEventListener('click', () => {
  fileInput.value = '';
  fileInfo.textContent = '';
  fileInfo.style.display = 'none';
  updateButtonLabels();
});

// --- Textarea listener ---
input.addEventListener('input', updateButtonLabels);
updateButtonLabels();

// --- Encode button ---
encodeBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  const hasText = input.value.trim().length > 0;

  if (file && !hasText) {
    if (file.size > MAX_SIZE) {
      alert("File too large (max 1MB).");
      return;
    }
    const buffer = await file.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    output.value = btoa(binary);
    downloadOutput.style.display = "none";
  } else if (hasText) {
    try {
      output.value = utf8ToB64(input.value);
      downloadOutput.style.display = "none";
    } catch (e) {
      alert("Encoding failed: " + e.message);
    }
  } else {
    alert("Please enter text or choose a file first.");
  }
});

// --- Decode button ---
decodeBtn.addEventListener('click', async () => {
  try {
    // --- Step 1: Load data from text area or file ---
    let inputData = input.value.trim();
    const file = fileInput.files[0];

    if (!inputData && !file) {
      alert("Please paste Base64 text or select a Base64 file first.");
      return;
    }

    if (file && !inputData) {
      inputData = await file.text();
    }

    // --- Step 2: Clean Base64 (remove spaces, newlines, stray chars) ---
    const cleanBase64 = inputData.replace(/[^A-Za-z0-9+/=]/g, '');

    // --- Step 3: Decode into bytes ---
    let byteCharacters;
    try {
      byteCharacters = atob(cleanBase64);
    } catch (e) {
      alert("Error: Input does not appear to be valid Base64 data.");
      return;
    }

    const bytes = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      bytes[i] = byteCharacters.charCodeAt(i);
    }

    // --- Step 4: Detect file type by magic number ---
    function guessFileExtension(bytes) {
      const textStart = String.fromCharCode(...bytes.slice(0, 32));

      // --- Binary signatures ---
      if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return '.png';
      if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return '.jpg';
      if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return '.gif';
      if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return '.pdf';
      if (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) return '.zip';
      if (bytes[0] === 0x42 && bytes[1] === 0x4D) return '.bmp';
      if (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0x00) return '.ico';
      if (bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2A && bytes[3] === 0x00) return '.tif';
      if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
        // Could be WAV or WEBP
        const subtype = String.fromCharCode(...bytes.slice(8, 12));
        if (subtype === 'WEBP') return '.webp';
        if (subtype === 'WAVE') return '.wav';
      }
      if (bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) return '.ogg';

      // --- Text-based detection (developer friendly) ---
      if (textStart.includes('<svg')) return '.svg';
      if (textStart.includes('<!DOCTYPE html') || textStart.includes('<html')) return '.html';
      if (textStart.trim().startsWith('{') && textStart.includes(':')) return '.json';
      if (textStart.trim().startsWith('[') && textStart.includes(']')) return '.json';
      if (textStart.includes('function') || textStart.includes('=>') || textStart.includes('var ') || textStart.includes('const ')) return '.js';
      if (textStart.includes('import ') || textStart.includes('from ') || textStart.includes('export ')) return '.js';
      if (textStart.includes('class ') && textStart.includes('{')) return '.java';
      if (textStart.includes('#include') || textStart.includes('int main')) return '.c';
      if (textStart.startsWith('<?xml')) return '.xml';
      if (textStart.includes('base64')) return '.b64';
      if (/^[\x20-\x7E\s]+$/.test(textStart)) return '.txt';

      return '.bin';
    }


    const ext = guessFileExtension(bytes);

    // --- Step 5: Create blob for download ---
    const blob = new Blob([bytes], { type: 'application/octet-stream' });
    const blobUrl = URL.createObjectURL(blob);
    downloadOutput.href = blobUrl;

    // --- Step 6: Suggest filename with timestamp ---
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const suggestedName = `decoded-${timestamp}${ext}`;
    const userFileName = prompt(
      `This looks like a '${ext}' file — is that what you were expecting?\nRename it as you see fit:`,
      suggestedName
    );

    // --- Step 7: Assign final download name ---
    downloadOutput.download = userFileName || suggestedName;
    downloadOutput.style.display = "inline-block";

    // --- Step 8: Update UI feedback ---
    output.value = `[Binary data decoded — ready to download as ${userFileName || suggestedName}]`;
    console.log(`Decoded ${bytes.length} bytes → ${userFileName || suggestedName}`);

  } catch (err) {
    console.error("Decode error:", err);
    alert("Unexpected decoding error. Check the console for details.");
  }
});



// --- Copy to clipboard ---
copyOutput.addEventListener('click', async () => {
  await navigator.clipboard.writeText(output.value);
  copyOutput.textContent = "Copied!";
  setTimeout(() => (copyOutput.textContent = "Copy to Clipboard"), 1000);
});

// --- Download handler (for robustness) ---
downloadOutput.addEventListener('click', (e) => {
  console.log('download!! ' + downloadOutput.href);
  if (!downloadOutput.href) {
    e.preventDefault();
    alert("No decoded file available to download.");
  }
});

// --- Reset button ---
const resetAll = document.getElementById('resetAll');

resetAll.addEventListener('click', () => {
  // Clear textareas
  input.value = '';
  output.value = '';

  // Clear file input and file info
  fileInput.value = '';
  fileInfo.textContent = '';
  fileInfo.style.display = 'none';

  // Hide download button
  downloadOutput.style.display = 'none';
  downloadOutput.href = '';

  // Reset button labels
  updateButtonLabels();

  // Optional: subtle fade animation
  const container = document.querySelector('.container');
  container.style.transition = 'opacity 0.2s';
  container.style.opacity = '0.5';
  setTimeout(() => {
    container.style.opacity = '1';
  }, 200);
});


// --- Download handler ---
downloadOutput.addEventListener('click', (e) => {
  if (!downloadOutput.href) {
    e.preventDefault();
    alert("No decoded file available to download.");
  }
});
