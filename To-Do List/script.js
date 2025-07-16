document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const taskCount = document.getElementById('taskCount');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Current filter
    let currentFilter = 'all';
    
    // Initialize the app
    init();
    
    function init() {
        // Load tasks from localStorage
        loadTasks();
        
        // Update task count
        updateTaskCount();
        
        // Event listeners
        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTask();
        });
        
        clearCompletedBtn.addEventListener('click', clearCompleted);
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderTasks();
            });
        });
    }
    
    // Add a new task
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') return;
        
        const tasks = getTasks();
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false
        };
        
        tasks.push(newTask);
        saveTasks(tasks);
        
        taskInput.value = '';
        renderTasks();
        updateTaskCount();
    }
    
    // Render tasks based on current filter
    function renderTasks() {
        const tasks = getTasks();
        
        // Filter tasks
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        // Clear the task list
        taskList.innerHTML = '';
        
        // Add tasks to the DOM
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.dataset.id = task.id;
            
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            `;
            
            taskList.appendChild(taskItem);
            
            // Add event listeners to the new elements
            const checkbox = taskItem.querySelector('.task-checkbox');
            const deleteBtn = taskItem.querySelector('.delete-btn');
            const taskText = taskItem.querySelector('.task-text');
            
            checkbox.addEventListener('change', function() {
                toggleTaskComplete(task.id);
            });
            
            deleteBtn.addEventListener('click', function() {
                deleteTask(task.id);
            });
            
            // Double click to edit
            taskText.addEventListener('dblclick', function() {
                editTask(task.id, taskText);
            });
        });
    }
    
    // Toggle task completion status
    function toggleTaskComplete(taskId) {
        const tasks = getTasks();
        const taskIndex = tasks.findIndex(task => task.id == taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks(tasks);
            renderTasks();
            updateTaskCount();
        }
    }
    
    // Delete a task
    function deleteTask(taskId) {
        const tasks = getTasks().filter(task => task.id != taskId);
        saveTasks(tasks);
        renderTasks();
        updateTaskCount();
    }
    
    // Edit a task
    function editTask(taskId, taskTextElement) {
        const tasks = getTasks();
        const taskIndex = tasks.findIndex(task => task.id == taskId);
        
        if (taskIndex === -1) return;
        
        const currentText = tasks[taskIndex].text;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-input';
        
        // Replace text with input field
        taskTextElement.parentNode.replaceChild(input, taskTextElement);
        input.focus();
        
        // Save on Enter or blur
        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                tasks[taskIndex].text = newText;
                saveTasks(tasks);
            }
            renderTasks();
        };
        
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') saveEdit();
        });
        
        input.addEventListener('blur', saveEdit);
    }
    
    // Clear completed tasks
    function clearCompleted() {
        const tasks = getTasks().filter(task => !task.completed);
        saveTasks(tasks);
        renderTasks();
        updateTaskCount();
    }
    
    // Update task count
    function updateTaskCount() {
        const tasks = getTasks();
        const activeTasks = tasks.filter(task => !task.completed).length;
        taskCount.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} left`;
    }
    
    // Get tasks from localStorage
    function getTasks() {
        const tasksJSON = localStorage.getItem('tasks');
        return tasksJSON ? JSON.parse(tasksJSON) : [];
    }
    
    // Save tasks to localStorage
    function saveTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Load tasks from localStorage
    function loadTasks() {
        renderTasks();
    }
    
    // Initial render
    renderTasks();
});