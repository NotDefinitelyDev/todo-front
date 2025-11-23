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
      return alert(fetchedData.message);
    }
    localStorage.setItem("token", JSON.stringify(fetchedData));
    if (JSON.parse(localStorage.getItem("token")).token) {
      // window.location.href = "todolist.html";
    }
  } catch (error) {
    alert(error);
    console.log(error);
  }
});
