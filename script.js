let tasks = [];
let currentFilter = 'all';
let searchQuery = '';
let currentCalendarDate = new Date();

const taskList = document.getElementById("task-list");
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskDate = document.getElementById("task-date");
const calendarContainer = document.getElementById("calendar-container");
const searchContainer = document.getElementById("search-container");
const searchInput = document.getElementById("search-input");

// Initialize with sample data
function initializeSampleData() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    tasks = [
        { 
            id: 1, 
            text: "Welcome to your new task manager!", 
            date: today.toISOString().split('T')[0], 
            completed: false 
        },
        { 
            id: 2, 
            text: "Review project documentation", 
            date: tomorrow.toISOString().split('T')[0], 
            completed: false 
        },
        { 
            id: 3, 
            text: "Complete task manager setup", 
            date: yesterday.toISOString().split('T')[0], 
            completed: true 
        }
    ];
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const today = new Date().toISOString().split('T')[0];
    const overdue = tasks.filter(task => !task.completed && task.date && task.date < today).length;

    document.getElementById('total-tasks').textContent = total;
    document.getElementById('completed-tasks').textContent = completed;
    document.getElementById('pending-tasks').textContent = pending;
    document.getElementById('overdue-tasks').textContent = overdue;
}

function renderTasks(filter = 'all') {
    taskList.innerHTML = "";
    let filteredTasks = tasks;

    // Apply status filter
    if (filter === "completed") {
        filteredTasks = tasks.filter(task => task.completed);
    } else if (filter === "pending") {
        filteredTasks = tasks.filter(task => !task.completed);
    }

    // Apply search filter
    if (searchQuery) {
        filteredTasks = filteredTasks.filter(task => 
            task.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Show/hide no tasks message
    const noTasksDiv = document.getElementById('no-tasks');
    if (filteredTasks.length === 0) {
        noTasksDiv.classList.remove('calendar-hidden');
        noTasksDiv.textContent = searchQuery ? 'No tasks match your search.' : 
            (filter === 'all' ? '🎉 No tasks found. Add your first task above!' : 
             filter === 'completed' ? '📝 No completed tasks yet.' : '✅ No pending tasks!');
    } else {
        noTasksDiv.classList.add('calendar-hidden');
    }

    filteredTasks.forEach((task) => {
        const li = document.createElement("li");
        li.className = `task-item ${task.completed ? "completed" : ""}`;
        li.dataset.id = task.id;
        
        const taskContent = document.createElement("div");
        taskContent.className = "task-content";
        
        const taskText = document.createElement("div");
        taskText.className = "task-text";
        taskText.textContent = task.text;
        
        const taskDateSpan = document.createElement("div");
        taskDateSpan.className = "task-date";
        if (task.date) {
            const date = new Date(task.date);
            taskDateSpan.textContent = `📅 Due: ${date.toLocaleDateString()}`;
            
            // Check if overdue
            const today = new Date().toISOString().split('T')[0];
            if (!task.completed && task.date < today) {
                taskDateSpan.textContent += " ⚠️ Overdue";
                taskDateSpan.style.color = "#ff6b6b";
            }
        }

        taskContent.appendChild(taskText);
        if (task.date) taskContent.appendChild(taskDateSpan);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.onchange = () => {
            task.completed = checkbox.checked;
            renderTasks(currentFilter);
            updateStats();
            renderCalendar(currentCalendarDate);
        };

        const editBtn = document.createElement("button");
        editBtn.textContent = "✏️ Edit";
        editBtn.onclick = () => editTask(task.id);

        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑️ Delete";
        delBtn.className = "delete-btn";
        delBtn.onclick = () => deleteTask(task.id);

        actions.appendChild(checkbox);
        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        
        li.appendChild(taskContent);
        li.appendChild(actions);
        taskList.appendChild(li);
    });

    updateStats();
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newText = prompt("Edit task:", task.text);
    if (newText === null) return;

    const newDate = prompt("Edit due date (YYYY-MM-DD):", task.date || "");
    if (newText.trim() !== "") {
        task.text = newText.trim();
        task.date = newDate || "";
        renderTasks(currentFilter);
        renderCalendar(currentCalendarDate);
    }
}

function deleteTask(taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
        tasks = tasks.filter(t => t.id !== taskId);
        renderTasks(currentFilter);
        renderCalendar(currentCalendarDate);
    }
}

taskForm.onsubmit = (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    const date = taskDate.value;
    if (text) {
        const newTask = {
            id: Date.now(),
            text,
            date,
            completed: false
        };
        tasks.push(newTask);
        taskInput.value = "";
        taskDate.value = "";
        renderTasks(currentFilter);
        renderCalendar(currentCalendarDate);
    }
};

function filterTasks(status) {
    currentFilter = status;
    
    // Update active button
    document.querySelectorAll('.sidebar button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(status + '-btn').classList.add('active');
    
    renderTasks(status);
}

function toggleSearch() {
    searchContainer.classList.toggle("calendar-hidden");
    if (!searchContainer.classList.contains("calendar-hidden")) {
        searchInput.focus();
    } else {
        searchQuery = '';
        searchInput.value = '';
        renderTasks(currentFilter);
    }
}

function performSearch() {
    searchQuery = searchInput.value;
    renderTasks(currentFilter);
}

function toggleCalendar() {
    calendarContainer.classList.toggle("calendar-hidden");
    if (!calendarContainer.classList.contains("calendar-hidden")) {
        renderCalendar();
    }
}

function renderCalendar(date = new Date()) {
    currentCalendarDate = date;
    const calendarTasks = document.getElementById('calendar-tasks');
    calendarTasks.innerHTML = `
        <div class="calendar-header">
            <div class="calendar-nav">
                <button onclick="changeCalendarMonth(-1)">← Prev</button>
                <button onclick="renderCalendar(new Date())">Today</button>
                <button onclick="changeCalendarMonth(1)">Next →</button>
            </div>
            <div class="calendar-title">${date.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
        </div>
        <div class="calendar-grid" id="calendar-days"></div>
        <div class="calendar-events" id="calendar-events"></div>
    `;

    const calendarDays = document.getElementById('calendar-days');
    
    // Add day headers
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendarDays.appendChild(dayHeader);
    });

    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const today = new Date();
    const isCurrentMonth = date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
        const prevMonthDay = new Date(date.getFullYear(), date.getMonth(), 0 - i);
        const dayElement = createDayElement(prevMonthDay.getDate(), true);
        calendarDays.appendChild(dayElement);
    }
    
    // Add days of the month
    for (let i = 1; i <= totalDays; i++) {
        const dayDate = new Date(date.getFullYear(), date.getMonth(), i);
        const hasTasks = tasks.some(task => {
            const taskDate = new Date(task.date);
            return taskDate.getDate() === i && 
                   taskDate.getMonth() === date.getMonth() && 
                   taskDate.getFullYear() === date.getFullYear();
        });
        
        const isToday = isCurrentMonth && i === today.getDate();
        const dayElement = createDayElement(i, false, hasTasks, isToday);
        
        dayElement.onclick = () => showDayTasks(dayDate);
        calendarDays.appendChild(dayElement);
    }
    
    // Add empty cells for days after the last day of the month
    const remainingCells = (7 - ((startDay + totalDays) % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
        const nextMonthDay = new Date(date.getFullYear(), date.getMonth() + 1, i);
        const dayElement = createDayElement(nextMonthDay.getDate(), true);
        calendarDays.appendChild(dayElement);
    }
    
    // Show today's tasks by default
    if (isCurrentMonth) {
        showDayTasks(new Date(date.getFullYear(), date.getMonth(), today.getDate()));
    }
}

function createDayElement(day, isOtherMonth, hasTasks = false, isToday = false) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    
    if (isOtherMonth) dayElement.classList.add('other-month');
    if (hasTasks) dayElement.classList.add('has-tasks');
    if (isToday) dayElement.classList.add('today');
    
    return dayElement;
}
function showDayTasks(date) {
    const calendarEvents = document.getElementById('calendar-events');
    const formattedDate = date.toISOString().split('T')[0];
    const dayTasks = tasks.filter(task => task.date === formattedDate);
    
    // Remove selected class from all days
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('selected');
    });
    
    // Add selected class to clicked day
    document.querySelectorAll('.calendar-day').forEach(day => {
        if (parseInt(day.textContent) === date.getDate() && !day.classList.contains('other-month')) {
            day.classList.add('selected');
        }
    });
    
    calendarEvents.innerHTML = '';
    
    // Always show the add task button
    const addButton = document.createElement('button');
    addButton.className = 'add-task-btn';
    addButton.textContent = '+ Add Task';
    addButton.onclick = () => addTaskForDate(formattedDate);
    calendarEvents.appendChild(addButton);
    
    if (dayTasks.length === 0) {
        const noTasksMsg = document.createElement('div');
        noTasksMsg.className = 'calendar-event';
        noTasksMsg.textContent = 'No tasks for this day';
        calendarEvents.appendChild(noTasksMsg);
        return;
    }
    
    dayTasks.forEach(task => {
        const eventElement = document.createElement('div');
        eventElement.className = `calendar-event ${task.completed ? 'completed' : ''}`;
        
        eventElement.innerHTML = `
            <div class="calendar-event-title">${task.text}</div>
            <div class="calendar-event-time">${task.completed ? '✅ Completed' : '⏳ Pending'}</div>
        `;
        
        const actions = document.createElement('div');
        actions.className = 'calendar-event-actions';
        
        const editBtn = document.createElement('button');
        editBtn.textContent = '✏️ Edit';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            editTask(task.id);
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️ Delete';
        deleteBtn.className = 'delete';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteTask(task.id);
        };
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        eventElement.appendChild(actions);
        
        eventElement.onclick = (e) => {
            if (e.target.tagName === 'BUTTON') return;
            
            const taskElement = document.querySelector(`.task-item[data-id="${task.id}"]`);
            if (taskElement) {
                taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                taskElement.style.animation = 'highlight 1.5s';
                setTimeout(() => {
                    taskElement.style.animation = '';
                }, 1500);
            }
        };
        
        calendarEvents.appendChild(eventElement);
    });
}

function addTaskForDate(dateString) {
    const text = prompt("Enter task for " + new Date(dateString).toLocaleDateString());
    if (text && text.trim()) {
        const newTask = {
            id: Date.now(),
            text: text.trim(),
            date: dateString,
            completed: false
        };
        tasks.push(newTask);
        renderTasks(currentFilter);
        renderCalendar(currentCalendarDate);
    }
}

function changeCalendarMonth(offset) {
    const newDate = new Date(currentCalendarDate);
    newDate.setMonth(newDate.getMonth() + offset);
    renderCalendar(newDate);
}

function exportTasks() {
    // Format tasks as a readable text string
    let tasksText = "MY TASK LIST\n\n";
    tasksText += `Total Tasks: ${tasks.length}\n`;
    tasksText += `Completed: ${tasks.filter(task => task.completed).length}\n`;
    tasksText += `Pending: ${tasks.filter(task => !task.completed).length}\n\n`;
    
    // Group tasks by date
    const tasksByDate = {};
    tasks.forEach(task => {
        const date = task.date ? new Date(task.date).toLocaleDateString() : 'No Date';
        if (!tasksByDate[date]) {
            tasksByDate[date] = [];
        }
        tasksByDate[date].push(task);
    });
    
    // Add tasks to the text string
    Object.keys(tasksByDate).sort().forEach(date => {
        tasksText += `=== ${date} ===\n`;
        tasksByDate[date].forEach(task => {
            tasksText += `• ${task.text} [${task.completed ? '✅ Completed' : '⏳ Pending'}]\n`;
            if (task.date) {
                const dueDate = new Date(task.date);
                const today = new Date();
                if (!task.completed && dueDate < today) {
                    tasksText += "  ⚠️ OVERDUE\n";
                }
            }
        });
        tasksText += "\n";
    });
    
    // Create and download the file
    const blob = new Blob([tasksText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-tasks.txt';  // Changed from .json to .txt
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
function signOut() {
    if (confirm("Are you sure you want to sign out? All tasks will be lost.")) {
        tasks = [];
        renderTasks();
        renderCalendar(new Date());
        alert("Signed out successfully!");
    }
}

// Initialize the app
initializeSampleData();
renderTasks();