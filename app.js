/* ── CLINIQ app.js ── */

// ── Theme ──
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
let currentTheme = localStorage.getItem('cliniq-theme') || (prefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', currentTheme);

function updateThemeUI() {
  // SVG icons are toggled via CSS [data-theme] selectors — no JS icon swap needed
  const meta = document.getElementById('themeColorMeta');
  if (meta) meta.content = currentTheme === 'dark' ? '#080c10' : '#f4f7fb';
  // Update mobile toggle label
  const mobileLabel = document.getElementById('mobileThemeIcon');
  if (mobileLabel) {
    mobileLabel.textContent = currentTheme === 'dark' ? '☀️  Switch to Light' : '🌙  Switch to Dark';
  }
}

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem('cliniq-theme', currentTheme);
  updateThemeUI();
}
document.getElementById('themeToggle').addEventListener('click', toggleTheme);
updateThemeUI();

// ── Hamburger ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('is-open', open);
  hamburger.setAttribute('aria-expanded', open);
  mobileMenu.hidden = !open;
});
function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  mobileMenu.hidden = true;
  hamburger.classList.remove('is-open');
  hamburger.setAttribute('aria-expanded', 'false');
}

// ── Navbar scroll ──
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const onScroll = () => navbar.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ── Scroll reveal ──
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
}

function refreshScrollReveal() {
  document.querySelectorAll('.reveal:not(.is-visible)').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) el.classList.add('is-visible');
  });
}

// ── View Manager ──
let currentView = 'home';
function showView(id) {
  // If navigating AWAY from test view, save progress silently first
  if (currentView === 'test' && id !== 'test') {
    saveIncompleteTestSilent();
  }

  const next = document.getElementById('view-' + id);
  const prev = document.querySelector('.view.active');
  if (prev && prev !== next) {
    prev.classList.remove('active');
  }
  if (next) {
    next.classList.remove('active');
    void next.offsetWidth;
    next.classList.add('active');
  }
  currentView = id;

  // Toggle body class so navbar hides during test
  document.body.classList.toggle('in-test', id === 'test');

  window.scrollTo(0, 0);
  closeMobileMenu();
  if (id === 'subjects') renderSubjects();
  if (id === 'home') {
    renderPreviewGrid(activePreviewYear || '1st');
    loadIncompleteTests();
    requestAnimationFrame(refreshScrollReveal);
  }
}
function scrollToFeatures() {
  document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

// ── Subjects Data ──
const SUBJECTS = [
  // 1st Year
  { id:'anatomy',      name:'Anatomy',        year:'1st', icon:'AN', info:'8 Topics • 1200+ MCQs', available:true },
  { id:'physiology',   name:'Physiology',     year:'1st', icon:'PH', info:'300+ MCQs',            available:true },
  { id:'biochemistry', name:'Biochemistry',   year:'1st', icon:'BC', info:'200+ MCQs',            available:true },

  // 2nd Year
  { id:'pathology',    name:'Pathology',      year:'2nd', icon:'PA', info:'Coming Soon',          available:false },
  { id:'microbiology', name:'Microbiology',   year:'2nd', icon:'MI', info:'Coming Soon',          available:false },
  { id:'pharmacology', name:'Pharmacology',   year:'2nd', icon:'PR', info:'Coming Soon',          available:false },

  // 3rd Year
  { id:'psm',          name:'PSM',            year:'3rd', icon:'PS', info:'500+ MCQs',            available:true },
  { id:'medicine',     name:'Medicine',       year:'final', icon:'MD', info:'400+ MCQs',          available:true },
  { id:'obstetrics',   name:'Obstetrics',     year:'final', icon:'OB', info:'200+ MCQs',          available:true },
  { id:'gynaecology',  name:'Gynaecology',    year:'final', icon:'GY', info:'200+ MCQs',          available:true },
  { id:'surgery',      name:'Surgery',        year:'final', icon:'SU', info:'200+ MCQs',          available:true },
  { id:'orthopaedics', name:'Orthopaedics',   year:'final', icon:'OR', info:'150+ MCQs',          available:true },
  { id:'paediatrics',  name:'Paediatrics',    year:'final', icon:'PD', info:'150+ MCQs',          available:true },
  { id:'ent',          name:'ENT',            year:'final', icon:'EN', info:'Coming Soon',          available:false },
  { id:'ophthalmology',name:'Ophthalmology',  year:'final', icon:'OP', info:'Coming Soon',          available:false },
  { id:'dermatology',  name:'Dermatology',    year:'final', icon:'DE', info:'Coming Soon',          available:false },
  { id:'psychiatry',   name:'Psychiatry',     year:'final', icon:'PSY',info:'Coming Soon',          available:false },
  { id:'anaesthesia',  name:'Anaesthesia',    year:'final', icon:'ANE',info:'Coming Soon',          available:false },
  { id:'radiology',    name:'Radiology',      year:'final', icon:'RA', info:'Coming Soon',          available:false },
];

const ANATOMY_TOPICS = [
  { id:'all',      name:'All Topics',        icon:'ALL' },
  { id:'general',  name:'General Anatomy',   icon:'GEN' },
  { id:'headneck', name:'Head & Neck',       icon:'HN' },
  { id:'neuro',    name:'Neuroanatomy',      icon:'NE' },
  { id:'thorax',   name:'Thorax',            icon:'TH' },
  { id:'abdomen',  name:'Abdomen',           icon:'AB' },
  { id:'pelvis',   name:'Pelvis & Perineum', icon:'PE' },
  { id:'upper',    name:'Upper Limb',        icon:'UL' },
  { id:'lower',    name:'Lower Limb',        icon:'LL' },
];

// ── Render Subjects ──
let activeYear = '1st';
function renderSubjectCards(year, containerId) {
  const grid = document.getElementById(containerId);
  const filtered = SUBJECTS.filter(s => s.year === year);
  grid.innerHTML = filtered.map(s => `
    <div class="subject-card ${s.available ? '' : 'unavailable'}" 
         onclick="${s.available ? `selectSubject('${s.id}')` : ''}">
      <div class="subj-icon">${s.icon}</div>
      <div class="subj-name">${s.name}</div>
      <div class="subj-info">${s.info}</div>
      <span class="subj-badge ${s.available ? 'badge-available' : 'badge-soon'}">
        ${s.available ? '✓ Available' : 'Coming Soon'}
      </span>
    </div>`).join('');
}
function renderSubjects() {
  renderSubjectCards(activeYear, 'subjectsGrid');
}
function filterSubjects(btn, year) {
  activeYear = year;
  document.querySelectorAll('#view-subjects .year-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderSubjects();
}
function renderPreviewGrid(year) {
  renderSubjectCards(year, 'previewGrid');
}
let activePreviewYear = '1st';
function filterYear(btn, year) {
  activePreviewYear = year;
  document.querySelectorAll('#view-home .year-tab').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');
  renderPreviewGrid(year);
}

// ── Subject Selection ──
let selectedSubject = null;
let selectedTopic = null;
function selectSubject(id) {
  selectedSubject = id;
  if (id === 'anatomy') {
    renderTopics();
    showView('topics');
  } else {
    selectedTopic = null;
    showConfigure(id, null);
  }
}
function renderTopics() {
  const grid = document.getElementById('topicsGrid');
  grid.innerHTML = ANATOMY_TOPICS.map(t => `
    <div class="topic-card ${t.id === 'all' ? 'all-topics' : ''}" onclick="selectTopic('${t.id}')">
      <div class="topic-icon">${t.icon}</div>
      <div class="topic-name">${t.name}</div>
    </div>`).join('');
}
function selectTopic(topicId) {
  selectedTopic = topicId;
  showConfigure('anatomy', topicId);
}
function showConfigure(subject, topic) {
  selectedSubject = subject;
  selectedTopic = topic;
  const name = SUBJECTS.find(s => s.id === subject)?.name || subject;
  const topicName = topic && topic !== 'all' ? ANATOMY_TOPICS.find(t => t.id === topic)?.name : null;
  document.getElementById('configTitle').textContent = 'Configure Your Session';
  document.getElementById('configSub').textContent = topicName ? `${name} → ${topicName}` : name;
  document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('customWrap').style.display = 'none';
  document.getElementById('selectedCount').textContent = '–';
  document.getElementById('startTestBtn').disabled = true;
  selectedCount = 0;
  
  // Preload questions for this subject
  loadQuestions(subject);
  
  showView('configure');
}
function goBackFromConfig() {
  if (selectedSubject === 'anatomy') showView('topics');
  else showView('subjects');
}

// ── Count Select ──
let selectedCount = 0;
function selectCount(n) {
  selectedCount = n;
  document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
  document.getElementById('customWrap').style.display = 'none';
  document.getElementById('selectedCount').textContent = n;
  document.getElementById('startTestBtn').disabled = false;
}
function selectCustom() {
  document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
  document.getElementById('customWrap').style.display = 'block';
  document.getElementById('customCount').focus();
  document.getElementById('selectedCount').textContent = '–';
  document.getElementById('startTestBtn').disabled = true;
  document.getElementById('customCount').oninput = function() {
    const v = parseInt(this.value);
    if (v > 0) {
      selectedCount = v;
      document.getElementById('selectedCount').textContent = v;
      document.getElementById('startTestBtn').disabled = false;
    } else {
      document.getElementById('startTestBtn').disabled = true;
    }
  };
}

// ── Category Mapping Data ──
const ANATOMY_MAPPING = {
  general: [2, 5, 14, 15, 18, 20, 43, 44, 53, 55, 57, 58, 63, 64, 73, 75, 77, 78, 84, 128, 135, 136, 139, 140, 157, 163, 165, 174, 178, 191, 202],
  headneck: [1, 11, 17, 41, 42, 46, 47, 48, 49, 50, 61, 62, 66, 67, 68, 69, 70, 83, 126, 132, 134, 141, 142, 143, 144, 145, 146, 151, 152, 153, 154, 155, 160, 181, 192, 194, 196, 199, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 217],
  neuro: [3, 13, 19, 51, 54, 56, 60, 71, 74, 76, 80, 121, 122, 123, 124, 125, 137, 147, 148, 149, 150, 156, 158, 159, 201, 212, 219, 220],
  thorax: [22, 23, 33, 36, 37, 52, 72, 82, 94, 97, 98, 103, 115, 161, 164, 171, 176, 179, 185, 218, 221, 232, 238],
  pelvis: [24, 26, 27, 28, 29, 30, 38, 95, 99, 100, 106, 107, 112, 116, 118, 120, 127, 183, 184, 193, 198, 200, 223, 225, 235, 239],
  upper: [6, 7, 8, 9, 10, 12, 16, 45, 59, 65, 79, 129, 130, 131, 133, 138, 162, 172, 173, 177, 180, 203, 215, 216],
  lower: [4, 21, 31, 32, 34, 40, 86, 87, 88, 89, 90, 91, 92, 111, 166, 167, 168, 169, 170, 175, 222, 233, 236, 240]
};

// ── Subject to File Mapping ──
const SUBJECT_FILES = {
  'anatomy':      'Anatomy-Question-bank.txt',
  'physiology':   'Physiology-Question-bank.txt',
  'biochemistry': 'Biochemistry-Question-bank.txt',
  'psm':          'Community-Medicine-MCQ-Companion-Clean.txt',
  'fmt':          'Forensic-Medicine-MCQ-Companion-Clean.txt',
  'medicine':     'general.txt',
  'obstetrics':   'Obstetrics.txt',
  'gynaecology':  'Obstetrics.txt',
  'surgery':      'surgery.txt',
  'orthopaedics': 'orthpedics.txt',
  'paediatrics':  'Paediatrics.txt'
};

// ── Question Parser ──
let allQuestions = [];
let parsedQuestions = false;
let questionsCache = {}; // Cache for different subjects

async function loadQuestions(subject = 'anatomy') {
  // Check if already loaded for this subject
  if (questionsCache[subject]) {
    allQuestions = questionsCache[subject];
    parsedQuestions = true;
    return;
  }
  
  try {
    const fileName = SUBJECT_FILES[subject] || SUBJECT_FILES['anatomy'];
    const res = await fetch(fileName);
    if (!res.ok) throw new Error(`Failed to fetch ${fileName}`);
    const text = await res.text();
    allQuestions = parseQuestions(text, subject);
    questionsCache[subject] = allQuestions;
    parsedQuestions = true;
  } catch(e) {
    console.error('Failed to load questions:', e);
    allQuestions = [];
  }
}

function parseQuestions(text, subject = '') {
  const questions = [];
  // Normalize line endings and remove form feeds
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\f/g, '\n');

  // Detect QUADCRACK format
  const isQuadcrackFormat = /Options:\s*\n\s*\d+\./m.test(text);
  if (isQuadcrackFormat) return parseQuadcrackFormat(text);

  // Detect bold-answer format: **Answer: ...** used in surgery/ortho/paeds/obs/medicine files
  const isBoldAnswerFormat = /\*\*Answer:/i.test(text);
  if (isBoldAnswerFormat) return parseBoldAnswerFormat(text);

  // Original format: split by Answer: marker
  const blocks = text.split(/(?:✅\s*)?Answer:\s*/i);

  for (let i = 0; i < blocks.length - 1; i++) {
    const answerAndNext = blocks[i + 1];
    let questionBlock = blocks[i];

    const answerLine = answerAndNext.split('\n')[0].trim();

    if (i > 0) {
      const lines = questionBlock.split('\n');
      lines.shift();
      questionBlock = lines.join('\n');
    }

    const questionMarkerMatch = questionBlock.match(/\b(xvi{0,3}|xi{0,3}v?|i{1,3}v?|vi{0,3}|ix|x{1,2}i{0,3}v?|x{1,3}|[0-9]+)\s*[\.\)]\s+/i);
    if (questionMarkerMatch) {
      const markerIdx = questionBlock.indexOf(questionMarkerMatch[0]);
      questionBlock = questionBlock.substring(markerIdx);
    }

    const isCorrectTypeQuestion = /which.*correct|which.*true/i.test(questionBlock) &&
                                  /\bi\)/i.test(questionBlock) &&
                                  /\bii\)/i.test(questionBlock);

    let options = [];
    let questionText = '';
    let isSpecialFormat = false;

    if (isCorrectTypeQuestion) {
      const mainStatementMatches = [...questionBlock.matchAll(/^\s*([iv]+)\)\s*(.+?)(?=\n\s*[iv]+\)|$)/gims)];
      const optionsMatches = [...questionBlock.matchAll(/^([a-d])\)\s*(.+?)(?=\n[a-d]\)|\n(?:✅\s*)?Answer|\n\n[a-d]\)|$)/gims)];

      if (mainStatementMatches.length >= 2 && optionsMatches.length >= 2) {
        const firstIIdx = questionBlock.search(/\n\s*i\)/i);
        if (firstIIdx !== -1) {
          questionText = questionBlock.substring(0, firstIIdx).trim();
          questionText = questionText.replace(/^(xvi{0,3}|xi{0,3}v?|i{1,3}v?|vi{0,3}|ix|x{1,2}i{0,3}v?|x{1,3}|[0-9]+)\s*[\.\)]\s*/i, '').trim();

          const statements = mainStatementMatches.map((m, idx) => ({
            number: idx + 1,
            label: m[1].toLowerCase(),
            text: m[2].replace(/\n+/g, ' ').trim()
          }));

          options = optionsMatches.map(m => ({
            label: m[1].toLowerCase(),
            text: m[2].replace(/\n+/g, ' ').trim(),
            statements: statements
          }));

          isSpecialFormat = true;
        }
      }
    }

    if (!isSpecialFormat) {
      const optionMatches = [...questionBlock.matchAll(/^([a-d])[.)]\s*(.+?)(?=\n[a-d][.)]\s|\n(?:✅\s*)?Answer|\n\n[a-d][.)]\s|$)/gims)];
      if (optionMatches.length < 2) continue;

      const firstOptionIdx = questionBlock.search(/\n[a-d][.)]\s/i);
      if (firstOptionIdx === -1) continue;

      questionText = questionBlock.substring(0, firstOptionIdx).trim();
      questionText = questionText.replace(/^(xvi{0,3}|xi{0,3}v?|i{1,3}v?|vi{0,3}|ix|x{1,2}i{0,3}v?|x{1,3}|[0-9]+)\s*[\.\)]\s*/i, '').trim();
      questionText = questionText.replace(/\n+/g, ' ').trim();

      if (!questionText || questionText.length < 10) continue;

      options = [];
      for (const m of optionMatches) {
        const label = m[1].toLowerCase();
        const text = m[2].replace(/\n+/g, ' ').trim();
        if (text) options.push({ label, text });
      }
    }

    if (options.length < 2) continue;

    const answerLower = answerLine.toLowerCase();
    let correctLabel = '';
    const labelMatch = answerLower.match(/^\s*([a-e])[.)\s]/i);
    if (labelMatch) {
      correctLabel = labelMatch[1].toLowerCase();
    } else {
      const letterMatches = [...answerLower.matchAll(/\b([a-e])\b/gi)].map(m => m[1].toLowerCase());
      const optionLabels = options.map(o => o.label.toLowerCase());
      const filtered = letterMatches.filter(l => optionLabels.includes(l));
      if (filtered.length >= 1) {
        correctLabel = filtered[0];
      } else {
        for (const opt of options) {
          if (answerLower.includes(opt.text.substring(0, 20).toLowerCase())) {
            correctLabel = opt.label;
            break;
          }
        }
      }
    }

    if (!correctLabel || !options.find(o => o.label === correctLabel)) continue;

    const multiLetters = [...answerLine.toLowerCase().matchAll(/\b([a-e])\b/gi)].map(m => m[1].toLowerCase());
    const multiCorrect = multiLetters.filter(l => options.find(o => o.label === l));

    const qObj = {
      id: i + 1,
      question: questionText,
      options: options,
      correct: correctLabel,
      explanation: `Answer: ${answerLine}`,
      isSpecialFormat: isSpecialFormat
    };
    if (multiCorrect.length > 1) qObj.multiCorrect = multiCorrect;
    questions.push(qObj);
  }

  return questions;
}

// ── Bold-Answer Format Parser (surgery, ortho, paeds, obs, medicine) ──
function parseBoldAnswerFormat(text) {
  const questions = [];
  // Match numbered questions: "1. Question text\n   a. opt ...\n   **Answer: x**"
  // Split by numbered question start
  const qBlocks = text.split(/\n(?=\d+[\.\)]\s)/);

  for (const block of qBlocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 3) continue;

    // Find answer line
    const answerLineIdx = lines.findIndex(l => /^\*\*Answer:/i.test(l));
    if (answerLineIdx === -1) continue;

    const answerRaw = lines[answerLineIdx].replace(/\*\*/g, '').replace(/^Answer:\s*/i, '').trim();

    // Question text: first line minus the number prefix
    let questionText = lines[0].replace(/^\d+[\.\)]\s*/, '').trim();
    // If question spans multiple lines before options, collect them
    let optStart = -1;
    for (let i = 1; i < answerLineIdx; i++) {
      if (/^[a-dA-D][\.\)]\s/.test(lines[i])) { optStart = i; break; }
    }
    if (optStart === -1) continue;

    // Collect continuation of question text (lines between line 0 and first option that are NOT options)
    for (let i = 1; i < optStart; i++) {
      if (!/^[a-dA-D][\.\)]\s/.test(lines[i]) && !/^\*\*/.test(lines[i])) {
        questionText += ' ' + lines[i];
      }
    }
    questionText = questionText.trim();
    if (!questionText || questionText.length < 5) continue;

    // Parse options: inline (space-separated) or one-per-line
    const optionLines = lines.slice(optStart, answerLineIdx);

    // Try inline: "a. opt1 b. opt2 c. opt3 d. opt4" all on one line
    const fullOpts = optionLines.join(' ');
    let options = [];
    const inlineMatches = [...fullOpts.matchAll(/([a-dA-D])[\.\)]\s*(.+?)(?=\s[a-dA-D][\.\)]|$)/g)];
    if (inlineMatches.length >= 2) {
      options = inlineMatches.map(m => ({ label: m[1].toLowerCase(), text: m[2].trim() }));
    } else {
      // One per line
      for (const line of optionLines) {
        const m = line.match(/^([a-dA-D])[\.\)]\s*(.+)/);
        if (m) options.push({ label: m[1].toLowerCase(), text: m[2].trim() });
      }
    }

    if (options.length < 2) continue;

    // Determine correct label from answer
    const answerLower = answerRaw.toLowerCase();
    let correctLabel = '';
    const startMatch = answerLower.match(/^\s*([a-e])[\.\)\s]/i);
    if (startMatch) {
      correctLabel = startMatch[1].toLowerCase();
    } else {
      const letters = [...answerLower.matchAll(/\b([a-e])\b/gi)].map(m => m[1].toLowerCase());
      const optLabels = options.map(o => o.label);
      const found = letters.filter(l => optLabels.includes(l));
      if (found.length) correctLabel = found[0];
    }

    if (!correctLabel || !options.find(o => o.label === correctLabel)) continue;

    questions.push({
      id: questions.length + 1,
      question: questionText,
      options,
      correct: correctLabel,
      explanation: `Answer: ${answerRaw}`,
      isSpecialFormat: false
    });
  }

  return questions;
}
  
function parseQuadcrackFormat(text) {
  // Parse QUADCRACK format - extract MULTIPLE RESPONSE MCQ section with Options:
  const questions = [];
  
  // Find MULTIPLE RESPONSE MCQ section
  const mrcqStart = text.indexOf('MULTIPLE RESPONSE MCQ');
  if (mrcqStart === -1) return questions;
  
  // Get text from here until next major section (or end)
  const mrcqSection = text.substring(mrcqStart);
  
  // Split by "Options:" to find all complete questions
  const parts = mrcqSection.split(/Options:\s*/i);
  
  // First part is just headers, skip it
  for (let i = 1; i < parts.length; i++) {
    const answerPart = parts[i];
    const questionPart = parts[i - 1];
    
    // Extract the first answer line from answerPart
    const firstAnswer = answerPart.split('\n')[0].trim();
    if (!firstAnswer) continue;
    
    const correctAnswer = firstAnswer.replace(/^\d+\.\s*/, '').trim().toLowerCase();
    // Extract standalone letters only (a-e) to avoid matching letters inside words
    const letterMatches = [...correctAnswer.matchAll(/\b([a-e])\b/gi)].map(m => m[1].toLowerCase());
    const answerLabels = letterMatches;
    const correctLabel = answerLabels[0] ? answerLabels[0] : '';
    
    // Get question block - it's the part after the last question number
    const lines = questionPart.split('\n').map(l => l.trim()).filter(l => l);
    
    // Find where this question starts (look for last occurrence of "N. " pattern)
    let questionStart = -1;
    for (let j = lines.length - 1; j >= 0; j--) {
      if (/^\d+\.\s+/.test(lines[j])) {
        questionStart = j;
        break;
      }
    }
    
    if (questionStart === -1) continue;
    
    const questionLines = lines.slice(questionStart);
    let questionText = questionLines[0].replace(/^\d+\.\s*/, '').trim();
    let options = [];
    
    // Extract options (a, b, c, d or p, q, r, s, etc.)
    for (let j = 1; j < questionLines.length; j++) {
      const line = questionLines[j];
      const optMatch = line.match(/^([a-z])\)\s*(.+)$/i);
      if (optMatch) {
        options.push({
          label: optMatch[1].toLowerCase(),
          text: optMatch[2]
        });
      }
    }
    
    if (options.length < 2 || !correctLabel) continue;
    
    // Verify correct label exists in options
    if (!options.find(o => o.label === correctLabel)) continue;
    
    questions.push({
      id: questions.length + 1,
      question: questionText,
      options: options,
      correct: correctLabel,
      explanation: `Answer: ${correctAnswer}`,
      isSpecialFormat: false
    });
  }
  
  return questions;
}

// ── Test State ──
let testQuestions = [];
let currentQ = 0;
let score = 0;
let answered = 0;
let wrongCount = 0;
/** Set when resuming from home; used to remove the entry after the test is finished */
let activeIncompleteSessionId = null;

async function startTest() {
  await loadQuestions(selectedSubject);
  
  if (allQuestions.length === 0) {
    alert('Could not load questions. Please check the question file.');
    return;
  }
  
  // Filter by subject and topic
  let filteredQuestions = [...allQuestions];
  if (selectedSubject === 'anatomy' && selectedTopic && selectedTopic !== 'all') {
    const allowedIds = ANATOMY_MAPPING[selectedTopic] || [];
    filteredQuestions = allQuestions.filter(q => allowedIds.includes(q.id));
  }
  
  if (filteredQuestions.length === 0) {
    alert('No questions available for this selection. We will upload more soon!');
    return;
  }
  
  // Shuffle and slice
  const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
  const count = Math.min(selectedCount, shuffled.length);
  testQuestions = shuffled.slice(0, count);
  
  if (testQuestions.length === 0) {
    alert('No questions available for this selection.');
    return;
  }
  
  currentQ = 0; score = 0; answered = 0; wrongCount = 0;
  activeIncompleteSessionId = null;
  document.getElementById('scoreTotal').textContent = '0';
  document.getElementById('scoreCorrect').textContent = '0';
  showView('test');
  renderQuestion();
}

function renderQuestion() {
  const q = testQuestions[currentQ];
  const total = testQuestions.length;
  const card = document.getElementById('questionCard');
  if (card) {
    card.style.animation = 'none';
    void card.offsetWidth;
    card.style.animation = '';
  }

  const pct = Math.round((currentQ / total) * 100);
  document.getElementById('progressText').textContent = `Q ${currentQ + 1} / ${total}`;
  document.getElementById('progressFill').style.width = `${pct}%`;
  const bar = document.getElementById('progressBar');
  if (bar) bar.setAttribute('aria-valuenow', String(pct));
  document.getElementById('questionNum').textContent = `Question ${currentQ + 1}`;
  document.getElementById('questionText').textContent = q.question;
  
  const optList = document.getElementById('optionsList');
  
  if (q.isSpecialFormat && q.options[0].statements) {
    // Special format: show statements first, then options
    // Each statement on its own line with numbering
    let html = '<div class="statements-section">';
    q.options[0].statements.forEach((stmt, idx) => {
      const stmtNumber = stmt.number || (idx + 1);
      html += `
        <div class="statement-item">
          <span class="statement-label">${stmtNumber}.</span>
          <span class="statement-text">${stmt.text}</span>
        </div>
      `;
    });
    html += '</div><div class="divider-line"></div><div class="options-section">';
    html += q.options.map(opt => `
      <button class="option-btn" onclick="selectAnswer('${opt.label}', this)" data-label="${opt.label}">
        <span class="option-label">${opt.label.toUpperCase()}</span>
        <span>${opt.text}</span>
      </button>`).join('');
    html += '</div>';
    optList.innerHTML = html;
  } else {
    // Regular format
    optList.innerHTML = q.options.map(opt => `
      <button class="option-btn" onclick="selectAnswer('${opt.label}', this)" data-label="${opt.label}">
        <span class="option-label">${opt.label.toUpperCase()}</span>
        <span>${opt.text}</span>
      </button>`).join('');
  }
  
  document.getElementById('explanationBox').style.display = 'none';
  document.getElementById('nextBtn').style.display = 'none';
}

function selectAnswer(label, btn) {
  const q = testQuestions[currentQ];
  // Disable all options
  document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
  
  const isCorrect = label === q.correct;
  const scoreEl = document.getElementById('scoreCorrect');

  if (isCorrect) {
    btn.classList.add('correct');
    score++;
    scoreEl.textContent = score;
    // Trigger score pop animation
    scoreEl.classList.remove('score-pop');
    void scoreEl.offsetWidth; // reflow
    scoreEl.classList.add('score-pop');
    scoreEl.addEventListener('animationend', () => scoreEl.classList.remove('score-pop'), { once: true });
  } else {
    btn.classList.add('wrong');
    wrongCount++;
    // Highlight correct
    document.querySelectorAll('.option-btn').forEach(b => {
      if (b.dataset.label === q.correct) b.classList.add('correct');
    });
  }
  answered++;
  document.getElementById('scoreTotal').textContent = answered;
  
  // Show explanation
  const expBox = document.getElementById('explanationBox');
  document.getElementById('explanationText').textContent = q.explanation;
  expBox.style.display = 'flex';
  document.getElementById('nextBtn').style.display = 'block';
  document.getElementById('nextBtn').textContent = currentQ + 1 >= testQuestions.length ? 'See Results →' : 'Next Question →';
}

function toggleReviewMark(checked) {
  const q = testQuestions[currentQ];
  if (!q) return;
  q.reviewMarked = checked;
}

function nextQuestion() {
  currentQ++;
  if (currentQ >= testQuestions.length) {
    showResults();
  } else {
    renderQuestion();
    document.querySelector('.test-body').scrollTo(0, 0);
    window.scrollTo(0, 0);
  }
}

function removeCompletedIncompleteTest() {
  let incompleteTests = JSON.parse(localStorage.getItem('cliniq-incomplete-tests') || '[]');
  if (activeIncompleteSessionId) {
    incompleteTests = incompleteTests.filter(t => t.sessionId !== activeIncompleteSessionId);
  }
  localStorage.setItem('cliniq-incomplete-tests', JSON.stringify(incompleteTests));
  activeIncompleteSessionId = null;
}

function showResults() {
  const total = testQuestions.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const skipped = total - answered;
  
  document.getElementById('ringPercent').textContent = pct + '%';
  document.getElementById('resCorrect').textContent = score;
  document.getElementById('resWrong').textContent = wrongCount;
  document.getElementById('resSkipped').textContent = skipped;
  document.getElementById('resultsIcon').textContent = pct >= 75 ? '🏆' : pct >= 50 ? '📚' : '💪';
  
  removeCompletedIncompleteTest();
  showView('results');
  
  // Animate ring
  setTimeout(() => {
    const circumference = 339.3;
    const offset = circumference - (pct / 100) * circumference;
    document.getElementById('ringFill').style.strokeDashoffset = offset;
  }, 300);
}

function retryTest() {
  showConfigure(selectedSubject, selectedTopic);
}

function confirmExit() {
  if (answered === 0) {
    showView('subjects');
    return;
  }
  // Use custom modal instead of browser confirm() which gets blocked on mobile
  const modal = document.getElementById('exitModal');
  if (modal) {
    modal.hidden = false;
  }
}

// Save silently on page unload/navigation so users who close the tab can resume later
window.addEventListener('beforeunload', () => {
  try { saveIncompleteTestSilent(); } catch (e) {}
});

// ── Pause & Resume ──
function pauseAndSaveTest() {
  if (testQuestions.length === 0) return;

  // Build minimal serializable snapshot of the active test (store full question objects
  // so users can resume even if the question bank isn't reloaded)
  const snapshotQs = testQuestions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options,
    correct: q.correct,
    explanation: q.explanation,
    isSpecialFormat: q.isSpecialFormat,
    reviewMarked: q.reviewMarked || false
  }));

  const sessionId = activeIncompleteSessionId || (Date.now() + '-' + Math.random());
  activeIncompleteSessionId = sessionId;

  const testState = {
    sessionId,
    subject: selectedSubject,
    topic: selectedTopic,
    totalQuestions: snapshotQs.length,
    currentQuestion: currentQ,
    score: score,
    answered: answered,
    wrongCount: wrongCount,
    testQuestions: snapshotQs,
    pausedAt: new Date().toLocaleString()
  };

  upsertIncompleteTest(testState);

  alert('✅ Test paused! You can resume it from the home page.');
  showView('home');
}

function upsertIncompleteTest(testState) {
  let incompleteTests = JSON.parse(localStorage.getItem('cliniq-incomplete-tests') || '[]');
  const existingIdx = incompleteTests.findIndex(t => t.sessionId === testState.sessionId);
  if (existingIdx >= 0) {
    incompleteTests[existingIdx] = testState;
  } else {
    incompleteTests.unshift(testState);
    incompleteTests = incompleteTests.slice(0, 10);
  }
  localStorage.setItem('cliniq-incomplete-tests', JSON.stringify(incompleteTests));
}

// Save incomplete test silently (no alert) — used on unload
function saveIncompleteTestSilent() {
  if (testQuestions.length === 0 || answered >= testQuestions.length) return;

  const snapshotQs = testQuestions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options,
    correct: q.correct,
    explanation: q.explanation,
    isSpecialFormat: q.isSpecialFormat,
    reviewMarked: q.reviewMarked || false
  }));

  const sessionId = activeIncompleteSessionId || (Date.now() + '-' + Math.random());
  activeIncompleteSessionId = sessionId;

  const testState = {
    sessionId,
    subject: selectedSubject,
    topic: selectedTopic,
    totalQuestions: snapshotQs.length,
    currentQuestion: currentQ,
    score: score,
    answered: answered,
    wrongCount: wrongCount,
    testQuestions: snapshotQs,
    pausedAt: new Date().toLocaleString()
  };

  upsertIncompleteTest(testState);
}

function loadIncompleteTests() {
  const incompleteTests = JSON.parse(localStorage.getItem('cliniq-incomplete-tests') || '[]');
  const section = document.getElementById('incompleteTestsSection');
  const grid = document.getElementById('incompleteTestsGrid');
  
  if (incompleteTests.length === 0) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  requestAnimationFrame(refreshScrollReveal);
  grid.innerHTML = incompleteTests.map((test, idx) => {
    const subjectName = SUBJECTS.find(s => s.id === test.subject)?.name || test.subject;
    const topicName = test.topic && test.topic !== 'all' ? 
      ANATOMY_TOPICS.find(t => t.id === test.topic)?.name : '';
    const progress = Math.round((test.currentQuestion / test.totalQuestions) * 100);
    
    return `
      <div class="incomplete-test-card">
        <div class="test-header-info">
          <h3>${subjectName}${topicName ? ' → ' + topicName : ''}</h3>
          <p class="test-progress-info">Q ${test.currentQuestion + 1}/${test.totalQuestions}</p>
        </div>
        <div class="test-progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="test-stats">
          <span>✅ ${test.score} correct</span>
          <span>⏱️ ${test.pausedAt}</span>
        </div>
        <button class="btn-primary resume-btn" onclick="resumeTest(${idx})">Resume Test →</button>
        <button class="btn-ghost delete-btn" onclick="deleteIncompleteTest(${idx})">Delete</button>
      </div>
    `;
  }).join('');
}

function resumeTest(testIndex) {
  let incompleteTests = JSON.parse(localStorage.getItem('cliniq-incomplete-tests') || '[]');
  const testState = incompleteTests[testIndex];
  
  if (!testState) return;

  if (!testState.sessionId) {
    testState.sessionId = Date.now() + '-' + Math.random();
    incompleteTests[testIndex] = testState;
    localStorage.setItem('cliniq-incomplete-tests', JSON.stringify(incompleteTests));
  }
  
  selectedSubject = testState.subject;
  selectedTopic = testState.topic;
  
  // Restore full question objects from the saved snapshot. If a question bank is
  // available locally (allQuestions), try to replace with the canonical object.
  testQuestions = testState.testQuestions.map(saved => {
    const fullQ = allQuestions.find(q => q.id === saved.id);
    return fullQ ? fullQ : saved;
  });
  
  currentQ = testState.currentQuestion;
  score = testState.score;
  answered = testState.answered;
  wrongCount = testState.wrongCount;
  activeIncompleteSessionId = testState.sessionId || null;
  
  document.getElementById('scoreTotal').textContent = answered;
  document.getElementById('scoreCorrect').textContent = score;
  
  showView('test');
  renderQuestion();
}

function deleteIncompleteTest(testIndex) {
  if (!confirm('Delete this incomplete test?')) return;
  
  let incompleteTests = JSON.parse(localStorage.getItem('cliniq-incomplete-tests') || '[]');
  incompleteTests.splice(testIndex, 1);
  localStorage.setItem('cliniq-incomplete-tests', JSON.stringify(incompleteTests));
  
  loadIncompleteTests();
}

// ── Hero Canvas Animation ──
function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function accentRgb() {
    const c = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#2dd4bf';
    if (c.startsWith('#') && c.length >= 7) {
      const n = parseInt(c.slice(1), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    return [45, 212, 191];
  }

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.r = Math.random() * 1.8 + 0.4;
      this.alpha = Math.random() * 0.45 + 0.08;
    }
    update() {
      if (reducedMotion) return;
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw(rgb) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${this.alpha})`;
      ctx.fill();
    }
  }

  const count = reducedMotion ? 24 : 64;
  for (let i = 0; i < count; i++) particles.push(new Particle());

  function loop() {
    const rgb = accentRgb();
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(rgb); });
    if (!reducedMotion) {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.1 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
    }
    requestAnimationFrame(loop);
  }
  loop();
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  renderPreviewGrid('1st');
  loadIncompleteTests();
  initNavbarScroll();
  initScrollReveal();
  initCanvas();
  // Preload questions in background for main subjects
  loadQuestions('anatomy');
  setTimeout(() => loadQuestions('physiology'), 500);
  setTimeout(() => loadQuestions('biochemistry'), 1000);
  setTimeout(() => loadQuestions('medicine'), 1500);
  setTimeout(() => loadQuestions('surgery'), 2000);
  setTimeout(() => loadQuestions('orthopaedics'), 2500);
  setTimeout(() => loadQuestions('paediatrics'), 3000);
  setTimeout(() => loadQuestions('obstetrics'), 3500);

  // ── Exit modal wiring ──
  const exitModal     = document.getElementById('exitModal');
  const exitConfirm   = document.getElementById('exitConfirmBtn');
  const exitCancel    = document.getElementById('exitCancelBtn');

  if (exitConfirm) {
    exitConfirm.addEventListener('click', () => {
      exitModal.hidden = true;
      saveIncompleteTestSilent();
      showView('home');
    });
  }
  if (exitCancel) {
    exitCancel.addEventListener('click', () => {
      exitModal.hidden = true;
    });
  }
  // Close on backdrop click
  if (exitModal) {
    exitModal.addEventListener('click', (e) => {
      if (e.target === exitModal) exitModal.hidden = true;
    });
  }
});
