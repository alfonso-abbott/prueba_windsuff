document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTask');
    const descInput = document.getElementById('descInput');
    const tasksList = document.getElementById('tasksList');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const totalTasks = document.getElementById('totalTasks');
    const completedTasks = document.getElementById('completedTasks');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const exportExcelBtn = document.getElementById('exportExcel');
    const toggleTheme = document.getElementById('toggleTheme');
    const noTasksMsg = document.getElementById('noTasks');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let nextId = parseInt(localStorage.getItem('nextId')) || (tasks.reduce((m, t) => Math.max(m, t.id || 0), 0) + 1);
    let currentFilter = localStorage.getItem('filter') || 'all';
    let theme = localStorage.getItem('theme') || 'light';

    if (theme === 'dark') {
        document.body.classList.add('dark');
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function saveNextId() {
        localStorage.setItem('nextId', nextId);
    }

    function saveFilter() {
        localStorage.setItem('filter', currentFilter);
    }

    function saveTheme() {
        localStorage.setItem('theme', theme);
    }

    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        totalTasks.textContent = total;
        completedTasks.textContent = completed;
    }

    function startEdit(span, index, li) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = tasks[index].text;
        li.classList.add('editing');
        span.replaceWith(input);
        input.focus();

        const finish = () => {
            const newText = input.value.trim();
            if (newText) {
                tasks[index].text = newText;
            }
            span.textContent = `${tasks[index].id}. ${tasks[index].text}`;
            input.replaceWith(span);
            li.classList.remove('editing');
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

        noTasksMsg.classList.add('hidden');
        if (filteredTasks.length === 0) {
            noTasksMsg.classList.remove('hidden');
            return;
        }

        filteredTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;

            const textWrap = document.createElement('div');
            textWrap.className = 'task-text';

            const span = document.createElement('span');
            span.textContent = `${task.id}. ${task.text}`;
            textWrap.appendChild(span);

            if (task.desc) {
                const descEl = document.createElement('small');
                descEl.textContent = task.desc;
                descEl.className = 'description';
                textWrap.appendChild(descEl);
            }

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.className = 'edit';

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.className = 'delete';

            li.appendChild(checkbox);
            li.appendChild(textWrap);
            li.appendChild(deleteBtn);
            li.appendChild(editBtn);
            tasksList.appendChild(li);
            li.classList.add('slide-in');

            checkbox.addEventListener('change', (e) => {
                tasks[index].completed = e.target.checked;
                li.classList.toggle('completed');
                saveTasks();
                updateStats();
            });

            deleteBtn.addEventListener('click', () => {
                if (confirm('¿Eliminar esta tarea?')) {
                    li.classList.add('slide-out');
                    setTimeout(() => {
                        tasks.splice(index, 1);
                        saveTasks();
                        renderTasks(filter);
                        updateStats();
                    }, 400);
                }
            });

            editBtn.addEventListener('click', () => startEdit(span, index, li));
            span.addEventListener('dblclick', () => startEdit(span, index, li));
        });
    }

    function addTask(text, desc) {
        if (tasks.some(t => t.text.toLowerCase() === text.toLowerCase())) {
            alert('La tarea ya existe');
            return;
        }

        tasks.push({
            id: nextId++,
            text,
            desc,
            completed: false
        });
        taskInput.value = '';
        descInput.value = '';
        saveNextId();
        saveTasks();
        renderTasks(currentFilter);
        updateStats();
    }

    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        const descText = descInput.value.trim();
        if (taskText) {
            addTask(taskText, descText);
        }
    });

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTaskButton.click();
        }
    });

    descInput.addEventListener('keypress', (e) => {
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

    toggleTheme.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        theme = document.body.classList.contains('dark') ? 'dark' : 'light';
        saveTheme();
    });

    clearCompletedBtn.addEventListener('click', () => {
        if (confirm('¿Eliminar todas las tareas completadas?')) {
            const items = document.querySelectorAll('.task-item.completed');
            items.forEach(li => li.classList.add('slide-out'));
            setTimeout(() => {
                tasks = tasks.filter(task => !task.completed);
                saveTasks();
                renderTasks(currentFilter);
                updateStats();
            }, 400);
        }
    });

    exportExcelBtn.addEventListener('click', () => {
        const data = tasks.map(t => ({
            ID: t.id,
            Tarea: t.text,
            Descripcion: t.desc || '',
            Completada: t.completed ? 'Si' : 'No'
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Tareas');
        XLSX.writeFile(wb, 'tareas.xlsx');
    });

    renderTasks(currentFilter);
    updateStats();
});
