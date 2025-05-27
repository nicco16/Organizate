const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const dateInput = document.getElementById('task-date');
const projectSelect = document.getElementById('task-project');
const list = document.getElementById('task-list');
const filters = document.querySelectorAll('.filters button');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function isToday(dateStr) {
  const today = new Date();
  const taskDate = new Date(dateStr);
  return (
    today.getFullYear() === taskDate.getFullYear() &&
    today.getMonth() === taskDate.getMonth() &&
    today.getDate() === taskDate.getDate()
  );
}

function isPast(dateStr) {
  const today = new Date();
  const taskDate = new Date(dateStr);
  return taskDate < today && !isToday(dateStr);
}

function renderTasks() {
  list.innerHTML = '';

  // Aplicar filtros
  const filtered = tasks.filter(task => {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'pending') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
  });

  // Agrupar tareas por proyecto
  const grouped = {};
  filtered.forEach(task => {
    if (!grouped[task.project]) {
      grouped[task.project] = [];
    }
    grouped[task.project].push(task);
  });

  // Renderizar cada grupo de tareas
  for (const project in grouped) {
    const projectHeader = document.createElement('h3');
    projectHeader.textContent = `📁 ${project}`;
    list.appendChild(projectHeader);

    grouped[project].forEach(task => {
      const index = tasks.findIndex(t =>
        t.text === task.text &&
        t.date === task.date &&
        t.project === task.project &&
        t.completed === task.completed
      );

      const li = document.createElement('li');
      li.className = task.completed ? 'completed' : '';

      const warning = isPast(task.date) && !task.completed
        ? `<div class="task-warning">¡Vencida!</div>`
        : isToday(task.date) && !task.completed
        ? `<div class="task-warning">¡Vence hoy!</div>` : '';

      li.innerHTML = `
        <div>
          <span>${task.text}</span>
          <div class="task-meta">
            <span>📅 ${task.date}</span>
            ${warning}
          </div>
        </div>
        <div class="task-actions">
          <button onclick="toggleTask(${index})">${task.completed ? '↩️' : '✅'}</button>
          <button onclick="editTask(${index})">✏️</button>
          <button onclick="deleteTask(${index})">🗑️</button>
        </div>
      `;
      list.appendChild(li);
    });
  }
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  const date = dateInput.value;
  const project = projectSelect.value;

  if (text && date && project) {
    tasks.push({ text, date, project, completed: false });
    input.value = '';
    dateInput.value = '';
    projectSelect.value = '';
    saveTasks();
    renderTasks();
  }
});

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

function editTask(index) {
  const newText = prompt('Edita tu tarea:', tasks[index].text);
  if (newText !== null && newText.trim() !== '') {
    tasks[index].text = newText.trim();
    saveTasks();
    renderTasks();
  }
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

filters.forEach(btn =>
  btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  })
);

// Renderizar tareas al cargar
renderTasks();

