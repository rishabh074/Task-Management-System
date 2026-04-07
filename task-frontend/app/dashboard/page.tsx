"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

export default function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
    } else {
      fetchTasks();
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch {
      console.log("Error fetching tasks");
    }
  };

  const addTask = async () => {
    if (!title) return;

    try {
      await API.post("/tasks", { title });
      setTitle("");
      fetchTasks();
    } catch {
      console.log("Error adding task");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
    } catch {
      console.log("Error deleting task");
    }
  };

  const toggleTask = async (id: string) => {
    try {
      await API.patch(`/tasks/${id}/toggle`);
      fetchTasks();
    } catch {
      console.log("Error toggling task");
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/login");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Task Dashboard</h1>
          <button style={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>

        <div style={styles.addTaskContainer}>
          <input
            style={styles.input}
            placeholder="Enter new task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button style={styles.addBtn} onClick={addTask}>
            Add Task
          </button>
        </div>

        <div style={styles.taskList}>
          {tasks.length === 0 ? (
            <p style={styles.empty}>No tasks yet 🚀</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} style={styles.taskItem}>
                <span
                  style={{
                    ...styles.taskText,
                    textDecoration: task.completed
                      ? "line-through"
                      : "none",
                    color: task.completed ? "#999" : "#333",
                  }}
                >
                  {task.title}
                </span>

                <div>
                  <button
                    style={styles.toggleBtn}
                    onClick={() => toggleTask(task.id)}
                  >
                    ✔
                  </button>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => deleteTask(task.id)}
                  >
                    ✖
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
  },

  card: {
    width: "400px",
    padding: "25px",
    borderRadius: "12px",
    background: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    margin: 0,
  },

  logoutBtn: {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    background: "#ff4d4f",
    color: "#fff",
    cursor: "pointer",
  },

  addTaskContainer: {
    marginTop: "20px",
    display: "flex",
    gap: "10px",
  },

  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },

  addBtn: {
    padding: "10px 15px",
    borderRadius: "6px",
    border: "none",
    background: "#4CAF50",
    color: "#fff",
    cursor: "pointer",
  },

  taskList: {
    marginTop: "20px",
  },

  taskItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    borderRadius: "6px",
    background: "#f9f9f9",
    marginBottom: "10px",
  },

  taskText: {
    fontSize: "16px",
  },

  toggleBtn: {
    marginRight: "8px",
    padding: "6px 10px",
    border: "none",
    borderRadius: "5px",
    background: "#1890ff",
    color: "#fff",
    cursor: "pointer",
  },

  deleteBtn: {
    padding: "6px 10px",
    border: "none",
    borderRadius: "5px",
    background: "#ff4d4f",
    color: "#fff",
    cursor: "pointer",
  },

  empty: {
    textAlign: "center",
    color: "#777",
  },
};
