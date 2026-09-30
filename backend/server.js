const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./database");

const app = express();

const PORT = 3000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);


// ==========================================
// GET ALL TASKS
// ==========================================

app.get("/api/tasks", (req, res) => {

    try {

        const tasks = db.prepare(`
            SELECT *
            FROM tasks
            ORDER BY
                completed ASC,
                CASE priority
                    WHEN 'High' THEN 1
                    WHEN 'Medium' THEN 2
                    WHEN 'Low' THEN 3
                    ELSE 4
                END,
                id DESC
        `).all();

        res.json(tasks);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to fetch tasks"
        });
    }
});


// ==========================================
// GET SINGLE TASK
// ==========================================

app.get("/api/tasks/:id", (req, res) => {

    try {

        const task = db
            .prepare(`
                SELECT *
                FROM tasks
                WHERE id = ?
            `)
            .get(req.params.id);


        if (!task) {

            return res.status(404).json({
                error: "Task not found"
            });
        }


        res.json(task);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to fetch task"
        });
    }
});


// ==========================================
// CREATE TASK
// ==========================================

app.post("/api/tasks", (req, res) => {

    try {

        const {
            title,
            description = "",
            priority = "Medium",
            due_date = ""
        } = req.body;


        if (!title || title.trim() === "") {

            return res.status(400).json({
                error: "Task title is required"
            });
        }


        const validPriorities = [
            "Low",
            "Medium",
            "High"
        ];


        if (!validPriorities.includes(priority)) {

            return res.status(400).json({
                error: "Invalid priority"
            });
        }


        const result = db.prepare(`
            INSERT INTO tasks
            (
                title,
                description,
                priority,
                due_date
            )
            VALUES (?, ?, ?, ?)
        `).run(
            title.trim(),
            description.trim(),
            priority,
            due_date
        );


        const task = db
            .prepare(`
                SELECT *
                FROM tasks
                WHERE id = ?
            `)
            .get(result.lastInsertRowid);


        res.status(201).json(task);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to create task"
        });
    }
});


// ==========================================
// UPDATE TASK
// ==========================================

app.put("/api/tasks/:id", (req, res) => {

    try {

        const {
            title,
            description = "",
            priority = "Medium",
            due_date = "",
            completed = 0
        } = req.body;


        if (!title || title.trim() === "") {

            return res.status(400).json({
                error: "Task title is required"
            });
        }


        const validPriorities = [
            "Low",
            "Medium",
            "High"
        ];


        if (!validPriorities.includes(priority)) {

            return res.status(400).json({
                error: "Invalid priority"
            });
        }


        const result = db.prepare(`
            UPDATE tasks
            SET
                title = ?,
                description = ?,
                priority = ?,
                due_date = ?,
                completed = ?
            WHERE id = ?
        `).run(
            title.trim(),
            description.trim(),
            priority,
            due_date,
            completed ? 1 : 0,
            req.params.id
        );


        if (result.changes === 0) {

            return res.status(404).json({
                error: "Task not found"
            });
        }


        const updatedTask = db
            .prepare(`
                SELECT *
                FROM tasks
                WHERE id = ?
            `)
            .get(req.params.id);


        res.json(updatedTask);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to update task"
        });
    }
});


// ==========================================
// TOGGLE COMPLETION
// ==========================================

app.patch("/api/tasks/:id/toggle", (req, res) => {

    try {

        const task = db
            .prepare(`
                SELECT *
                FROM tasks
                WHERE id = ?
            `)
            .get(req.params.id);


        if (!task) {

            return res.status(404).json({
                error: "Task not found"
            });
        }


        const newStatus =
            task.completed === 1 ? 0 : 1;


        db.prepare(`
            UPDATE tasks
            SET completed = ?
            WHERE id = ?
        `).run(
            newStatus,
            req.params.id
        );


        const updatedTask = db
            .prepare(`
                SELECT *
                FROM tasks
                WHERE id = ?
            `)
            .get(req.params.id);


        res.json(updatedTask);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to update task"
        });
    }
});


// ==========================================
// DELETE TASK
// ==========================================

app.delete("/api/tasks/:id", (req, res) => {

    try {

        const result = db
            .prepare(`
                DELETE FROM tasks
                WHERE id = ?
            `)
            .run(req.params.id);


        if (result.changes === 0) {

            return res.status(404).json({
                error: "Task not found"
            });
        }


        res.json({
            message: "Task deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to delete task"
        });
    }
});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log(
        `Student Task Manager running at http://localhost:${PORT}`
    );

});