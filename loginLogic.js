const loginForm = document.getElementById("login-form");
const backendApi = "https://todo-backend-production-9e4e.up.railway.app/";

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const data = {};
  for (let keyValue of formData.entries()) {
    console.log(keyValue);
    data[keyValue[0]] = keyValue[1];
  }

  try {
    const token = await fetch(`${backendApi}api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });
    const fetchedData = await token.json();
    console.log(fetchedData);
    if (!fetchedData.token) {
      return Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error.message || "Something went wrong",
        background: "#1a1a2e",
        color: "#fff",
        confirmButtonColor: "#6366f1",
      });
    }
    localStorage.setItem("token", JSON.stringify(fetchedData));
    if (JSON.parse(localStorage.getItem("token")).token) {
      Swal.fire({
        icon: "success",
        title: "Login Done!",
        text: "You will be redirected in 2s",
        background: "#1a1a2e",
        color: "#fff",
        confirmButtonColor: "#6366f1",
      });
      setTimeout(() => {
        window.location.href = "todolist.html";
      }, 2000);
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Try again later",
      text: "Invalid email or password",
      background: "#1a1a2e",
      color: "#fff",
      confirmButtonColor: "#6366f1",
    });
    console.log(error);
  }
});
