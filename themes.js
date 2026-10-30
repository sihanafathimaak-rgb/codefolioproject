
import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  onAuthStateChanged
} from "./firebase.js";


// =====================================
// 1. GET HTML ELEMENTS
// =====================================

const themesGrid = document.getElementById("themesGrid");

const filterButtons = document.querySelectorAll(".filter-btn");

const themeButtons = document.querySelectorAll(".select-theme-btn");


// =====================================
// 2. MESSAGE FUNCTION
// =====================================

function showMessage(message, type = "success") {

  let messageBox = document.getElementById("themeMessage");

  if (!messageBox) {

    messageBox = document.createElement("p");

    messageBox.id = "themeMessage";

    messageBox.style.textAlign = "center";
    messageBox.style.marginTop = "20px";
    messageBox.style.fontSize = "14px";

    themesGrid.after(messageBox);
  }

  messageBox.textContent = message;

  messageBox.style.color =
    type === "error" ? "#ff8585" : "#72e6c1";

}


// =====================================
// 3. FILTER THEMES
// =====================================

filterButtons.forEach(button => {

  button.addEventListener("click", () => {

    const selectedFilter = button.dataset.filter;

    // Update active filter button

    filterButtons.forEach(filter => {
      filter.classList.remove("active");
    });

    button.classList.add("active");


    // Show matching themes

    document.querySelectorAll(".theme-card").forEach(card => {

      const category = card.dataset.category;

      if (
        selectedFilter === "all" ||
        category === selectedFilter
      ) {

        card.style.display = "";

      } else {

        card.style.display = "none";

      }

    });

  });

});


// =====================================
// 4. SHOW SELECTED THEME
// =====================================

function showSelectedTheme(themeId) {

  themeButtons.forEach(button => {

    const isSelected = button.dataset.theme === themeId;

    if (isSelected) {

      button.textContent = "✓ Selected";

      button.classList.add("selected");

    } else {

      button.textContent = "Select Theme";

      button.classList.remove("selected");

    }

  });

}


// =====================================
// 5. LOAD SAVED THEME
// =====================================

async function loadSavedTheme(user) {

  try {

    const userRef = doc(db, "users", user.uid);

    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {

      const userData = userSnapshot.data();

      if (userData.selectedTheme) {

        showSelectedTheme(userData.selectedTheme);

      }

    }

  } catch (error) {

    console.error("Theme loading error:", error);

    showMessage(
      "Unable to load your saved theme.",
      "error"
    );

  }

}


// =====================================
// 6. SAVE SELECTED THEME
// =====================================

async function selectTheme(user, themeId, button) {

  try {

    button.disabled = true;

    button.textContent = "Saving...";


    const userRef = doc(db, "users", user.uid);


    await setDoc(userRef, {

      selectedTheme: themeId,

      themeUpdatedAt: serverTimestamp()

    }, {

      merge: true

    });


    showSelectedTheme(themeId);

    showMessage("Your theme has been saved successfully!");


  } catch (error) {

    console.error("Theme saving error:", error);

    button.textContent = "Select Theme";

    showMessage(
      "Unable to save your theme. Please try again.",
      "error"
    );

  } finally {

    button.disabled = false;

  }

}


// =====================================
// 7. THEME BUTTON EVENTS
// =====================================

let currentUser = null;

themeButtons.forEach(button => {

  button.addEventListener("click", async () => {

    if (!currentUser) {

      showMessage(
        "Please log in to select a theme.",
        "error"
      );

      return;

    }

    const themeId = button.dataset.theme;

    await selectTheme(
      currentUser,
      themeId,
      button
    );

  });

});


// =====================================
// 8. FIREBASE AUTHENTICATION
// =====================================

onAuthStateChanged(auth, async user => {

  if (!user) {

    window.location.href = "login.html";

    return;

  }

  currentUser = user;

  await loadSavedTheme(user);

});
