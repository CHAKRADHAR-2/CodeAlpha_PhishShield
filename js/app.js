(function(){
  'use strict';

  const selectors = {
    navLinks: document.querySelectorAll('.nav-link'),
    sections: document.querySelectorAll('.section'),
    progressFill: document.getElementById('progressFill'),
    progressPercent: document.getElementById('progressPercent'),
    startBtn: document.getElementById('startBtn'),
    navToggle: document.getElementById('navToggle'),
    navList: document.getElementById('navList')
  };

  const state = {
    visited: new Set(['landing']),
    totalSections: document.querySelectorAll('.section').length,
    quiz: {
      questions: [],
      current: 0,
      correct: 0,
      incorrect: 0
    }
  };

  /* ---------- Navigation & Progress ---------- */
  function showSection(id){
    selectors.sections.forEach(sec => {
      if(sec.id === id){
        sec.classList.add('active');
        sec.focus();
      } else {
        sec.classList.remove('active');
      }
    });
    selectors.navLinks.forEach(a => a.classList.toggle('active', a.dataset.target === id));
    state.visited.add(id);
    updateProgress();
  }

  function updateProgress(){
    const pct = Math.round((state.visited.size / state.totalSections) * 100);
    selectors.progressFill.style.width = pct + '%';
    selectors.progressPercent.textContent = pct + '%';
  }

  // init nav listeners
  selectors.navLinks.forEach(link => {
    link.addEventListener('click', (e) =>{
      e.preventDefault();
      const target = link.dataset.target;
      showSection(target);
      if(window.innerWidth <= 800){
        selectors.navList.style.display = 'none';
        selectors.navToggle.setAttribute('aria-expanded','false');
      }
    });
  });

  selectors.startBtn.addEventListener('click', ()=> showSection('what'));
  selectors.navToggle.addEventListener('click', ()=>{
    const expanded = selectors.navToggle.getAttribute('aria-expanded') === 'true';
    selectors.navToggle.setAttribute('aria-expanded', String(!expanded));
    selectors.navList.style.display = expanded ? 'none' : 'flex';
  });

  /* ---------- Quiz Engine ---------- */
  const quizData = [
    {q: 'You receive an unexpected email from payroll@example.com asking to "verify" your details with a link. What is the safest action?',
     choices: ['Click the link and enter details','Reply with your password','Open a new browser and visit the official payroll portal','Ignore and delete without verifying'],
     answer: 2,
     explain: 'Open a trusted browser and visit the official portal or verify via known channels.'},
    {q: 'Which of these is a strong sign of a lookalike (typosquatting) domain?',
     choices: ['HTTPS lock icon','Subtle misspelling in the domain name','Presence of images on the site','Email uses your display name'],
     answer: 1,
     explain: 'Typosquatting uses misspellings or subtle character changes in domains.'},
    {q: 'An email says "Your manager urgently needs a gift card purchase." What tactic is being used?',
     choices: ['Greed','Authority and urgency','Technical error','Two-factor authentication'],
     answer: 1,
     explain: 'Impersonation of authority plus urgency to bypass verification.'},
    {q: 'HTTPS guarantees a site is safe and legitimate. True or false?',
     choices: ['True','False','Only for banking sites','Only if green padlock shows name'],
     answer: 1,
     explain: 'HTTPS protects transport but does not verify the owner or intent.'},
    {q: 'A message asks for your password to "confirm identity." What should you do?',
     choices: ['Provide the password','Ask for a video call','Never provide credentials via email; verify independently','Forward to a colleague'],
     answer: 2,
     explain: 'Credentials should never be shared via email; verify through secure channels.'},
    {q: 'What is spear phishing?',
     choices: ['Mass email to random users','Targeted phishing aimed at a specific person','Phone-based scam','A harmless newsletter'],
     answer: 1,
     explain: 'Spear phishing is tailored to a specific individual or organization.'},
    {q: 'Which is a safe way to verify a suspicious request?',
     choices: ['Click the provided link','Call the sender using known number','Reply "OK" to confirm','Post on social media'],
     answer: 1,
     explain: 'Call a known number or contact the person via a separate verified channel.'},
    {q: 'You get an SMS with a shortened link and a prize claim. What is the risk?',
     choices: ['Low risk','URL redirection to malicious site','It is always safe','It improves security'],
     answer: 1,
     explain: 'Shortened links hide destinations and can redirect to malicious sites.'},
    {q: 'What is Business Email Compromise (BEC)?',
     choices: ['An antivirus product','A supply-chain compromise','An attacker impersonates employees to trick finance into payments','A secure email gateway'],
     answer: 2,
     explain: 'BEC targets financial processes by impersonating trusted parties.'},
    {q: 'If you accidentally clicked a suspicious link, first you should:',
     choices: ['Enter credentials to see what happens','Close the page and avoid further interaction','Share the link with colleagues','Restart computer only'],
     answer: 1,
     explain: 'Stop interacting with the page and follow incident response steps.'}
  ];

  state.quiz.questions = quizData;

  const qElements = {
    intro: document.getElementById('quizIntro'),
    quizQuestion: document.getElementById('quizQuestion'),
    qIndex: document.getElementById('qIndex'),
    qTotal: document.getElementById('qTotal'),
    qText: document.getElementById('qText'),
    qChoices: document.getElementById('qChoices'),
    qFeedback: document.getElementById('qFeedback'),
    nextQ: document.getElementById('nextQ'),
    quizResults: document.getElementById('quizResults'),
    quizResultsSummary: document.getElementById('scoreSummary')
  };

  qElements.qTotal.textContent = state.quiz.questions.length;

  document.getElementById('startQuiz').addEventListener('click', () => {
    qElements.intro.hidden = true;
    qElements.quizQuestion.hidden = false;
    renderQuestion();
    showSection('quiz');
  });

  function renderQuestion(){
    const q = state.quiz.questions[state.quiz.current];
    qElements.qIndex.textContent = state.quiz.current + 1;
    qElements.qText.textContent = q.q;
    qElements.qChoices.innerHTML = '';
    q.explained = false;
    q.choices.forEach((c, idx) =>{
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = c;
      btn.addEventListener('click', ()=> handleAnswer(idx));
      li.appendChild(btn);
      qElements.qChoices.appendChild(li);
    });
    qElements.qFeedback.textContent = '';
    qElements.nextQ.disabled = true;
    qElements.nextQ.hidden = false;
  }

  function handleAnswer(choiceIdx){
    const q = state.quiz.questions[state.quiz.current];
    const correct = choiceIdx === q.answer;
    const allBtns = qElements.qChoices.querySelectorAll('button');
    allBtns.forEach((b, i)=>{
      b.disabled = true;
      if(i === q.answer) b.style.borderColor = 'var(--success)';
      if(i === choiceIdx && !correct) b.style.borderColor = 'var(--danger)';
    });
    if(correct){
      state.quiz.correct++;
      qElements.qFeedback.innerHTML = `<div style="color:var(--success)"><strong>Correct:</strong> ${q.explain}</div>`;
    } else {
      state.quiz.incorrect++;
      qElements.qFeedback.innerHTML = `<div style="color:var(--danger)"><strong>Incorrect:</strong> ${q.explain}</div>`;
    }
    qElements.nextQ.disabled = false;
  }

  qElements.nextQ.addEventListener('click', ()=>{
    state.quiz.current++;
    if(state.quiz.current >= state.quiz.questions.length){
      showQuizResults();
    } else renderQuestion();
  });

  document.getElementById('retakeBtn').addEventListener('click', resetQuiz);
  document.getElementById('retakeQuiz').addEventListener('click', resetQuiz);
  document.getElementById('retakeQuiz').addEventListener('click', ()=> showSection('quiz'));

  function showQuizResults(){
    qElements.quizQuestion.hidden = true;
    qElements.quizResults.hidden = false;
    const total = state.quiz.questions.length;
    const correct = state.quiz.correct;
    const pct = Math.round((correct/total)*100);
    let category = '';
    if(pct >= 90) category = 'Excellent Phishing Awareness';
    else if(pct >=70) category = 'Good Awareness';
    else if(pct >=50) category = 'Needs Improvement';
    else category = 'High Risk — Review the Training';

    qElements.quizResultsSummary.innerHTML = `
      <p>Your score: <strong>${pct}%</strong> (${correct}/${total})</p>
      <p>Status: <strong>${category}</strong></p>
    `;

    // populate completion summary area too
    const completion = document.getElementById('completionSummary');
    if(completion){
      completion.innerHTML = `<p>Quiz Score: <strong>${pct}%</strong> (${correct}/${total})</p><p>Key lessons: Inspect senders, verify links, enable MFA.</p>`;
    }
  }

  function resetQuiz(){
    state.quiz.current = 0; state.quiz.correct = 0; state.quiz.incorrect = 0;
    qElements.quizResults.hidden = true;
    qElements.quizQuestion.hidden = false;
    renderQuestion();
  }

  /* ---------- Scenarios ---------- */
  const scenarios = [
    {
      title: 'Suspicious Phishing Email',
      text: 'You receive an email from "IT Support" asking you to install an urgent update via a link. The sender address is it-support@it-support-example.com. What do you do?',
      choices: ['Click the link and install the update','Reply asking for more info','Contact IT via known phone number or portal to verify','Forward to colleagues without checking'],
      answer: 2,
      explain: 'Verify via known channels; do not click unexpected links.'
    },
    {
      title: 'Fake Login Website',
      text: 'A login page looks identical to your corporate portal but the URL is https://secure-login.example-company.co. What is the best response?',
      choices: ['Enter credentials to proceed','Check the domain carefully and use bookmark to access the official site','Assume it is safe because of HTTPS','Share the link with IT'],
      answer: 1,
      explain: 'Lookalike domains are common; use bookmarks or official links and enable MFA.'
    },
    {
      title: 'Social-Engineering Phone Call',
      text: 'Someone calls claiming to be your manager asking for immediate transfer of funds. They say it is urgent and confidential. What do you do?',
      choices: ['Transfer immediately','Ask for manager to send an email','Call the manager using a known number to confirm the request','Provide bank details over the phone'],
      answer: 2,
      explain: 'Confirm via a separate trusted channel before taking financial actions.'
    }
  ];

  function renderScenarios(){
    const container = document.getElementById('scenarioList');
    container.innerHTML = '';
    scenarios.forEach((s, idx)=>{
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `<h3>${s.title}</h3><p>${s.text}</p>`;
      const ul = document.createElement('ul');
      s.choices.forEach((c, i)=>{
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.type = 'button';
        btn.textContent = c;
        btn.addEventListener('click', ()=>{
          const feedback = document.createElement('div');
          if(i === s.answer) feedback.innerHTML = `<div style="color:var(--success)"><strong>Correct:</strong> ${s.explain}</div>`;
          else feedback.innerHTML = `<div style="color:var(--danger)"><strong>Not Ideal:</strong> ${s.explain}</div>`;
          // remove existing feedback
          const existing = card.querySelector('.scenario-feedback');
          if(existing) existing.remove();
          feedback.className = 'scenario-feedback';
          card.appendChild(feedback);
        });
        li.appendChild(btn);
        ul.appendChild(li);
      });
      card.appendChild(ul);
      container.appendChild(card);
    });
  }

  /* ---------- Checklist ---------- */
  const checklistForm = document.getElementById('checklistForm');
  document.getElementById('markSafe').addEventListener('click', ()=>{
    const checked = checklistForm.querySelectorAll('input:checked').length;
    alert('Checklist completed: ' + checked + ' items checked. If critical items are unchecked, verify before acting.');
  });
  document.getElementById('markReview').addEventListener('click', ()=>{
    alert('Marked for review. Contact your security/IT team if unsure.');
  });

  /* ---------- Completion and keyboard helpers ---------- */
  document.getElementById('retakeTraining').addEventListener('click', ()=>{
    // reset visited and progress, bring user to start
    state.visited = new Set(['landing']);
    updateProgress();
    showSection('landing');
  });
  document.getElementById('retakeQuiz2').addEventListener('click', ()=>{
    resetQuiz(); showSection('quiz');
  });

  // keyboard navigation for nav links
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){ // close nav for small screens
      if(window.innerWidth <= 800){ selectors.navList.style.display = 'none'; selectors.navToggle.setAttribute('aria-expanded','false'); }
    }
  });

  // initialize
  function init(){
    updateProgress();
    renderScenarios();
  }

  init();
})();