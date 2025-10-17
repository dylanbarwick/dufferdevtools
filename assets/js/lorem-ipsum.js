/* Dummy Text Generator - Vanilla JS
     - Generates plain lorem ipsum text
     - Enforces min: words >= 100, paras >= 1
     - Outputs plain text with paragraphs separated by blank lines
  */

(function () {
  const LOREM_PARAGRAPHS = `
        lorem ipsum dolor sit amet consectetur adipiscing elit in posuere orci id nulla semper in suscipit nisl feugiat proin iaculis tempor dui interdum commodo suspendisse eget faucibus purus donec ligula nisl aliquet ac odio eu hendrerit efficitur erat praesent tortor
        arcu gravida a suscipit sit amet egestas ut eros vivamus sit amet imperdiet sem id lobortis enim donec pretium feugiat nisi sed rhoncus urna ut tincidunt ante sed leo euismod eget placerat velit ultricies curabitur vitae quam et justo maximus interdum ac vitae erat vivamus quis sagittis dui quis placerat libero
        quisque maximus enim et blandit convallis donec porta venenatis enim malesuada semper nullam vel tortor libero suspendisse interdum justo eros mattis semper enim aliquam at donec vestibulum mi mi nulla facilisi duis molestie nisl et ornare sollicitudin nisi nibh vestibulum velit in molestie augue massa vitae mi integer rutrum arcu est quisque at justo lacus
        aliquam a dolor condimentum hendrerit purus at faucibus neque aliquam erat volutpat nullam porta fermentum ullamcorper etiam cursus dolor et tempor semper phasellus gravida mi et velit placerat in efficitur neque malesuada sed mollis facilisis
        elit eget tincidunt justo varius eu vestibulum venenatis nisl a congue interdum sed in gravida dui interdum et malesuada fames ac ante ipsum primis in faucibus aenean nec ante mauris etiam quis pharetra eros vestibulum tortor nisl fermentum vitae tempor vel luctus vel augue suspendisse lacinia ligula sit amet sapien pharetra fringilla malesuada tellus
        congue proin cursus dapibus sapien nec tristique dui imperdiet ac curabitur et pretium turpis aliquam eget venenatis lacus duis a facilisis tellus nunc commodo non magna sed fermentum in vehicula ipsum leo eget pellentesque eros luctus sed mauris faucibus tristique orci ac rutrum suspendisse ultricies neque at magna facilisis vestibulum fusce nec turpis libero
        donec porttitor ante leo vel tempor mi consectetur sed quisque a condimentum purus nam vel quam a elit lacinia pharetra vitae vel diam aliquam lectus purus blandit quis rhoncus vitae suscipit vel tellus aenean vel nunc aliquam rhoncus purus id semper ex sed et justo aliquam
        consequat ex ac venenatis eros curabitur viverra ligula id tellus pulvinar molestie nullam volutpat tellus quis consectetur facilisis sed blandit elit vitae consequat porttitor leo ligula consequat
        ligula sed efficitur massa magna sit amet dolor aenean in ultricies justo aliquam ut sodales lorem nullam in dui vestibulum dictum turpis in molestie ante nam ac ultricies felis ut volutpat felis pulvinar turpis tristique vel bibendum diam luctus ut congue 
        orci ac tellus maximus molestie eu sit amet nisi duis pretium non lacus in vestibulum fusce sed aliquet dui vivamus odio tortor tristique non tincidunt eget congue sed dui nulla facilisi morbi eu pellentesque sapien nulla varius finibus vulputate
        `.trim().split(/\n/);

  const outputEl = document.getElementById('output');
  const generateBtn = document.getElementById('generateBtn');
  const copyBtn = document.getElementById('copyBtn');
  const wordsInput = document.getElementById('words');
  const parasInput = document.getElementById('paras');
  const errorEl = document.getElementById('error');
  const messageEl = document.getElementById('message');
  const capitaliseParaCheckbox = document.getElementById('capitalise_paragraph');
  const capitaliseSentenceCheckbox = document.getElementById('capitalise_sentence');

  function getRandomParagraph() {
    const index = Math.floor(Math.random() * LOREM_PARAGRAPHS.length);
    return LOREM_PARAGRAPHS[index].trim();
  }

  let lastIndices = [];

  function getRandomParagraphUnique() {
    let index;
    do {
      index = Math.floor(Math.random() * LOREM_PARAGRAPHS.length);
    } while (lastIndices.includes(index) && lastIndices.length < LOREM_PARAGRAPHS.length);

    lastIndices.push(index);
    if (lastIndices.length > 3) lastIndices.shift(); // remember only last 3
    return LOREM_PARAGRAPHS[index].trim();
  }

  function getRandomizedParagraph() {
    const paragraph = getRandomParagraphUnique();
    let sentences = paragraph.split(/(?<=\.)\s+/).filter(Boolean);

    // Merge tiny fragments (< 3 words) with next sentence
    for (let i = 0; i < sentences.length - 1; i++) {
      const wordCount = sentences[i].split(' ').length;
      if (wordCount < 3) {
        sentences[i + 1] = sentences[i] + ' ' + sentences[i + 1];
        sentences[i] = '';
      }
    }
    sentences = sentences.filter(s => s.trim() !== '');

    // Randomize but preserve local flow
    for (let i = sentences.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sentences[i], sentences[j]] = [sentences[j], sentences[i]];
    }

    return sentences.join(' ');
  }

  function clampInt(n, min) {
    n = parseInt(n, 10);
    if (Number.isNaN(n)) return min;
    return Math.max(n, min);
  }

  // Distribute totalWords across paragraphs fairly
  function distributeWords(totalWords, paras) {
    const base = Math.floor(totalWords / paras);
    const rem = totalWords - base * paras;
    const arr = new Array(paras).fill(base);
    for (let i = 0; i < rem; i++) arr[i] += 1;
    return arr;
  }

  // Build a paragraph with exactly `count` words using repeated lorem words.
  // Adds simple punctuation: every 10-18 words place a period, and commas occasionally.
  function makeParagraph(count) {
    const words = [];
    let loremPara = getRandomizedParagraph().split(' ');
    let loremIdx = 0;
    let wordsSincePunct = 0;
    for (let i = 0; i < count; i++) {
      let w = loremPara[loremIdx % loremPara.length];
      loremIdx++;
      wordsSincePunct++;
      // Occasionally append comma to simulate natural flow (not on last word)
      if (wordsSincePunct > 3 && Math.random() < 0.08 && i < count - 1) {
        w = w + ',';
      }
      // Periods will be managed by sentence boundaries below.
      words.push(w);
      // Place sentence end occasionally between 8-18 words
      if (wordsSincePunct >= 8 && Math.random() < 0.16) {
        // append period to last word if not already punctuated
        const last = words.length - 1;
        if (!/[.,!?]$/.test(words[last])) {
          words[last] = words[last] + '.';
        }
        wordsSincePunct = 0;
      }
    }
    // Ensure paragraph ends with a period
    if (!/[.!?]$/.test(words[words.length - 1])) {
      words[words.length - 1] = words[words.length - 1] + '.';
    }
    // Join into single string
    return words.join(' ');
  }

  function generate() {
    errorEl.hidden = true;
    messageEl.textContent = '';
    let totalWords = clampInt(wordsInput.value, 100);
    const paras = clampInt(parasInput.value, 1);

    // If user typed smaller than min, reflect it back
    if (Number(wordsInput.value) < 100) {
      messageEl.textContent = 'Number of words must be at least 100 — adjusted automatically.';
      wordsInput.value = totalWords;
    }

    if (Number(parasInput.value) < 1) {
      parasInput.value = 1;
    }

    // Distribute words
    const allocation = distributeWords(totalWords, paras);

    // Build paragraphs
    const paragraphs = allocation.map((wcount, i) => {
      let p = makeParagraph(wcount);
      if (capitaliseParaCheckbox.checked) {
        // Capitalise first alpha char
        p = p.replace(/^[a-z]/, (m) => m.toUpperCase());
      }
      if (capitaliseSentenceCheckbox.checked) {
        // Capitalise first letter after `.`

        // Split the text into sentences
        // using regular expressions
        const sentences = p.split(/\.|\?|!/);

        // Capitalize the first letter of each sentence
        const capitalizedSentences = sentences
          // Remove empty sentences
          .filter(sentence =>
            sentence.trim() !== '')
          .map(sentence =>
            sentence.trim()[0]
              .toUpperCase() +
            sentence.trim().slice(1));

        // Join the sentences back together
        p = capitalizedSentences.join('. ') + '.';
      }
      return p;
    });

    // Join with blank line between paragraphs
    const finalText = paragraphs.join('\n\n');
    outputEl.value = finalText;
    outputEl.focus();
    outputEl.setSelectionRange(0, 0);
    return finalText;
  }

  // Copy to clipboard
  async function copyToClipboard() {
    const text = outputEl.value;
    if (!text) {
      errorEl.hidden = false;
      errorEl.textContent = 'Nothing to copy yet — generate some text first.';
      return;
    }
    try {
      // Try modern clipboard API
      await navigator.clipboard.writeText(text);
      messageEl.textContent = 'Copied to clipboard ✓';
      // briefly show confirmation
      setTimeout(() => { if (messageEl.textContent === 'Copied to clipboard ✓') messageEl.textContent = ''; }, 2200);
    } catch (err) {
      // Fallback for older browsers: select + execCommand
      try {
        outputEl.select();
        if (document.execCommand && document.execCommand('copy')) {
          messageEl.textContent = 'Copied to clipboard ✓';
          setTimeout(() => { if (messageEl.textContent === 'Copied to clipboard ✓') messageEl.textContent = ''; }, 2200);
        } else {
          throw new Error('Copy command failed');
        }
      } catch (e) {
        errorEl.hidden = false;
        errorEl.textContent = 'Unable to copy automatically — select the text and copy manually.';
      }
    }
  }

  // Event listeners
  generateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    generate();
  });

  copyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    copyToClipboard();
  });

  // Allow Enter on inputs to generate quickly
  [wordsInput, parasInput].forEach(inp => {
    inp.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        generate();
      }
    });
  });

  // auto-generate initial content
  generate();

})();