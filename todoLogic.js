const todoForm = document.getElementById("todo-form");
const todoText = document.getElementById("todoValue");
const todoCon = document.getElementById("todos-container");
const backendApi = "https://todo-backend-production-9e4e.up.railway.app/";

// Helper to get username from token
function getUserName() {
  const tokenData = localStorage.getItem("token");
  if (tokenData) {
    try {
      const parsedData = JSON.parse(tokenData);
      const token = parsedData.token;
      if (token) {
        // Decode JWT payload (middle part)
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          window
            .atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
        return JSON.parse(jsonPayload).username;
      }
    } catch (e) {
      console.error("Error parsing token", e);
    }
  }
  return "User";
}

// Display Username
const headerH2 = document.querySelector("h2");
if (headerH2) {
    headerH2.innerText = `Hello ${getUserName()}`;
}

// Delete All
const deleteAllHandle = async () => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete all!",
    background: "#1a1a2e",
    color: "#fff",
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(`${backendApi}api/todos`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete all todos");

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "All todos have been deleted.",
        timer: 2000,
        showConfirmButton: false,
        background: "#1a1a2e",
        color: "#fff",
      });
      todoCon.innerHTML = "";
      getData(false); // Don't show full page loader
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
        background: "#1a1a2e",
        color: "#fff",
      });
    }
  }
};

// Create Todo
todoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = todoText.value;
  const submitBtn = todoForm.querySelector("button");
  const originalBtnText = submitBtn.innerText;

  submitBtn.disabled = true;
  submitBtn.innerText = "Adding...";

  try {
    const response = await fetch(`${backendApi}api/todos`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: data,
      }),
    });

    if (!response.ok) throw new Error("Failed to add todo");

    Swal.fire({
      icon: "success",
      title: "Todo Added!",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      background: "#1a1a2e",
      color: "#fff",
    });
    getData(false); // don't show loading text
    todoText.value = "";
  } catch (error) {
    console.log(error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to add todo",
      background: "#1a1a2e",
      color: "#fff",
    });
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = originalBtnText;
  }
});

// Delete Todo
window.deleteTodo = async (id) => {
  try {
    const response = await fetch(`${backendApi}api/todos/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to delete todo");

    // Remove element from DOM immediately for better UX
    const item = document.getElementById(`todo-${id}`);
    if (item) item.remove();

    // Check if empty after deletion
    if (todoCon.children.length === 0) {
      renderEmptyState();
    }

    Swal.fire({
      icon: "success",
      title: "Todo Deleted!",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      background: "#1a1a2e",
      color: "#fff",
    });
  } catch (err) {
    console.log(err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to delete todo",
      background: "#1a1a2e",
      color: "#fff",
    });
    // If failed, reload data to ensure consistency
    getData(false);
  }
};

// Edit Todo
window.editTodo = async (id, currentTitle) => {
    const { value: newTitle } = await Swal.fire({
        title: "Edit Todo",
        input: "text",
        inputValue: currentTitle,
        showCancelButton: true,
        background: "#1a1a2e",
        color: "#fff",
        inputValidator: (value) => {
            if (!value) {
                return "You need to write something!";
            }
        }
    });

    if (newTitle && newTitle !== currentTitle) {
        // Safe Edit: Create new first, then delete old
        try {
            Swal.showLoading();

            // 1. Create new todo
            const createResponse = await fetch(`${backendApi}api/todos`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: newTitle,
                }),
            });

            if (!createResponse.ok) throw new Error("Failed to create new version of todo");

            // 2. Delete old todo
            const deleteResponse = await fetch(`${backendApi}api/todos/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!deleteResponse.ok) {
                // Warning: Created new but failed to delete old.
                // We reload data and show a warning? Or just ignore?
                // It's safer to just reload and let user deal with duplicate than lose data.
                console.warn("Failed to delete old todo after creating new one");
                getData(false);
                throw new Error("Created new item but failed to delete old one. You may have duplicates.");
            }

            Swal.fire({
                icon: "success",
                title: "Todo Updated!",
                text: "Item moved to bottom.",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                background: "#1a1a2e",
                color: "#fff",
            });
            getData(false);

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message || "Failed to update todo",
                background: "#1a1a2e",
                color: "#fff",
            });
        }
    }
};

function renderEmptyState() {
    todoCon.innerHTML = `<div class="empty-state">No todos yet. Add one above!</div>`;
}

// Get all todos
// isInitialLoad: true by default. Pass false to avoid flickering "Loading..." on updates.
async function getData(isInitialLoad = true) {
  if (isInitialLoad) {
      todoCon.innerHTML = '<div style="text-align:center; color: #a0a0b8;">Loading...</div>';
  }

  try {
      const todos = await fetch(`${backendApi}api/todos`, {
        method: "GET",
        credentials: "include",
      });

      if (!todos.ok) throw new Error("Failed to fetch todos");

      const result = await todos.json();
      const todosArr = result.todos;

      // If we are not doing initial load, we still want to clear before rendering new list
      // But checking `ok` first prevents clearing if fetch fails.
      todoCon.innerHTML = "";

      if (todosArr && todosArr.length > 0) {
        todosArr.forEach((todo) => {
            // Create elements
            const todoItem = document.createElement("div");
            todoItem.className = "todo-item";
            todoItem.id = `todo-${todo._id}`;

            const todoTextDiv = document.createElement("div");
            todoTextDiv.className = "todo-text";
            todoTextDiv.textContent = todo.title;

            const actionsDiv = document.createElement("div");
            actionsDiv.className = "todo-actions";

            const editBtn = document.createElement("button");
            editBtn.className = "edit-btn";
            editBtn.innerText = "Edit";
            editBtn.onclick = () => editTodo(todo._id, todo.title);

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.innerText = "Delete";
            deleteBtn.onclick = () => deleteTodo(todo._id);

            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);

            todoItem.appendChild(todoTextDiv);
            todoItem.appendChild(actionsDiv);

            todoCon.appendChild(todoItem);
        });
      } else {
        renderEmptyState();
      }
  } catch (error) {
      console.error(error);
      if (isInitialLoad) {
          todoCon.innerHTML = '<div style="text-align:center; color: #ff6b6b;">Failed to load todos</div>';
      } else {
          // If update failed, maybe show a toast
           Swal.fire({
            icon: "error",
            title: "Connection Error",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            background: "#1a1a2e",
            color: "#fff",
          });
      }
  }
}

// First Load
getData(true);
