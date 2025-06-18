document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTask');
    const tasksList = document.getElementById('tasksList');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const totalTasks = document.getElementById('totalTasks');
    const pendingTasks = document.getElementById('pendingTasks');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = localStorage.getItem('filter') || 'all';

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function saveFilter() {
        localStorage.setItem('filter', currentFilter);
    }

    function updateStats() {
        const total = tasks.length;
        const pending = tasks.filter(task => !task.completed).length;
        totalTasks.textContent = total;
        pendingTasks.textContent = pending;
    }

    function startEdit(span, index) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = tasks[index].text;
        span.replaceWith(input);
        input.focus();

        const finish = () => {
            const newText = input.value.trim();
            if (newText) {
                tasks[index].text = newText;
            }
            span.textContent = tasks[index].text;
            input.replaceWith(span);
            saveTasks();
            renderTasks(currentFilter);
        };

        input.addEventListener('blur', finish);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
    }

    function renderTasks(filter) {
        tasksList.innerHTML = '';
        const filteredTasks = filter === 'all'
            ? tasks
            : tasks.filter(task => task.completed === (filter === 'completed'));

        filteredTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;

            const span = document.createElement('span');
            span.textContent = task.text;

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.className = 'edit';

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.className = 'delete';

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(editBtn);
            li.appendChild(deleteBtn);
            tasksList.appendChild(li);

            checkbox.addEventListener('change', (e) => {
                tasks[index].completed = e.target.checked;
                li.classList.toggle('completed');
                saveTasks();
                updateStats();
            });

            deleteBtn.addEventListener('click', () => {
                tasks.splice(index, 1);
                saveTasks();
                renderTasks(filter);
                updateStats();
            });

            editBtn.addEventListener('click', () => startEdit(span, index));
            span.addEventListener('dblclick', () => startEdit(span, index));
        });
    }

    function addTask(text) {
        tasks.push({
            text,
            completed: false
        });
        taskInput.value = '';
        saveTasks();
        renderTasks(currentFilter);
        updateStats();
    }

    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText) {
            addTask(taskText);
        }
    });

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTaskButton.click();
        }
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            saveFilter();
            renderTasks(currentFilter);
        });
    });

    filterButtons.forEach(btn => {
        if (btn.dataset.filter === currentFilter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    renderTasks(currentFilter);
    updateStats();
});
