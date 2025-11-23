const regForm = document.getElementById("register-form");
const backendApi = "https://todo-backend-production-9e4e.up.railway.app/";

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
    Swal.fire({
      icon: "success",
      title: "Registration Successful!",
      text: "Your account has been created",
      background: "#1a1a2e",
      color: "#fff",
      confirmButtonColor: "#6366f1",
    });
    window.location.href = "login.html";
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Registration Failed",
      text: error.message || "Something went wrong",
      background: "#1a1a2e",
      color: "#fff",
      confirmButtonColor: "#6366f1",
    });
    console.log(error);
  }
});
