export function Logout()
{
  localStorage.clear();

  window.addEventListener("beforeunload", function (event) {

    localStorage.removeItem('authToken');
  });
  window.location.href = "http://localhost:3000/Login";

}