document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTask');
    const tasksList = document.getElementById('tasksList');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const totalTasks = document.getElementById('totalTasks');
    const pendingTasks = document.getElementById('pendingTasks');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function saveToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function updateStats() {
        const total = tasks.length;
        const pending = tasks.filter(task => !task.completed).length;
        totalTasks.textContent = total;
        pendingTasks.textContent = pending;
    }

    function renderTasks(filter) {
        tasksList.innerHTML = '';
        const filteredTasks = filter === 'all' 
            ? tasks 
            : tasks.filter(task => task.completed === (filter === 'completed'));

        filteredTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span>${task.text}</span>
                <button class="delete">Eliminar</button>
            `;
            tasksList.appendChild(li);

            li.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
                tasks[index].completed = e.target.checked;
                li.classList.toggle('completed');
                saveToLocalStorage();
                updateStats();
            });

            li.querySelector('.delete').addEventListener('click', () => {
                tasks.splice(index, 1);
                saveToLocalStorage();
                renderTasks(filter);
                updateStats();
            });
        });
    }

    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText) {
            tasks.push({
                text: taskText,
                completed: false
            });
            taskInput.value = '';
            saveToLocalStorage();
            renderTasks('all');
            updateStats();
        }
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderTasks(button.dataset.filter);
        });
    });

    // Inicializar la aplicación
    renderTasks('all');
    updateStats();
});
