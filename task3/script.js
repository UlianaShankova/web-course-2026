//состояние приложения
let tasks = [];
let currentFilter = 'all';
let nextId = 1;

//DOM элементы
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const statsText = document.getElementById('statsText');
const filterBtns = document.querySelectorAll('.filter-btn');

//добавление задачи
function addTask() {
    const text = taskInput.value.trim();

    if (text === '') {
        alert('Введите текст задачи!');
        return;
    }

    const newTask = {
        id: nextId++,
        text: text,
        completed: false
    };

    tasks.push(newTask);
    taskInput.value = '';

    //при добавлении нужна полная перерисовка, чтобы новый элемент появился в нужном месте (с учетом фильтра)
    render();
}

//переключение статуса задачи (НОВАЯ ЛОГИКА)
function toggleTask(id, element) {
    //обновление данных в массиве
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;

        //обновление визуала
        if (task.completed) {
            element.classList.add('completed');
        } else {
            element.classList.remove('completed');
        }

        //обновление счетчика
        updateStats();
    }
}

//удаление задачи
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    render(); //перерисовка
}

//обновление счетчика
function updateStats() {
    const activeCount = tasks.filter(t => !t.completed).length;
    const completedCount = tasks.filter(t => t.completed).length;
    statsText.textContent = `Осталось: ${activeCount}, Выполнено: ${completedCount}`;
}

//отрисовка
function render() {
    taskList.innerHTML = '';

    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;

        const leftDiv = document.createElement('div');
        leftDiv.className = 'task-left';


        leftDiv.addEventListener('click', () => toggleTask(task.id, li));

        const checkbox = document.createElement('div');
        checkbox.className = 'custom-checkbox';

        const spanText = document.createElement('span');
        spanText.className = 'task-text';
        spanText.textContent = task.text;

        leftDiv.appendChild(checkbox);
        leftDiv.appendChild(spanText);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(task.id);
        });

        li.appendChild(leftDiv);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });

    updateStats();
}

//обработка событий

addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentFilter = btn.dataset.filter;
        render();
    });
});

//первоначальный вид (рисунок)
render();