import {
  auth,
  db,
  doc,
  getDoc,
  onAuthStateChanged
} from "./firebase.js";

// =====================================
// DOM ELEMENTS
// =====================================

const portfolioRoot = document.getElementById("portfolioRoot");

const elements = {
  name: document.getElementById("portfolioName"),
  title: document.getElementById("portfolioTitle"),
  subtitle: document.getElementById("portfolioSubtitle"),
  greeting: document.getElementById("portfolioGreeting"),
  location: document.getElementById("portfolioLocation"),

  photo: document.getElementById("portfolioPhoto"),
  photoWrapper: document.getElementById("portfolioPhotoWrapper"),

  aboutSection: document.getElementById("portfolioAboutSection"),
  about: document.getElementById("portfolioAbout"),

  objectiveSection: document.getElementById("portfolioObjectiveSection"),
  objective: document.getElementById("portfolioObjective"),

  skillsSection: document.getElementById("portfolioSkillsSection"),
  skills: document.getElementById("portfolioSkills"),

  educationSection: document.getElementById("portfolioEducationSection"),
  education: document.getElementById("portfolioEducation"),

  experienceSection: document.getElementById("portfolioExperienceSection"),
  experience: document.getElementById("portfolioExperience"),

  projectsSection: document.getElementById("portfolioProjectsSection"),
  projects: document.getElementById("portfolioProjects"),

  certificatesSection: document.getElementById("portfolioCertificatesSection"),
  certificates: document.getElementById("portfolioCertificates"),

  contactSection: document.getElementById("portfolioContactSection"),
  email: document.getElementById("portfolioEmail"),
  phone: document.getElementById("portfolioPhone"),
  github: document.getElementById("portfolioGithub"),
  linkedin: document.getElementById("portfolioLinkedin"),
  website: document.getElementById("portfolioWebsite"),

  footerName: document.getElementById("portfolioFooterName"),
  footerYear: document.getElementById("portfolioFooterYear")
};

// =====================================
// HELPER FUNCTIONS
// =====================================

function setText(element, value) {
  if (!element) return;

  element.textContent = value || "";
}

function hideSection(section, shouldHide) {
  if (section) {
    section.hidden = shouldHide;
  }
}

function createElement(tag, className, text = "") {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  element.textContent = text;

  return element;
}

function validExternalURL(value) {
  if (!value) return "";

  try {
    const url = new URL(
      value.startsWith("http://") || value.startsWith("https://")
        ? value
        : `https://${value}`
    );

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return "";
    }

    return url.href;
  } catch {
    return "";
  }
}

// =====================================
// PROFILE PHOTO
// =====================================

function displayPhoto(photoURL) {
  if (!photoURL) {
    elements.photoWrapper.hidden = true;
    return;
  }

  elements.photo.src = photoURL;
  elements.photo.alt = "Profile photo";

  elements.photo.onerror = () => {
    elements.photoWrapper.hidden = true;
  };

  elements.photoWrapper.hidden = false;
}

// =====================================
// SOCIAL LINKS
// =====================================

function setLink(element, value, label) {
  if (!element) return false;

  const url = validExternalURL(value);

  if (!url) {
    element.hidden = true;
    return false;
  }

  element.href = url;
  element.textContent = label;
  element.hidden = false;

  return true;
}

function displayContact(profile) {
  let hasContact = false;

  if (profile.email) {
    elements.email.href = `mailto:${profile.email}`;
    elements.email.textContent = profile.email;
    elements.email.hidden = false;
    hasContact = true;
  } else {
    elements.email.hidden = true;
  }

  if (profile.phone) {
    const phone = String(profile.phone).trim();

    elements.phone.href = `tel:${phone.replace(/[^\d+]/g, "")}`;
    elements.phone.textContent = phone;
    elements.phone.hidden = false;
    hasContact = true;
  } else {
    elements.phone.hidden = true;
  }

  hasContact = setLink(
    elements.github,
    profile.github,
    "GitHub"
  ) || hasContact;

  hasContact = setLink(
    elements.linkedin,
    profile.linkedin,
    "LinkedIn"
  ) || hasContact;

  hasContact = setLink(
    elements.website,
    profile.personalWebsite,
    "Personal Website"
  ) || hasContact;

  hideSection(elements.contactSection, !hasContact);
}

// =====================================
// SKILLS
// =====================================

function displaySkills(skills) {
  elements.skills.innerHTML = "";

  if (!Array.isArray(skills) || skills.length === 0) {
    hideSection(elements.skillsSection, true);
    return;
  }

  let count = 0;

  skills.forEach(skill => {
    const name = skill.skillName?.trim();

    if (!name) return;

    const tag = createElement("span", "skill-tag", name);

    elements.skills.appendChild(tag);
    count++;
  });

  hideSection(elements.skillsSection, count === 0);
}

// =====================================
// EDUCATION
// =====================================

function displayEducation(education) {
  elements.education.innerHTML = "";

  if (!Array.isArray(education)) {
    hideSection(elements.educationSection, true);
    return;
  }

  let count = 0;

  education.forEach(item => {
    if (!item.qualification && !item.course && !item.institution) {
      return;
    }

    const card = createElement("div", "timeline-card");

    const heading = createElement(
      "h3",
      "",
      item.course || item.qualification || "Education"
    );

    const qualification = createElement(
      "p",
      "",
      item.qualification || ""
    );

    const institution = createElement(
      "p",
      "",
      item.institution || ""
    );

    const department = createElement(
      "p",
      "",
      item.department || ""
    );

    const years = [
      item.educationStart,
      item.graduationYear
    ].filter(Boolean).join(" - ");

    const yearText = createElement("p", "", years);

    const details = createElement(
      "p",
      "",
      item.academicDetails || ""
    );

    card.append(
      heading,
      qualification,
      institution,
      department,
      yearText,
      details
    );

    elements.education.appendChild(card);
    count++;
  });

  hideSection(elements.educationSection, count === 0);
}

// =====================================
// WORK EXPERIENCE
// =====================================

function displayExperience(experience) {
  elements.experience.innerHTML = "";

  if (!Array.isArray(experience)) {
    hideSection(elements.experienceSection, true);
    return;
  }

  let count = 0;

  experience.forEach(item => {
    if (!item.companyName && !item.jobRole) return;

    const card = createElement("div", "timeline-card");

    const heading = createElement(
      "h3",
      "",
      item.jobRole || "Work Experience"
    );

    const company = createElement(
      "p",
      "",
      item.companyName || ""
    );

    const years = [
      item.jobStart,
      item.jobEnd
    ].filter(Boolean).join(" - ");

    const dates = createElement("p", "", years);

    const description = createElement(
      "p",
      "",
      item.jobDescription || ""
    );

    card.append(heading, company, dates, description);

    elements.experience.appendChild(card);
    count++;
  });

  hideSection(elements.experienceSection, count === 0);
}

// =====================================
// PROJECTS
// =====================================

function displayProjects(projects) {
  elements.projects.innerHTML = "";

  if (!Array.isArray(projects)) {
    hideSection(elements.projectsSection, true);
    return;
  }

  let count = 0;

  projects.forEach(project => {
    if (!project.projectName && !project.projectDescription) {
      return;
    }

    const card = createElement("article", "project-card");

    const heading = createElement(
      "h3",
      "",
      project.projectName || "Project"
    );

    const description = createElement(
      "p",
      "",
      project.projectDescription || ""
    );

    const technologies = createElement(
      "p",
      "",
      project.projectTechnologies || ""
    );

    const links = createElement("div", "project-links");

    const githubURL = validExternalURL(project.projectGithub);
    const liveURL = validExternalURL(project.projectLive);

    if (githubURL) {
      const githubLink = createElement("a", "", "GitHub");
      githubLink.href = githubURL;
      githubLink.target = "_blank";
      githubLink.rel = "noopener noreferrer";
      links.appendChild(githubLink);
    }

    if (liveURL) {
      const liveLink = createElement("a", "", "Live Demo");
      liveLink.href = liveURL;
      liveLink.target = "_blank";
      liveLink.rel = "noopener noreferrer";
      links.appendChild(liveLink);
    }

    card.append(heading, description);

    if (project.projectTechnologies) {
      card.appendChild(technologies);
    }

    if (links.children.length > 0) {
      card.appendChild(links);
    }

    elements.projects.appendChild(card);
    count++;
  });

  hideSection(elements.projectsSection, count === 0);
}

// =====================================
// CERTIFICATES
// =====================================

function displayCertificates(certificates) {
  elements.certificates.innerHTML = "";

  if (!Array.isArray(certificates)) {
    hideSection(elements.certificatesSection, true);
    return;
  }

  let count = 0;

  certificates.forEach(certificate => {
    if (!certificate.certificateName) return;

    const card = createElement(
      "article",
      "certificate-card"
    );

    const heading = createElement(
      "h3",
      "",
      certificate.certificateName
    );

    const issuer = createElement(
      "p",
      "",
      certificate.certificateIssuer || ""
    );

    const year = createElement(
      "p",
      "",
      certificate.certificateYear || ""
    );

    card.append(heading, issuer, year);

    const certificateURL = validExternalURL(
      certificate.certificateLink
    );

    if (certificateURL) {
      const link = createElement(
        "a",
        "certificate-link",
        "View Certificate"
      );

      link.href = certificateURL;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      card.appendChild(link);
    }

    elements.certificates.appendChild(card);
    count++;
  });

  hideSection(elements.certificatesSection, count === 0);
}

// =====================================
// SELECTED THEME
// =====================================

function applyTheme(themeName) {
  if (!themeName) return;

  const themes = {
    "pure-minimal": {
      accent: "#b9c6d8",
      background: "#10141d"
    },
    "midnight-pro": {
      accent: "#65d9ff",
      background: "#080b18"
    },
    "creative-flow": {
      accent: "#ff8acb",
      background: "#171020"
    },
    "corporate-edge": {
      accent: "#72b7ff",
      background: "#0b1422"
    },
    "blue-horizon": {
      accent: "#55c9ff",
      background: "#071626"
    },
    "soft-editorial": {
      accent: "#e4c6a8",
      background: "#211d1a"
    },
    "violet-dreams": {
      accent: "#c4a0ff",
      background: "#130d24"
    },
    "executive-white": {
      accent: "#315f9d",
      background: "#f2f4f8"
    }
  };

  const selected = themes[themeName];

  if (!selected) return;

  const style = document.createElement("style");

  style.textContent = `
    body {
      background: ${selected.background};
    }

    .hero-greeting,
    .section-label,
    #portfolioNav a:hover {
      color: ${selected.accent};
    }

    .hero-photo-wrapper {
      border-color: ${selected.accent};
    }

    .primary-button {
      background: ${selected.accent};
    }

    .skill-tag {
      border-color: ${selected.accent};
    }

    .timeline-card {
      border-left-color: ${selected.accent};
    }

    .project-links a {
      color: ${selected.accent};
    }

    .portfolio[data-theme="executive-white"] {
      color: #172033;
    }

    body:has(.portfolio[data-theme="executive-white"]) {
      color: #172033;
    }

    .portfolio[data-theme="executive-white"] .portfolio-header,
    .portfolio[data-theme="executive-white"] .portfolio-section,
    .portfolio[data-theme="executive-white"] .portfolio-footer {
      border-color: rgba(20, 35, 60, 0.15);
    }

    .portfolio[data-theme="executive-white"] .brand-name,
    .portfolio[data-theme="executive-white"] .hero-content h1,
    .portfolio[data-theme="executive-white"] .portfolio-section h2 {
      color: #172033;
    }

    .portfolio[data-theme="executive-white"] .hero-content h2,
    .portfolio[data-theme="executive-white"] .portfolio-section > p:not(.section-label),
    .portfolio[data-theme="executive-white"] .timeline-card p,
    .portfolio[data-theme="executive-white"] .project-card p,
    .portfolio[data-theme="executive-white"] .certificate-card p {
      color: #526078;
    }

    .portfolio[data-theme="executive-white"] #portfolioNav a,
    .portfolio[data-theme="executive-white"] .portfolio-footer {
      color: #526078;
    }

    .portfolio[data-theme="executive-white"] .timeline-card,
    .portfolio[data-theme="executive-white"] .project-card,
    .portfolio[data-theme="executive-white"] .certificate-card {
      background: #fff;
      border-color: #dce2eb;
    }

    .portfolio[data-theme="executive-white"] .skill-tag {
      color: #234d80;
      background: #e8eff9;
    }

    .portfolio[data-theme="executive-white"] .contact-details a {
      color: #234d80;
      border-color: #cbd8e9;
    }
  `;

  document.head.appendChild(style);
  portfolioRoot.dataset.theme = themeName;
}

// =====================================
// DISPLAY PROFILE
// =====================================

function displayProfile(profile) {
  const name = profile.fullName || "My Portfolio";

  setText(elements.name, name);
  setText(elements.title, name);
  setText(
    elements.subtitle,
    profile.professionalTitle || ""
  );

  setText(
    elements.greeting,
    profile.professionalTitle ? "HELLO, I'M" : "WELCOME TO MY PORTFOLIO"
  );

  setText(elements.location, profile.location || "");

  setText(elements.about, profile.about || "");
  hideSection(
    elements.aboutSection,
    !profile.about?.trim()
  );

  setText(
    elements.objective,
    profile.careerObjective || ""
  );

  hideSection(
    elements.objectiveSection,
    !profile.careerObjective?.trim()
  );

  displayPhoto(profile.photoURL);

  displaySkills(profile.skills);
  displayEducation(profile.education);
  displayExperience(profile.experience);
  displayProjects(profile.projects);
  displayCertificates(profile.certificates);
  displayContact(profile);

  setText(elements.footerName, name);
  setText(elements.footerYear, new Date().getFullYear());

  applyTheme(profile.selectedTheme);
}

// =====================================
// LOAD PROFILE FROM FIRESTORE
// =====================================

async function loadPortfolio(user) {
  try {
    const profileRef = doc(db, "users", user.uid);
    const profileSnapshot = await getDoc(profileRef);

    if (!profileSnapshot.exists()) {
      portfolioRoot.innerHTML = `
        <div style="text-align:center; padding:100px 20px;">
          <h2>Profile not found</h2>
          <p>Please complete your profile before viewing your portfolio.</p>
          <a href="profile.html">Complete Profile</a>
        </div>
      `;
      return;
    }

    const profile = profileSnapshot.data();

    displayProfile({
      ...profile,
      fullName: profile.fullName || user.displayName || "",
      email: profile.email || user.email || "",
      photoURL: profile.photoURL || user.photoURL || ""
    });

  } catch (error) {
    console.error("Portfolio loading error:", error);

    portfolioRoot.innerHTML = `
      <div style="text-align:center; padding:100px 20px;">
        <h2>Unable to load portfolio</h2>
        <p>Please check your internet connection and try again.</p>
      </div>
    `;
  }
}

// =====================================
// AUTHENTICATION CHECK
// =====================================

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  loadPortfolio(user);
});