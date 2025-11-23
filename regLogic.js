const regForm = document.getElementById("register-form");
const backendApi = "todo-backend-production-9e4e.up.railway.app/";

regForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(regForm);
  const data = {};
  for (let keyValue of formData.entries()) {
    console.log(keyValue);
    data[keyValue[0]] = keyValue[1];
  }
  console.log(data);
  try {
    const regCall = await fetch(`${backendApi}api/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
      }),
    });
    const token = await regCall.json();
    localStorage.setItem("token", JSON.stringify(token));
    alert("Welcome");
    window.location.href = "login.html";
  } catch (error) {
    alert(error);
    console.log(error);
  }
});
