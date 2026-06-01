/* ── CLINIQ app.js ── */

// ── Theme ──
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
let currentTheme = localStorage.getItem('cliniq-theme') || (prefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', currentTheme);
function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem('cliniq-theme', currentTheme);
  document.querySelector('.theme-icon').textContent = currentTheme === 'dark' ? '☀️' : '🌙';
}
document.getElementById('themeToggle').addEventListener('click', toggleTheme);
document.querySelector('.theme-icon').textContent = currentTheme === 'dark' ? '☀️' : '🌙';

// ── Hamburger ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
function closeMobileMenu() { mobileMenu.classList.remove('open'); }

// ── View Manager ──
let currentView = 'home';
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + id).classList.add('active');
  currentView = id;
  window.scrollTo(0, 0);
  closeMobileMenu();
  if (id === 'subjects') renderSubjects();
  if (id === 'home') {
    renderPreviewGrid('1st');
    loadIncompleteTests();
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
  { id:'fmt',          name:'FMT',            year:'3rd', icon:'FM', info:'200+ MCQs',            available:true },

  // Final Year
  { id:'medicine',     name:'Medicine',       year:'final', icon:'MD', info:'400+ MCQs',            available:true },
  { id:'obgyn',        name:'Obs & Gynae',    year:'final', icon:'OG', info:'Coming Soon',          available:false },
  { id:'surgery',      name:'Surgery',        year:'final', icon:'SU', info:'Coming Soon',          available:false },
  { id:'ent',          name:'ENT',            year:'final', icon:'EN', info:'Coming Soon',          available:false },
  { id:'ophthalmology',name:'Ophthalmology',  year:'final', icon:'OP', info:'Coming Soon',          available:false },
  { id:'paediatrics',  name:'Paediatrics',    year:'final', icon:'PD', info:'Coming Soon',          available:false },
  { id:'dermatology',  name:'Dermatology',    year:'final', icon:'DE', info:'Coming Soon',          available:false },
  { id:'psychiatry',   name:'Psychiatry',     year:'final', icon:'PSY', info:'Coming Soon',         available:false },
  { id:'orthopaedics', name:'Orthopaedics',   year:'final', icon:'OR', info:'Coming Soon',          available:false },
  { id:'anaesthesia',  name:'Anaesthesia',    year:'final', icon:'ANE', info:'Coming Soon',         available:false },
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
function filterYear(btn, year) {
  document.querySelectorAll('#view-home .year-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
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
  abdomen: [25, 35, 39, 81, 85, 91, 93, 96, 101, 102, 103, 104, 105, 108, 109, 110, 113, 114, 117, 119, 182, 186, 187, 188, 189, 190, 195, 197, 224, 226, 227, 228, 229, 230, 231, 234, 237],
  pelvis: [24, 26, 27, 28, 29, 30, 38, 95, 99, 100, 106, 107, 112, 116, 118, 120, 127, 183, 184, 193, 198, 200, 223, 225, 235, 239],
  upper: [6, 7, 8, 9, 10, 12, 16, 45, 59, 65, 79, 129, 130, 131, 133, 138, 162, 172, 173, 177, 180, 203, 215, 216],
  lower: [4, 21, 31, 32, 34, 40, 86, 87, 88, 89, 90, 91, 92, 111, 166, 167, 168, 169, 170, 175, 222, 233, 236, 240]
};

// ── Subject to File Mapping ──
const SUBJECT_FILES = {
  'anatomy': 'Anatomy-Question-bank.txt',
  'physiology': 'Physiology-Question-bank.txt',
  'biochemistry': 'Biochemistry-Question-bank.txt',
  'psm': 'Community-Medicine-MCQ-Companion-Clean.txt',
  'fmt': 'Forensic-Medicine-MCQ-Companion-Clean.txt',
  'medicine': 'QUADCRACK IMA MSN KERALA 2025.. - Google Docs.txt'
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
  
  // General parsing - no special subject header-skipping by default
  
  // Detect if this is QUADCRACK format (has "Options:" with numbered answers)
  const isQuadcrackFormat = /Options:\s*\n\s*\d+\./m.test(text);
  
  if (isQuadcrackFormat) {
    return parseQuadcrackFormat(text);
  }
  
  // Split by answer marker (handle both ✅ Answer: and plain Answer:)
  const blocks = text.split(/(?:✅\s*)?Answer:\s*/i);
  
  for (let i = 0; i < blocks.length - 1; i++) {
    const answerAndNext = blocks[i + 1];
    let questionBlock = blocks[i];
    
    // Extract answer (first line of next block)
    const answerLine = answerAndNext.split('\n')[0].trim();
    
    // Fix parser bug: strip previous answer from the start of the question block
    if (i > 0) {
      const lines = questionBlock.split('\n');
      lines.shift(); // Remove the answer line
      questionBlock = lines.join('\n');
    }
    
    // Clean up headers before the first question marker
    const questionMarkerMatch = questionBlock.match(/\b(xvi{0,3}|xi{0,3}v?|i{1,3}v?|vi{0,3}|ix|x{1,2}i{0,3}v?|x{1,3}|[0-9]+)\s*[\.\)]\s+/i);
    if (questionMarkerMatch) {
      const markerIdx = questionBlock.indexOf(questionMarkerMatch[0]);
      questionBlock = questionBlock.substring(markerIdx);
    }
    
    // Check if this is a "Which are CORRECT" type question with i), ii), iii), iv) format
    const isCorrectTypeQuestion = /which.*correct|which.*true/i.test(questionBlock) && 
                                  /\bi\)/i.test(questionBlock) && 
                                  /\bii\)/i.test(questionBlock);
    
    let options = [];
    let questionText = '';
    let isSpecialFormat = false;
    
    if (isCorrectTypeQuestion) {
      // Parse special format: Which are CORRECT about X?
      // i) statement
      // ii) statement
      // etc.
      // a) i, ii
      // b) i, iii
      
      const mainStatementMatches = [...questionBlock.matchAll(/^\s*([iv]+)\)\s*(.+?)(?=\n\s*[iv]+\)|$)/gims)];
      const optionsMatches = [...questionBlock.matchAll(/^([a-d])\)\s*(.+?)(?=\n[a-d]\)|\n(?:✅\s*)?Answer|\n\n[a-d]\)|$)/gims)];
      
      if (mainStatementMatches.length >= 2 && optionsMatches.length >= 2) {
        // Extract question text (before first i))
        const firstIIdx = questionBlock.search(/\n\s*i\)/i);
        if (firstIIdx !== -1) {
          questionText = questionBlock.substring(0, firstIIdx).trim();
          questionText = questionText.replace(/^(xvi{0,3}|xi{0,3}v?|i{1,3}v?|vi{0,3}|ix|x{1,2}i{0,3}v?|x{1,3}|[0-9]+)\s*[\.\)]\s*/i, '').trim();
          
          // Build statement list for display
          const statements = mainStatementMatches.map((m, idx) => ({
            number: idx + 1,
            label: m[1].toLowerCase(),
            text: m[2].replace(/\n+/g, ' ').trim()
          }));
          
          // Build combination options
          options = optionsMatches.map(m => ({
            label: m[1].toLowerCase(),
            text: m[2].replace(/\n+/g, ' ').trim(),
            statements: statements // Include statements for rendering
          }));
          
          isSpecialFormat = true;
        }
      }
    }
    
    if (!isSpecialFormat) {
      // Original format: Find options in question block
      const optionMatches = [...questionBlock.matchAll(/^([a-d])[.)]\s*(.+?)(?=\n[a-d][.)]\s|\n(?:✅\s*)?Answer|\n\n[a-d][.)]\s|$)/gims)];
      
      if (optionMatches.length < 2) continue;
      
      // Extract question text - find the text before the options
      const firstOptionIdx = questionBlock.search(/\n[a-d][.)]\s/i);
      if (firstOptionIdx === -1) continue;
      
      questionText = questionBlock.substring(0, firstOptionIdx).trim();
      // Remove question number prefix (roman numerals, plain numbers)
      questionText = questionText.replace(/^(xvi{0,3}|xi{0,3}v?|i{1,3}v?|vi{0,3}|ix|x{1,2}i{0,3}v?|x{1,3}|[0-9]+)\s*[\.\)]\s*/i, '').trim();
      // Clean up extra whitespace
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
    
    // Figure out correct answer label(s) robustly using word boundaries so we don't
    // accidentally match letters inside words. Support answers like: "a", "a,c", "A and C".
    const answerLower = answerLine.toLowerCase();
    let correctLabel = '';

    // Prefer an explicit starting letter like "a.", "a)" at the beginning of the line
    const labelMatch = answerLower.match(/^\s*([a-e])[.)\s]/i);
    if (labelMatch) {
      correctLabel = labelMatch[1].toLowerCase();
    } else {
      // Extract standalone letters (a-e) using word boundaries to avoid matching letters inside words
      const letterMatches = [...answerLower.matchAll(/\b([a-e])\b/gi)].map(m => m[1].toLowerCase());
      // Filter letters that actually correspond to one of the option labels
      const optionLabels = options.map(o => o.label.toLowerCase());
      const filtered = letterMatches.filter(l => optionLabels.includes(l));
      if (filtered.length === 1) {
        correctLabel = filtered[0];
      } else if (filtered.length > 1) {
        // Multi-answer detected; for now pick the first one as the primary correct
        // and store the full set in the question object for potential future multi-select support
        correctLabel = filtered[0];
        // attach a multiCorrect array so UI improvements can use it later
        // (we will add it to the question object below before pushing)
      } else {
        // Try to match by option text snippet (fallback)
        for (const opt of options) {
          if (answerLower.includes(opt.text.substring(0, 20).toLowerCase())) {
            correctLabel = opt.label;
            break;
          }
        }
      }
    }
    
    if (!correctLabel || !options.find(o => o.label === correctLabel)) continue;
    
    // If multiple letters were found earlier, record them on the question for accuracy
    const multiLetters = [...answerLine.toLowerCase().matchAll(/\b([a-e])\b/gi)].map(m => m[1].toLowerCase());
    const multiCorrect = multiLetters.filter(l => options.find(o => o.label === l));
    
    const qObj = {
      id: i + 1, // 1-based question number corresponding to the index in the question bank
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
  document.getElementById('scoreTotal').textContent = '0';
  document.getElementById('scoreCorrect').textContent = '0';
  showView('test');
  renderQuestion();
}

function renderQuestion() {
  const q = testQuestions[currentQ];
  const total = testQuestions.length;
  
  document.getElementById('progressText').textContent = `Q ${currentQ + 1} / ${total}`;
  document.getElementById('progressFill').style.width = `${((currentQ) / total) * 100}%`;
  document.getElementById('questionNum').textContent = `Question ${currentQ + 1}`;
  document.getElementById('questionText').textContent = q.question;
  const reviewToggle = document.getElementById('reviewToggleInput');
  if (reviewToggle) reviewToggle.checked = !!q.reviewMarked;
  
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
  if (isCorrect) {
    btn.classList.add('correct');
    score++;
    document.getElementById('scoreCorrect').textContent = score;
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

function showResults() {
  const total = testQuestions.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const skipped = total - answered;
  
  document.getElementById('ringPercent').textContent = pct + '%';
  document.getElementById('resCorrect').textContent = score;
  document.getElementById('resWrong').textContent = wrongCount;
  document.getElementById('resSkipped').textContent = skipped;
  document.getElementById('resultsIcon').textContent = pct >= 75 ? '🏆' : pct >= 50 ? '📚' : '💪';
  
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
  // Save current test state before exiting so user can resume later
  if (answered === 0) {
    // If nothing answered yet, still save snapshot and go back
    saveIncompleteTestSilent();
    showView('subjects');
    return;
  }

  if (confirm('Exit test? Your progress will be saved as an incomplete test.')) {
    saveIncompleteTestSilent();
    showView('subjects');
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

  const testState = {
    sessionId: Date.now() + Math.random(),
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

  let incompleteTests = JSON.parse(localStorage.getItem('cliniq-incomplete-tests') || '[]');
  incompleteTests.unshift(testState);
  localStorage.setItem('cliniq-incomplete-tests', JSON.stringify(incompleteTests));

  alert('✅ Test paused! You can resume it from the home page.');
  showView('home');
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

  const testState = {
    sessionId: Date.now() + Math.random(),
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

  let incompleteTests = JSON.parse(localStorage.getItem('cliniq-incomplete-tests') || '[]');
  // Avoid storing duplicate snapshot if the most recent is identical session
  if (!incompleteTests.length || incompleteTests[0].sessionId !== testState.sessionId) {
    incompleteTests.unshift(testState);
    // keep max 10 saved sessions
    incompleteTests = incompleteTests.slice(0, 10);
    localStorage.setItem('cliniq-incomplete-tests', JSON.stringify(incompleteTests));
  }
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
  const incompleteTests = JSON.parse(localStorage.getItem('cliniq-incomplete-tests') || '[]');
  const testState = incompleteTests[testIndex];
  
  if (!testState) return;
  
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
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r = Math.random() * 2 + 0.5;
      this.alpha = Math.random() * 0.6 + 0.1;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,206,209,${this.alpha})`;
      ctx.fill();
    }
  }
  
  for (let i = 0; i < 80; i++) particles.push(new Particle());
  
  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    // Draw lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,206,209,${0.12 * (1 - dist/100)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
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
  initCanvas();
  // Preload questions in background for main subjects
  loadQuestions('anatomy');
  setTimeout(() => loadQuestions('physiology'), 500);
  setTimeout(() => loadQuestions('biochemistry'), 1000);
});
