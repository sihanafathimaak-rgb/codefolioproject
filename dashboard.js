
import {
  auth,
  onAuthStateChanged,
  signOut
} from "./firebase.js";


// ===================================
// 1. GET HTML ELEMENTS
// ===================================

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");


// ===================================
// 2. AUTHENTICATION STATE
// ===================================

onAuthStateChanged(auth, (user) => {

  // If user is not logged in, redirect to login page
  if (!user) {
    window.location.replace("login.html");
    return;
  }

  // Safely get email
  const email = user.email || "";

  // Get display name or email username
  const displayName =
    user.displayName ||
    email.split("@")[0] ||
    "Creator";

  // Update dashboard UI
  if (userName) {
    userName.textContent = displayName;
  }

  if (userEmail) {
    userEmail.textContent = email;
  }

});


// ===================================
// 3. LOGOUT FUNCTION
// ===================================

if (logoutBtn) {

  logoutBtn.addEventListener("click", async () => {

    // Prevent multiple clicks
    if (logoutBtn.disabled) return;

    logoutBtn.disabled = true;
    logoutBtn.textContent = "Logging out...";

    try {

      // Sign out from Firebase
      await signOut(auth);

      // Redirect to login page
      window.location.replace("login.html");

    } catch (error) {

      console.error("Logout error:", error);

      alert("Unable to log out. Please try again.");

      // Enable button again if logout fails
      logoutBtn.disabled = false;
      logoutBtn.textContent = "Logout";

    }

  });

}


// ===================================
// 4. PAGE LOADED
// ===================================

console.log("CodeFolio AI dashboard loaded successfully!");
