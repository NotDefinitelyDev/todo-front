const todoForm = document.getElementById("todo-form");
const todoText = document.getElementById("todoValue");
const todoCon = document.getElementById("todos-container");
const backendApi = "todo-backend-production-9e4e.up.railway.app/";

// Delete All
const deleteAllHandle = async () => {
  await fetch(`${backendApi}api/todos`, {
    method: "DELETE",
  });
  todoCon.innerHTML = "";
  getData();
};

// Create Todo
todoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = todoText.value;
  try {
    await fetch(`${backendApi}api/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: data,
      }),
    });
    todoCon.innerHTML = "";
    getData();
    todoText.value = "";
  } catch (error) {
    console.log(error);
  }
});

// Get all todos & delete one
async function getData() {
  const todos = await fetch(`${backendApi}api/todos`, {
    method: "GET",
  });
  const result = await todos.json();
  const todosArr = result.todos;
  if (todosArr) {
    todosArr.forEach((todo) => {
      const todoHandler = document.createElement("div");
      const deleteBtn = document.createElement("button");
      deleteBtn.innerText = "delete";
      // Delete All
      deleteBtn.addEventListener("click", async (e) => {
        try {
          await fetch(`${backendApi}api/todos/${todo._id}`, {
            method: "DELETE",
          });
          todoCon.innerHTML = "";
          getData();
        } catch (err) {
          console.log(err);
        }
      });
      todoHandler.append(deleteBtn);
      todoHandler.append(todo.title);
      todoCon.appendChild(todoHandler);
    });
  }
}

// First Load
getData();
