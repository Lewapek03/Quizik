let questions = [];
let current = null;
let previous = null;
let editingNew = false;
const randomBtn = document.getElementById('randomBtn');
const questionContainer = document.getElementById('questionContainer');
const answersContainer = document.getElementById('answersContainer');
const editForm = document.getElementById('editForm');
const questionInput = document.getElementById('questionInput');
const answerInputs = document.getElementById('answerInputs');
const addAnswerBtn = document.getElementById('addAnswerBtn');
const cancelBtn = document.getElementById('cancelBtn');

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

function createAnswerRow(idx, text = '', keyCheck = idx) {
  const row = document.createElement('div');
  row.className = 'flex items-center space-x-2';
  const radio = document.createElement('input');
  radio.type = 'radio';
  radio.name = 'correct';
  radio.value = idx;
  if (current.poprawna === keyCheck) radio.checked = true;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'flex-1 border p-2';
  input.placeholder = `Odpowiedź ${idx}`;
  input.value = text;
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = '✕';
  removeBtn.className = 'text-red-500';
  removeBtn.onclick = () => {
    answerInputs.removeChild(row);
    renumberAnswers();
  };
  row.append(radio, input, removeBtn);
  return row;
}

function renumberAnswers() {
  Array.from(answerInputs.children).forEach((row, i) => {
    const idx = i + 1;
    const radio = row.querySelector('input[type=radio]');
    const input = row.querySelector('input[type=text]');
    radio.value = idx;
    input.placeholder = `Odpowiedź ${idx}`;
  });
}

function startEdit(isNew = false) {
  previous = current;
  editingNew = isNew;
  editForm.classList.remove('hidden');
  randomBtn.disabled = true;
  answersContainer.innerHTML = '';
  if (isNew) {
    current = { numer: Date.now(), pytanie: '', odpowiedzi: {}, poprawna: null };
    questions.push(current);
  }
  questionInput.value = current.pytanie || '';
  answerInputs.innerHTML = '';
  const entries = Object.entries(current.odpowiedzi);
  if (entries.length === 0) {
    entries.push(['1', ''], ['2', '']);
  }
  entries.forEach(([k, v], idx) => {
    answerInputs.appendChild(createAnswerRow(idx + 1, v, parseInt(k)));
  });
}

function saveEdit() {
  current.pytanie = questionInput.value;
  current.odpowiedzi = {};
  let idx = 1;
  let selected = null;
  answerInputs.querySelectorAll('div').forEach(row => {
    const textInput = row.querySelector('input[type=text]');
    const radio = row.querySelector('input[type=radio]');
    current.odpowiedzi[idx] = textInput.value;
    if (radio.checked) selected = idx;
    idx++;
  });
  current.poprawna = selected;
  saveQuestions();
  editForm.classList.add('hidden');
  randomBtn.disabled = false;
  editingNew = false;
  renderQuestion();
}

function cancelEdit() {
  if (editingNew) {
    const idx = questions.indexOf(current);
    if (idx >= 0) questions.splice(idx, 1);
    current = previous;
  }
  editForm.classList.add('hidden');
  randomBtn.disabled = false;
  editingNew = false;
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
cancelBtn.onclick = cancelEdit;
addAnswerBtn.onclick = () => {
  answerInputs.appendChild(createAnswerRow(answerInputs.children.length + 1, ''));
};

loadQuestions();
