import {
  auth,
  onAuthStateChanged,
  signOut
} from "./firebase.js";


const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");


onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.replace("login.html");
    return;
  }

  const email = user.email || "";

  const displayName =
    user.displayName ||
    email.split("@")[0] ||
    "Creator";

  if (userName) {
    userName.textContent = displayName;
  }

  if (userEmail) {
    userEmail.textContent = email;
  }

});


if (logoutBtn) {

  logoutBtn.addEventListener("click", async () => {

    if (logoutBtn.disabled) return;

    logoutBtn.disabled = true;
    logoutBtn.textContent = "Logging out...";

    try {

      await signOut(auth);

      window.location.replace("login.html");

    } catch (error) {

      console.error("Logout error:", error);

      alert("Unable to log out. Please try again.");

      logoutBtn.disabled = false;
      logoutBtn.textContent = "Logout";

    }

  });

}


console.log("CodeFolio AI dashboard loaded successfully!");
