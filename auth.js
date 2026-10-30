
import {
    auth,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile
} from "./firebase.js";


// =====================================
// 1. GET HTML ELEMENTS
// =====================================

const authForm = document.getElementById("authForm");

const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");

const nameGroup = document.getElementById("nameGroup");
const fullName = document.getElementById("fullName");

const email = document.getElementById("email");
const password = document.getElementById("password");

const confirmGroup = document.getElementById("confirmGroup");
const confirmPassword = document.getElementById("confirmPassword");

const loginOptions = document.getElementById("loginOptions");
const rememberMe = document.getElementById("rememberMe");

const forgotPassword = document.getElementById("forgotPassword");

const authMessage = document.getElementById("authMessage");
const authSubmit = document.getElementById("authSubmit");

const switchPrompt = document.getElementById("switchPrompt");
const switchAuth = document.getElementById("switchAuth");


// =====================================
// 2. CHECK SIGNUP URL
// =====================================

const urlParams = new URLSearchParams(window.location.search);

let isSignup = urlParams.get("mode") === "signup";


// =====================================
// 3. SHOW MESSAGE
// =====================================

function showMessage(message, type = "error") {

    authMessage.textContent = message;

    authMessage.className = `auth-message ${type}`;

    authMessage.style.display = "block";
}


function clearMessage() {

    authMessage.textContent = "";

    authMessage.className = "auth-message";

    authMessage.style.display = "none";
}


// =====================================
// 4. FIREBASE ERROR HANDLING
// =====================================

function getErrorMessage(error) {

    const errorMessages = {

        "auth/email-already-in-use":
            "This email is already registered. Please log in.",

        "auth/invalid-email":
            "Please enter a valid email address.",

        "auth/weak-password":
            "Password must contain at least 6 characters.",

        "auth/user-not-found":
            "No account found with this email. Please sign up.",

        "auth/wrong-password":
            "Incorrect password. Please try again.",

        "auth/invalid-credential":
            "Invalid email or password. Please check your details.",

        "auth/too-many-requests":
            "Too many attempts. Please try again later.",

        "auth/network-request-failed":
            "Network error. Please check your internet connection."

    };

    return errorMessages[error.code] ||
        "Something went wrong. Please try again.";

}


// =====================================
// 5. UPDATE LOGIN / SIGNUP UI
// =====================================

function updateAuthMode() {

    clearMessage();

    if (isSignup) {

        // SIGNUP MODE

        authTitle.textContent = "Create Your Account";

        authSubtitle.textContent =
            "Start building your professional portfolio today.";

        nameGroup.style.display = "block";

        fullName.required = true;

        confirmGroup.style.display = "block";

        confirmPassword.required = true;

        loginOptions.style.display = "none";

        authSubmit.textContent = "Create Account";

        switchPrompt.textContent =
            "Already have an account?";

        switchAuth.textContent = "Log In";

    } else {

        // LOGIN MODE

        authTitle.textContent = "Welcome back";

        authSubtitle.textContent =
            "Log in to continue building your portfolio.";

        nameGroup.style.display = "none";

        fullName.required = false;

        confirmGroup.style.display = "none";

        confirmPassword.required = false;

        loginOptions.style.display = "flex";

        authSubmit.textContent = "Log In →";

        switchPrompt.textContent =
            "Don't have an account?";

        switchAuth.textContent = "Create account";

    }

    // Clear old form values when switching modes
    fullName.value = "";
    password.value = "";
    confirmPassword.value = "";

}


// =====================================
// 6. SWITCH BETWEEN LOGIN AND SIGNUP
// =====================================

switchAuth.addEventListener("click", () => {

    isSignup = !isSignup;

    const newUrl = isSignup
        ? "login.html?mode=signup"
        : "login.html";

    window.history.replaceState({}, "", newUrl);

    updateAuthMode();

});


// =====================================
// 7. EMAIL SIGNUP AND LOGIN
// =====================================

authForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    clearMessage();

    const userEmail = email.value.trim();

    const userPassword = password.value;

    authSubmit.disabled = true;

    authSubmit.textContent = "Please wait...";

    try {

        // Set login persistence
        const persistence = rememberMe.checked
            ? browserLocalPersistence
            : browserSessionPersistence;

        await setPersistence(auth, persistence);


        // =================================
        // SIGNUP
        // =================================

        if (isSignup) {

            const userName = fullName.value.trim();

            const confirmValue = confirmPassword.value;

            if (!userName) {

                showMessage("Please enter your full name.");

                return;
            }

            if (userPassword.length < 6) {

                showMessage(
                    "Password must contain at least 6 characters."
                );

                return;
            }

            if (userPassword !== confirmValue) {

                showMessage("Passwords do not match.");

                return;
            }


            // Create Firebase account
            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    userEmail,
                    userPassword
                );


            // Save user's display name
            await updateProfile(userCredential.user, {
                displayName: userName
            });


            showMessage(
                "Account created successfully!",
                "success"
            );


            // Go to dashboard
            window.location.replace("dashboard.html");

        }


        // =================================
        // LOGIN
        // =================================

        else {

            await signInWithEmailAndPassword(
                auth,
                userEmail,
                userPassword
            );


            showMessage(
                "Login successful!",
                "success"
            );


            // Go to dashboard
            window.location.replace("dashboard.html");

        }

    } catch (error) {

        console.error("Authentication error:", error);

        showMessage(getErrorMessage(error));

    } finally {

        authSubmit.disabled = false;

        authSubmit.textContent = isSignup
            ? "Create Account"
            : "Log In →";

    }

});


// =====================================
// 8. FORGOT PASSWORD
// =====================================

forgotPassword.addEventListener("click", async (event) => {

    event.preventDefault();

    clearMessage();

    const userEmail = email.value.trim();

    if (!userEmail) {

        showMessage(
            "Please enter your email address first."
        );

        email.focus();

        return;
    }

    try {

        await sendPasswordResetEmail(auth, userEmail);

        showMessage(
            "Password reset link sent! Please check your email.",
            "success"
        );

    } catch (error) {

        console.error("Password reset error:", error);

        showMessage(getErrorMessage(error));

    }

});


// =====================================
// 9. INITIALIZE AUTH PAGE
// =====================================

updateAuthMode();

console.log(
    "CodeFolio AI Email Authentication loaded successfully!"
);
