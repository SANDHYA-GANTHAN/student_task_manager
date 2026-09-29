const API_URL = "/api/tasks";


// ==========================================
// LOAD TASKS
// ==========================================

async function loadTasks() {

    try {

        const response = await fetch(API_URL);

        const tasks = await response.json();

        displayTasks(tasks);

    } catch (error) {

        console.error("Error loading tasks:", error);

    }
}


// ==========================================
// DISPLAY TASKS
// ==========================================

function displayTasks(tasks) {

    const taskList = document.getElementById("taskList");

    taskList.innerHTML = "";

    if (tasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty">
                No tasks yet. Add your first task!
            </div>
        `;

        updateStats([]);

        return;
    }


    tasks.forEach(task => {

        const taskElement = document.createElement("div");

        taskElement.className =
            `task ${task.completed ? "completed" : ""}`;


        taskElement.innerHTML = `

            <input
                type="checkbox"
                ${task.completed ? "checked" : ""}
                onchange="toggleTask(${task.id})"
            >

            <span class="task-title">
                ${escapeHtml(task.title)}
            </span>

            <button
                class="edit-btn"
                onclick="editTask(${task.id}, '${escapeForJs(task.title)}', ${task.completed})"
            >
                Edit
            </button>

            <button
                class="delete-btn"
                onclick="deleteTask(${task.id})"
            >
                Delete
            </button>

        `;

        taskList.appendChild(taskElement);

    });

    updateStats(tasks);
}


// ==========================================
// ADD TASK
// ==========================================

async function addTask() {

    const input = document.getElementById("taskInput");

    const title = input.value.trim();

    if (!title) {

        alert("Please enter a task.");

        return;
    }


    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title: title
            })

        });


        if (!response.ok) {

            throw new Error("Failed to add task");

        }


        input.value = "";

        loadTasks();

    } catch (error) {

        console.error(error);

        alert("Could not add task.");

    }
}


// ==========================================
// TOGGLE COMPLETED
// ==========================================

async function toggleTask(id) {

    try {

        const response = await fetch(
            `${API_URL}/${id}/toggle`,
            {
                method: "PATCH"
            }
        );


        if (!response.ok) {

            throw new Error("Failed to update task");

        }


        loadTasks();

    } catch (error) {

        console.error(error);

    }
}


// ==========================================
// EDIT TASK
// ==========================================

async function editTask(id, oldTitle, completed) {

    const newTitle = prompt(
        "Edit your task:",
        oldTitle
    );


    if (newTitle === null) {
        return;
    }


    const title = newTitle.trim();


    if (!title) {

        alert("Task title cannot be empty.");

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    title: title,
                    completed: completed
                })
            }
        );


        if (!response.ok) {

            throw new Error("Failed to edit task");

        }


        loadTasks();

    } catch (error) {

        console.error(error);

        alert("Could not edit task.");

    }
}


// ==========================================
// DELETE TASK
// ==========================================

async function deleteTask(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this task?"
    );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );


        if (!response.ok) {

            throw new Error("Failed to delete task");

        }


        loadTasks();

    } catch (error) {

        console.error(error);

        alert("Could not delete task.");

    }
}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStats(tasks) {

    const total = tasks.length;

    const completed =
        tasks.filter(task => task.completed === 1).length;

    const pending = total - completed;


    document.getElementById("totalTasks").textContent =
        total;

    document.getElementById("completedTasks").textContent =
        completed;

    document.getElementById("pendingTasks").textContent =
        pending;
}


// ==========================================
// SECURITY HELPERS
// ==========================================

function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


function escapeForJs(text) {

    return text
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


// ==========================================
// ENTER KEY
// ==========================================

document
    .getElementById("taskInput")
    .addEventListener("keypress", function(event) {

        if (event.key === "Enter") {

            addTask();

        }

    });


// ==========================================
// INITIAL LOAD
// ==========================================

loadTasks();