const API_URL = "/api/tasks";


const params =
    new URLSearchParams(
        window.location.search
    );


const taskId =
    params.get("id");


if (!taskId) {

    window.location.href =
        "tasks.html";
}


async function loadTask() {

    try {

        const response =
            await fetch(
                `${API_URL}/${taskId}`
            );


        if (!response.ok) {

            throw new Error(
                "Task not found"
            );
        }


        const task =
            await response.json();


        document.getElementById(
            "title"
        ).value = task.title;


        document.getElementById(
            "description"
        ).value =
            task.description || "";


        document.getElementById(
            "priority"
        ).value =
            task.priority || "Medium";


        document.getElementById(
            "due_date"
        ).value =
            task.due_date || "";


        document.getElementById(
            "completed"
        ).value =
            task.completed ? "1" : "0";


    } catch (error) {

        console.error(error);

        alert(
            "Unable to load this task."
        );

        window.location.href =
            "tasks.html";
    }
}


document
    .getElementById("editForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const title =
                document
                    .getElementById("title")
                    .value
                    .trim();


            const description =
                document
                    .getElementById(
                        "description"
                    )
                    .value
                    .trim();


            const priority =
                document.getElementById(
                    "priority"
                ).value;


            const due_date =
                document.getElementById(
                    "due_date"
                ).value;


            const completed =
                document.getElementById(
                    "completed"
                ).value === "1";


            if (!title) {

                showToast(
                    "Task title is required."
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/${taskId}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    title,
                                    description,
                                    priority,
                                    due_date,
                                    completed
                                })
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Update failed"
                    );
                }


                window.location.href =
                    "tasks.html";


            } catch (error) {

                console.error(error);

                showToast(
                    "Could not update task."
                );

            }

        }
    );


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.classList.add("show");


    setTimeout(
        () => toast.classList.remove("show"),
        2500
    );
}


loadTask();