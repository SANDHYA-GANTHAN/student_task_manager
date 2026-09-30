const API_URL = "/api/tasks";


async function loadDashboard() {

    try {

        const response =
            await fetch(API_URL);

        const tasks =
            await response.json();


        updateStatistics(tasks);

        displayRecentTasks(tasks);

    } catch (error) {

        console.error(error);

    }
}


function updateStatistics(tasks) {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task => task.completed === 1
        ).length;


    const pending =
        total - completed;


    const high =
        tasks.filter(
            task =>
                task.priority === "High" &&
                task.completed === 0
        ).length;


    const progress =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    document.getElementById(
        "totalTasks"
    ).textContent = total;


    document.getElementById(
        "completedTasks"
    ).textContent = completed;


    document.getElementById(
        "pendingTasks"
    ).textContent = pending;


    document.getElementById(
        "highTasks"
    ).textContent = high;


    document.getElementById(
        "progressValue"
    ).textContent = `${progress}%`;


    document.getElementById(
        "progressFill"
    ).style.width = `${progress}%`;
}


function displayRecentTasks(tasks) {

    const container =
        document.getElementById(
            "recentTasks"
        );


    const recent =
        tasks.slice(0, 5);


    if (recent.length === 0) {

        container.innerHTML = `
            <div class="empty">

                <div class="empty-icon">
                    ✓
                </div>

                <h3>No tasks yet</h3>

                <p>
                    Create your first task and get started.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML = "";


    recent.forEach(task => {

        container.insertAdjacentHTML(
            "beforeend",
            createTaskHTML(task)
        );

    });


    document
        .querySelectorAll(".dashboard-check")
        .forEach(check => {

            check.addEventListener(
                "change",
                () => toggleTask(check.dataset.id)
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
                class="check dashboard-check"
                data-id="${task.id}"
                ${task.completed ? "checked" : ""}
            >


            <div class="task-content">

                <div class="task-title">
                    ${escapeHTML(task.title)}
                </div>

                ${
                    task.due_date
                        ? `
                            <div class="task-description">
                                Due ${formatDate(task.due_date)}
                            </div>
                          `
                        : ""
                }

            </div>


            <span class="badge ${priority}">
                ${escapeHTML(task.priority)}
            </span>


            <div class="task-actions">

                <a
                    class="icon-btn"
                    href="edit-task.html?id=${task.id}"
                    title="Edit"
                >
                    ✎
                </a>

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


        loadDashboard();

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


    if (parts.length !== 3) {
        return date;
    }


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
            month: "short",
            year: "numeric"
        }
    );
}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


loadDashboard();