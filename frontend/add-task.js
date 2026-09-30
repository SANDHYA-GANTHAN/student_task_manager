const API_URL = "/api/tasks";

const form = document.getElementById("taskForm");

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const title = document
        .getElementById("title")
        .value
        .trim();

    const description = document
        .getElementById("description")
        .value
        .trim();

    const priority = document
        .getElementById("priority")
        .value;

    const due_date = document
        .getElementById("due_date")
        .value;

    if (!title) {

        showToast("Please enter a task title.");

        return;
    }

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title,
                description,
                priority,
                due_date
            })

        });

        if (!response.ok) {

            throw new Error(
                "Failed to create task"
            );

        }

        // Go to Tasks page after creating
        window.location.href = "tasks.html";

    } catch (error) {

        console.error(error);

        showToast(
            "Could not create task."
        );

    }

});


function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}