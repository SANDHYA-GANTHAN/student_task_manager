const API_URL = "/api/tasks";

let allTasks = [];


async function loadTasks() {

    try {

        const response =
            await fetch(API_URL);

        allTasks =
            await response.json();

        renderTasks();

    } catch (error) {

        console.error(error);

    }
}


function renderTasks() {

    const search =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase()
            .trim();


    const status =
        document
            .getElementById("statusFilter")
            .value;


    const priority =
        document
            .getElementById("priorityFilter")
            .value;


    const filtered =
        allTasks.filter(task => {

            const matchesSearch =
                task.title
                    .toLowerCase()
                    .includes(search);


            const matchesStatus =
                status === "all" ||
                (
                    status === "completed" &&
                    task.completed === 1
                ) ||
                (
                    status === "pending" &&
                    task.completed === 0
                );


            const matchesPriority =
                priority === "all" ||
                task.priority === priority;


            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority
            );

        });


    const container =
        document.getElementById(
            "taskList"
        );


    if (filtered.length === 0) {

        container.innerHTML = `
            <div class="empty">

                <div class="empty-icon">
                    ⌕
                </div>

                <h3>No tasks found</h3>

                <p>
                    Try changing your search or filters.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML = filtered
        .map(createTaskHTML)
        .join("");


    document
        .querySelectorAll(".task-check")
        .forEach(element => {

            element.addEventListener(
                "change",
                () => toggleTask(element.dataset.id)
            );

        });


    document
        .querySelectorAll(".delete-task")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => deleteTask(button.dataset.id)
            );

        });
}


function createTaskHTML(task) {

    const priority =
        task.priority.toLowerCase();


    return `
        <div
            class="task-row
                ${task.completed ? "task-completed" : ""}"
        >

            <input
                type="checkbox"
                class="check task-check"
                data-id="${task.id}"
                ${task.completed ? "checked" : ""}
            >


            <div class="task-content">

                <div class="task-title">
                    ${escapeHTML(task.title)}
                </div>

                ${
                    task.description
                        ? `
                            <div class="task-description">
                                ${escapeHTML(
                                    task.description
                                )}
                            </div>
                          `
                        : ""
                }

            </div>


            ${
                task.due_date
                    ? `
                        <span class="task-date">
                            ${formatDate(task.due_date)}
                        </span>
                      `
                    : ""
            }


            <span class="badge ${priority}">
                ${escapeHTML(task.priority)}
            </span>


            <div class="task-actions">

                <a
                    href="edit-task.html?id=${task.id}"
                    class="icon-btn"
                    title="Edit task"
                >
                    ✎
                </a>


                <button
                    type="button"
                    class="icon-btn delete delete-task"
                    data-id="${task.id}"
                    title="Delete task"
                >
                    ×
                </button>

            </div>

        </div>
    `;
}


async function toggleTask(id) {

    try {

        await fetch(
            `${API_URL}/${id}/toggle`,
            {
                method: "PATCH"
            }
        );


        await loadTasks();

        showToast("Task updated");

    } catch (error) {

        console.error(error);

    }
}


async function deleteTask(id) {

    const confirmed =
        confirm(
            "Delete this task?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );


        await loadTasks();

        showToast("Task deleted");

    } catch (error) {

        console.error(error);

    }
}


function formatDate(date) {

    if (!date) {
        return "";
    }


    const parts =
        date.split("-");


    return new Date(
        Date.UTC(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        )
    ).toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short"
        }
    );
}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


function showToast(message) {

    const toast =
        document.getElementById("toast");


    toast.textContent =
        message;


    toast.classList.add("show");


    setTimeout(
        () => toast.classList.remove("show"),
        2200
    );
}


document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        renderTasks
    );


document
    .getElementById("statusFilter")
    .addEventListener(
        "change",
        renderTasks
    );


document
    .getElementById("priorityFilter")
    .addEventListener(
        "change",
        renderTasks
    );


loadTasks();