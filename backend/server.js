const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./database");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));


// ==========================================
// GET ALL TASKS
// ==========================================

app.get("/api/tasks", (req, res) => {
    try {
        const tasks = db
            .prepare("SELECT * FROM tasks ORDER BY id DESC")
            .all();

        res.json(tasks);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch tasks"
        });
    }
});


// ==========================================
// CREATE TASK
// ==========================================

app.post("/api/tasks", (req, res) => {
    try {
        const { title } = req.body;

        if (!title || title.trim() === "") {
            return res.status(400).json({
                error: "Task title is required"
            });
        }

        const statement = db.prepare(`
            INSERT INTO tasks (title)
            VALUES (?)
        `);

        const result = statement.run(title.trim());

        const newTask = db
            .prepare("SELECT * FROM tasks WHERE id = ?")
            .get(result.lastInsertRowid);

        res.status(201).json(newTask);

    } catch (error) {
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
        const id = req.params.id;
        const { title, completed } = req.body;

        if (!title || title.trim() === "") {
            return res.status(400).json({
                error: "Task title is required"
            });
        }

        const statement = db.prepare(`
            UPDATE tasks
            SET title = ?, completed = ?
            WHERE id = ?
        `);

        const result = statement.run(
            title.trim(),
            completed ? 1 : 0,
            id
        );

        if (result.changes === 0) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        const updatedTask = db
            .prepare("SELECT * FROM tasks WHERE id = ?")
            .get(id);

        res.json(updatedTask);

    } catch (error) {
        res.status(500).json({
            error: "Failed to update task"
        });
    }
});


// ==========================================
// TOGGLE TASK COMPLETION
// ==========================================

app.patch("/api/tasks/:id/toggle", (req, res) => {
    try {
        const id = req.params.id;

        const task = db
            .prepare("SELECT * FROM tasks WHERE id = ?")
            .get(id);

        if (!task) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        const newStatus = task.completed === 1 ? 0 : 1;

        db.prepare(`
            UPDATE tasks
            SET completed = ?
            WHERE id = ?
        `).run(newStatus, id);

        const updatedTask = db
            .prepare("SELECT * FROM tasks WHERE id = ?")
            .get(id);

        res.json(updatedTask);

    } catch (error) {
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
        const id = req.params.id;

        const result = db
            .prepare("DELETE FROM tasks WHERE id = ?")
            .run(id);

        if (result.changes === 0) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            error: "Failed to delete task"
        });
    }
});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});