import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateProfile,
  onAuthStateChanged
} from "./firebase.js";


// ==========================================
// 1. HTML ELEMENTS
// ==========================================

const profileForm = document.getElementById("profileForm");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("profileEmail");

const photoInput = document.getElementById("profilePhoto");
const photoPreview = document.getElementById("photoPreview");
const photoPlaceholder = document.getElementById("photoPlaceholder");

const careerStatus = document.getElementById("careerStatus");
const experienceSection = document.getElementById("experienceSection");

const profileMessage = document.getElementById("profileMessage");
const saveProfileButton = document.getElementById("saveProfile");

let currentUser = null;
let existingPhotoURL = "";


// ==========================================
// 2. MESSAGE FUNCTION
// ==========================================

function showMessage(message, type = "success") {
  if (!profileMessage) return;

  profileMessage.textContent = message;
  profileMessage.className = type;
}


// ==========================================
// 3. PROFILE PHOTO DISPLAY
// ==========================================

function displayPhoto(imageURL) {
  if (!imageURL || !photoPreview) return;

  let image = photoPreview.querySelector("img");

  if (!image) {
    image = document.createElement("img");
    image.alt = "Profile picture";

    image.style.width = "100%";
    image.style.height = "100%";
    image.style.objectFit = "cover";
    image.style.borderRadius = "50%";

    photoPreview.appendChild(image);
  }

  image.src = imageURL;

  if (photoPlaceholder) {
    photoPlaceholder.style.display = "none";
  }
}


// ==========================================
// 4. PROFILE PHOTO PREVIEW
// ==========================================
// Photo preview works locally in the browser.
// Permanent photo upload is temporarily disabled
// because Firebase Storage requires a billing plan.

if (photoInput) {
  photoInput.addEventListener("change", () => {
    const file = photoInput.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showMessage("Please select a valid image.", "error");
      photoInput.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("Image must be smaller than 5 MB.", "error");
      photoInput.value = "";
      return;
    }

    const imageURL = URL.createObjectURL(file);

    displayPhoto(imageURL);

    showMessage(
      "Photo preview updated. Permanent photo saving is temporarily unavailable.",
      "success"
    );
  });
}


// ==========================================
// 5. REPEATING SECTION CONFIGURATION
// ==========================================

const repeatingSections = [
  {
    containerId: "experienceContainer",
    buttonId: "addExperience",
    selector: ".experience-item"
  },
  {
    containerId: "educationContainer",
    buttonId: "addEducation",
    selector: ".education-item"
  },
  {
    containerId: "skillsContainer",
    buttonId: "addSkill",
    selector: ".skill-item"
  },
  {
    containerId: "projectsContainer",
    buttonId: "addProject",
    selector: ".project-item"
  },
  {
    containerId: "certificatesContainer",
    buttonId: "addCertificate",
    selector: ".certificate-item"
  }
];


// ==========================================
// 6. CLEAR CLONED FIELDS
// ==========================================

function clearFields(item) {
  item.querySelectorAll("input, textarea, select").forEach(field => {
    if (field.type === "checkbox" || field.type === "radio") {
      field.checked = false;
    } else if (field.tagName === "SELECT") {
      field.selectedIndex = 0;
    } else {
      field.value = "";
    }
  });
}


// ==========================================
// 7. ADD AND REMOVE REPEATING FIELDS
// ==========================================

repeatingSections.forEach(section => {
  const container = document.getElementById(section.containerId);
  const addButton = document.getElementById(section.buttonId);

  if (!container || !addButton) return;

  addButton.addEventListener("click", () => {
    const firstItem = container.querySelector(section.selector);

    if (!firstItem) return;

    const newItem = firstItem.cloneNode(true);

    clearFields(newItem);

    container.appendChild(newItem);
  });

  container.addEventListener("click", event => {
    const removeButton = event.target.closest(".remove-btn");

    if (!removeButton) return;

    const item = removeButton.closest(section.selector);

    if (!item) return;

    const allItems = container.querySelectorAll(section.selector);

    if (allItems.length > 1) {
      item.remove();
    } else {
      clearFields(item);
    }
  });
});


// ==========================================
// 8. OPTIONAL PROJECT AND CERTIFICATE FIELDS
// ==========================================

document.querySelectorAll(
  ".project-item input, .project-item textarea, .certificate-item input"
).forEach(field => {
  field.required = false;
});


// ==========================================
// 9. FRESHER / EXPERIENCED TOGGLE
// ==========================================

function toggleExperienceSection() {
  if (!careerStatus || !experienceSection) return;

  const isExperienced = careerStatus.value === "experienced";

  experienceSection.hidden = !isExperienced;
}

if (careerStatus) {
  careerStatus.addEventListener("change", toggleExperienceSection);
  toggleExperienceSection();
}


// ==========================================
// 10. GET BASIC FORM VALUES
// ==========================================

function getFieldValue(id) {
  const element = document.getElementById(id);

  return element ? element.value.trim() : "";
}


// ==========================================
// 11. GET REPEATING SECTION DATA
// ==========================================

function getRepeatedData(containerId, selector) {
  const container = document.getElementById(containerId);

  if (!container) return [];

  const items = container.querySelectorAll(selector);
  const result = [];

  items.forEach(item => {
    const entry = {};

    item.querySelectorAll("[name]").forEach(field => {
      const key = field.name.replace("[]", "");

      entry[key] = field.value.trim();
    });

    const hasData = Object.values(entry).some(value => value !== "");

    if (hasData) {
      result.push(entry);
    }
  });

  return result;
}


// ==========================================
// 12. RESTORE REPEATING SECTION DATA
// ==========================================

function restoreRepeatedData(containerId, selector, savedData) {
  const container = document.getElementById(containerId);

  if (!container || !Array.isArray(savedData)) return;

  const firstItem = container.querySelector(selector);

  if (!firstItem) return;

  container.innerHTML = "";

  if (savedData.length === 0) {
    container.appendChild(firstItem);
    clearFields(firstItem);
    return;
  }

  savedData.forEach((savedItem, index) => {
    const newItem = index === 0
      ? firstItem
      : firstItem.cloneNode(true);

    clearFields(newItem);

    Object.entries(savedItem).forEach(([key, value]) => {
      const field = newItem.querySelector(`[name="${key}[]"]`);

      if (field) {
        field.value = value ?? "";
      }
    });

    container.appendChild(newItem);
  });
}


// ==========================================
// 13. LOAD PROFILE FROM FIRESTORE
// ==========================================

async function loadProfile(user) {
  try {
    const profileRef = doc(db, "users", user.uid);

    const snapshot = await getDoc(profileRef);

    if (!snapshot.exists()) return;

    const data = snapshot.data();

    const personalFields = [
      "phone",
      "location",
      "github",
      "linkedin",
      "personalWebsite",
      "professionalTitle",
      "about",
      "careerObjective"
    ];

    personalFields.forEach(field => {
      const element = document.getElementById(field);

      if (element && data[field] !== undefined) {
        element.value = data[field];
      }
    });

    // Name and email
    if (fullNameInput) {
      fullNameInput.value = data.fullName || user.displayName || "";
    }

    if (emailInput) {
      emailInput.value = user.email || "";
    }

    // Career status
    if (careerStatus) {
      careerStatus.value = data.careerStatus || "";
      toggleExperienceSection();
    }

    // Previously saved profile photo
    existingPhotoURL = data.photoURL || user.photoURL || "";

    if (existingPhotoURL) {
      displayPhoto(existingPhotoURL);
    }

    // Education
    restoreRepeatedData(
      "educationContainer",
      ".education-item",
      data.education || []
    );

    // Skills
    restoreRepeatedData(
      "skillsContainer",
      ".skill-item",
      data.skills || []
    );

    // Projects
    restoreRepeatedData(
      "projectsContainer",
      ".project-item",
      data.projects || []
    );

    // Certificates
    restoreRepeatedData(
      "certificatesContainer",
      ".certificate-item",
      data.certificates || []
    );

    // Experience
    restoreRepeatedData(
      "experienceContainer",
      ".experience-item",
      data.experience || []
    );

  } catch (error) {
    console.error("Profile loading error:", error);

    showMessage(
      error.message || "Unable to load your profile.",
      "error"
    );
  }
}


// ==========================================
// 14. SAVE PROFILE TO FIRESTORE
// ==========================================

if (profileForm) {
  profileForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!currentUser) {
      showMessage("Please login first.", "error");
      return;
    }

    try {
      if (saveProfileButton) {
        saveProfileButton.disabled = true;
        saveProfileButton.textContent = "Saving...";
      }

      showMessage("Saving your profile...", "success");

      // Collect all profile details.
      // Firebase Storage upload is not used.

      const profileData = {
        fullName: getFieldValue("fullName"),

        email: currentUser.email || "",

        phone: getFieldValue("phone"),
        location: getFieldValue("location"),

        // Keep an already-saved photo URL.
        photoURL: existingPhotoURL || "",

        github: getFieldValue("github"),
        linkedin: getFieldValue("linkedin"),
        personalWebsite: getFieldValue("personalWebsite"),

        professionalTitle: getFieldValue("professionalTitle"),
        about: getFieldValue("about"),
        careerObjective: getFieldValue("careerObjective"),

        careerStatus: careerStatus?.value || "",

        education: getRepeatedData(
          "educationContainer",
          ".education-item"
        ),

        skills: getRepeatedData(
          "skillsContainer",
          ".skill-item"
        ),

        projects: getRepeatedData(
          "projectsContainer",
          ".project-item"
        ),

        certificates: getRepeatedData(
          "certificatesContainer",
          ".certificate-item"
        ),

        experience: getRepeatedData(
          "experienceContainer",
          ".experience-item"
        ),

        updatedAt: serverTimestamp()
      };

      // Save profile to Firestore
      await setDoc(
        doc(db, "users", currentUser.uid),
        profileData,
        { merge: true }
      );

      // Update Firebase Authentication display name
      if (profileData.fullName) {
        await updateProfile(currentUser, {
          displayName: profileData.fullName
        });
      }

      showMessage(
        "Your profile has been saved successfully!",
        "success"
      );

    } catch (error) {
      console.error("Profile saving error:", error);

      showMessage(
        error.message || "Unable to save your profile.",
        "error"
      );

    } finally {
      if (saveProfileButton) {
        saveProfileButton.disabled = false;
        saveProfileButton.textContent = "Save Profile & Continue →";
      }
    }
  });
}


// ==========================================
// 15. CHECK AUTHENTICATION STATUS
// ==========================================

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.replace("login.html");
    return;
  }

  currentUser = user;

  // Automatically load login details
  if (fullNameInput) {
    fullNameInput.value = user.displayName || "";
  }

  if (emailInput) {
    emailInput.value = user.email || "";
  }

  // Existing Firebase profile picture
  existingPhotoURL = user.photoURL || "";

  if (existingPhotoURL) {
    displayPhoto(existingPhotoURL);
  }

  // Load previously saved profile
  await loadProfile(user);
});