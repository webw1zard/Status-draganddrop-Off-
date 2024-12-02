import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface Task {
  id: number;
  title: string;
  status: "To do" | "In progress" | "Done";
}

const BASE_URL = "https://fake-api-dfa7.onrender.com/users";

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"To do" | "In progress" | "Done">("To do");

  const fetchTasks = useCallback(() => {
    axios.get(BASE_URL).then((response) => {
      setTasks(response.data);
    });
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = () => {
    axios
      .post(BASE_URL, { title, status })
      .then(() => {
        fetchTasks();
        closeModal();
      });
  };

  const updateTask = (task: Task) => {
    axios
      .put(`${BASE_URL}/${task.id}`, task)
      .then(() => {
        fetchTasks();
        closeModal();
      });
  };

  const deleteTask = (id: number) => {
    axios
      .delete(`${BASE_URL}/${id}`)
      .then(() => {
        fetchTasks();
      });
  };

  const moveTask = (task: Task, direction: "left" | "right") => {
    let newStatus: "To do" | "In progress" | "Done" = task.status;

    if (direction === "left") {
      if (task.status === "In progress") newStatus = "To do";
      if (task.status === "Done") newStatus = "In progress";
    } else if (direction === "right") {
      if (task.status === "To do") newStatus = "In progress";
      if (task.status === "In progress") newStatus = "Done";
    }

    axios
      .put(`${BASE_URL}/${task.id}`, { ...task, status: newStatus })
      .then(() => {
        fetchTasks();
      });
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setTitle(task.title);
    setStatus(task.status);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setTitle("");
    setStatus("To do");
    setSelectedTask(null);
  };

  return (
    <div className="container mt-5">
      <div className="row">
        {["To do", "In progress", "Done"].map((status) => (
          <div key={status} className="col-md-4">
            <div className="task-column p-3 border rounded">
              <h3 className="text-center">{status}</h3>
              <div className="task-list">
                {tasks
                  .filter((task) => task.status === status)
                  .map((task) => (
                    <div key={task.id} className="task-item mb-3 p-2 border rounded">
                      <p>{task.title}</p>
                      <div className="task-actions d-flex justify-content-between">
                        <button
                          onClick={() => openEditModal(task)}
                          className="btn btn-warning btn-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="btn btn-danger btn-sm"
                        >
                          🗑️
                        </button>
                        {task.status !== "To do" && (
                          <button
                            onClick={() => moveTask(task, "left")}
                            className="btn btn-secondary btn-sm"
                          >
                            ⬅️
                          </button>
                        )}
                        {task.status !== "Done" && (
                          <button
                            onClick={() => moveTask(task, "right")}
                            className="btn btn-secondary btn-sm"
                          >
                            ➡️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="btn btn-success mt-3"
      >
        + Add Task
      </button>

      {showModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedTask ? "Edit Task" : "Add Task"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-control mb-2"
                  placeholder="Task title"
                />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "To do" | "In progress" | "Done")}
                  className="form-control mb-3"
                >
                  <option value="To do">To do</option>
                  <option value="In progress">In progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div className="modal-footer">
                <button
                  onClick={() => {
                    if (selectedTask) {
                      updateTask({ ...selectedTask, title, status });
                    } else {
                      addTask();
                    }
                  }}
                  className="btn btn-primary"
                >
                  Save
                </button>
                <button onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
