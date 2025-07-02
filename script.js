let questions = [];
let current = null;
const questionContainer = document.getElementById('questionContainer');
const answersContainer = document.getElementById('answersContainer');
const editForm = document.getElementById('editForm');
const questionInput = document.getElementById('questionInput');
const answerInputs = document.getElementById('answerInputs');
const correctInput = document.getElementById('correctInput');

function loadQuestions() {
  const stored = localStorage.getItem('questions');
  if (stored) {
    questions = JSON.parse(stored);
    renderQuestion();
  } else {
    fetch('questions.json')
      .then(res => res.json())
      .then(data => {
        questions = data;
        renderQuestion();
      });
  }
}

function saveQuestions() {
  localStorage.setItem('questions', JSON.stringify(questions));
}

function randomQuestion() {
  if (questions.length === 0) return;
  const idx = Math.floor(Math.random() * questions.length);
  current = questions[idx];
  renderQuestion();
}

function renderQuestion() {
  answersContainer.innerHTML = '';
  if (!current && questions.length > 0) current = questions[0];
  if (!current) {
    questionContainer.textContent = 'Brak pytań';
    return;
  }
  questionContainer.textContent = current.pytanie;

  if (current.poprawna === null || current.poprawna === undefined) {
    const warn = document.createElement('div');
    warn.className = 'text-red-500 mb-2';
    warn.textContent = 'Brak poprawnej odpowiedzi. Edytuj pytanie.';
    questionContainer.appendChild(warn);
  }

  Object.entries(current.odpowiedzi).forEach(([key, text]) => {
    const btn = document.createElement('button');
    btn.className = 'border rounded p-2 w-full text-left';
    btn.textContent = text;
    btn.onclick = () => {
      if (parseInt(key) === current.poprawna) {
        btn.classList.add('bg-green-200');
      } else {
        btn.classList.add('bg-red-200');
      }
    };
    answersContainer.appendChild(btn);
  });
}

function startEdit(isNew = false) {
  editForm.classList.remove('hidden');
  answersContainer.innerHTML = '';
  if (isNew) {
    current = { numer: Date.now(), pytanie: '', odpowiedzi: { '1': '', '2': '', '3': '', '4': '' }, poprawna: null };
    questions.push(current);
  }
  questionInput.value = current.pytanie || '';
  answerInputs.innerHTML = '';
  for (let i = 1; i <= 4; i++) {
    const input = document.createElement('input');
    input.className = 'w-full border p-2';
    input.placeholder = `Odpowiedź ${i}`;
    input.value = current.odpowiedzi[i] || '';
    input.dataset.key = i;
    answerInputs.appendChild(input);
  }
  correctInput.value = current.poprawna || '';
}

function saveEdit() {
  current.pytanie = questionInput.value;
  for (const input of answerInputs.querySelectorAll('input')) {
    current.odpowiedzi[input.dataset.key] = input.value;
  }
  const val = parseInt(correctInput.value);
  current.poprawna = isNaN(val) ? null : val;
  saveQuestions();
  editForm.classList.add('hidden');
  renderQuestion();
}

function addQuestion() {
  startEdit(true);
}

function deleteQuestion() {
  if (!current) return;
  const idx = questions.indexOf(current);
  if (idx >= 0) {
    questions.splice(idx, 1);
    current = null;
    saveQuestions();
    renderQuestion();
  }
}

document.getElementById('randomBtn').onclick = randomQuestion;
document.getElementById('editBtn').onclick = () => startEdit(false);
document.getElementById('addBtn').onclick = addQuestion;
document.getElementById('deleteBtn').onclick = deleteQuestion;
document.getElementById('saveBtn').onclick = saveEdit;

loadQuestions();
