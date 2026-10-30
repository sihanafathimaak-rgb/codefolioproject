import {
  auth,
  db,
  doc,
  getDoc,
  onAuthStateChanged
} from "./firebase.js";

import JSZip from "https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm";


const downloadButton = document.getElementById("downloadButton");
const hostingButton = document.getElementById("hostingButton");

const paymentSection = document.getElementById("paymentSection");
const closePayment = document.getElementById("closePayment");
const demoPaymentButton = document.getElementById("demoPaymentButton");
const paymentStatus = document.getElementById("paymentStatus");

const linkSection = document.getElementById("linkSection");
const portfolioLink = document.getElementById("portfolioLink");
const copyLinkButton = document.getElementById("copyLinkButton");

const publishMessage = document.getElementById("publishMessage");

document.getElementById("currentYear").textContent =
  new Date().getFullYear();


let currentUser = null;
let profileData = null;


function showMessage(message, type = "info") {
  publishMessage.textContent = message;

  if (type === "error") {
    publishMessage.style.color = "#ff8585";
  } else if (type === "success") {
    publishMessage.style.color = "#69e2b0";
  } else {
    publishMessage.style.color = "#70dfff";
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

function safeURL(value) {
  if (!value) return "";

  try {
    const url = new URL(
      value.startsWith("http://") || value.startsWith("https://")
        ? value
        : `https://${value}`
    );

    if (!["https:", "http:"].includes(url.protocol)) {
      return "";
    }

    return url.href;
  } catch {
    return "";
  }
}

function createSlug(name) {
  return String(name || "my-portfolio")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "my-portfolio";
}


async function loadProfile(user) {
  try {
    const profileRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(profileRef);

    if (!snapshot.exists()) {
      showMessage(
        "Please complete and save your profile before publishing.",
        "error"
      );

      downloadButton.disabled = true;
      hostingButton.disabled = true;
      return;
    }

    profileData = snapshot.data();

    profileData.fullName =
      profileData.fullName || user.displayName || "My Portfolio";

    profileData.email =
      profileData.email || user.email || "";

    profileData.photoURL =
      profileData.photoURL || user.photoURL || "";

    showMessage("Your portfolio is ready to download.", "success");

  } catch (error) {
    console.error("Profile loading error:", error);

    showMessage(
      "Unable to load your profile. Please try again.",
      "error"
    );

    downloadButton.disabled = true;
    hostingButton.disabled = true;
  }
}


function getThemeColors(themeName) {
  const themes = {
    "pure-minimal": {
      background: "#10141d",
      text: "#f5f5f7",
      accent: "#b9c6d8",
      card: "#1a202b"
    },

    "midnight-pro": {
      background: "#080b18",
      text: "#f5f5f7",
      accent: "#65d9ff",
      card: "#151b31"
    },

    "creative-flow": {
      background: "#171020",
      text: "#fff4fa",
      accent: "#ff8acb",
      card: "#25182e"
    },

    "corporate-edge": {
      background: "#0b1422",
      text: "#f5f7ff",
      accent: "#72b7ff",
      card: "#17263a"
    },

    "blue-horizon": {
      background: "#071626",
      text: "#f2f8ff",
      accent: "#55c9ff",
      card: "#10283d"
    },

    "soft-editorial": {
      background: "#211d1a",
      text: "#fff7ed",
      accent: "#e4c6a8",
      card: "#332a24"
    },

    "violet-dreams": {
      background: "#130d24",
      text: "#f7f1ff",
      accent: "#c4a0ff",
      card: "#24183a"
    },

    "executive-white": {
      background: "#f2f4f8",
      text: "#172033",
      accent: "#315f9d",
      card: "#ffffff"
    }
  };

  return themes[themeName] || themes["midnight-pro"];
}


function buildPortfolioHTML(profile) {
  const theme = getThemeColors(profile.selectedTheme);
  const name = escapeHTML(profile.fullName);
  const title = escapeHTML(profile.professionalTitle || "");
  const location = escapeHTML(profile.location || "");
  const about = escapeHTML(profile.about || "");
  const objective = escapeHTML(profile.careerObjective || "");

  const photoURL = safeURL(profile.photoURL);

  const skillsHTML = (profile.skills || [])
    .filter(skill => skill.skillName?.trim())
    .map(skill => `
      <span class="skill">${escapeHTML(skill.skillName)}</span>
    `)
    .join("");

  const educationHTML = (profile.education || [])
    .filter(item => item.qualification || item.course || item.institution)
    .map(item => `
      <article class="card">
        <h3>${escapeHTML(item.course || item.qualification || "Education")}</h3>
        <p>${escapeHTML(item.qualification || "")}</p>
        <p>${escapeHTML(item.institution || "")}</p>
        <p>${escapeHTML(item.department || "")}</p>
        <p>${escapeHTML(
          [item.educationStart, item.graduationYear]
            .filter(Boolean).join(" - ")
        )}</p>
        <p>${escapeHTML(item.academicDetails || "")}</p>
      </article>
    `)
    .join("");

  const experienceHTML = (profile.experience || [])
    .filter(item => item.companyName || item.jobRole)
    .map(item => `
      <article class="card">
        <h3>${escapeHTML(item.jobRole || "Work Experience")}</h3>
        <p>${escapeHTML(item.companyName || "")}</p>
        <p>${escapeHTML(
          [item.jobStart, item.jobEnd].filter(Boolean).join(" - ")
        )}</p>
        <p>${escapeHTML(item.jobDescription || "")}</p>
      </article>
    `)
    .join("");

  const projectsHTML = (profile.projects || [])
    .filter(item => item.projectName || item.projectDescription)
    .map(item => {
      const github = safeURL(item.projectGithub);
      const live = safeURL(item.projectLive);

      return `
        <article class="card">
          <h3>${escapeHTML(item.projectName || "Project")}</h3>
          <p>${escapeHTML(item.projectDescription || "")}</p>
          <p>${escapeHTML(item.projectTechnologies || "")}</p>

          <div class="links">
            ${github ? `<a href="${escapeHTML(github)}" target="_blank" rel="noopener noreferrer">GitHub</a>` : ""}
            ${live ? `<a href="${escapeHTML(live)}" target="_blank" rel="noopener noreferrer">Live Demo</a>` : ""}
          </div>
        </article>
      `;
    })
    .join("");

  const certificatesHTML = (profile.certificates || [])
    .filter(item => item.certificateName)
    .map(item => {
      const certificateURL = safeURL(item.certificateLink);

      return `
        <article class="card">
          <h3>${escapeHTML(item.certificateName)}</h3>
          <p>${escapeHTML(item.certificateIssuer || "")}</p>
          <p>${escapeHTML(item.certificateYear || "")}</p>
          ${
            certificateURL
              ? `<a href="${escapeHTML(certificateURL)}" target="_blank" rel="noopener noreferrer">View Certificate</a>`
              : ""
          }
        </article>
      `;
    })
    .join("");

  const contactHTML = `
    ${profile.email ? `<a href="mailto:${escapeHTML(profile.email)}">${escapeHTML(profile.email)}</a>` : ""}
    ${profile.phone ? `<a href="tel:${escapeHTML(String(profile.phone).replace(/[^\d+]/g, ""))}">${escapeHTML(profile.phone)}</a>` : ""}
    ${safeURL(profile.github) ? `<a href="${escapeHTML(safeURL(profile.github))}" target="_blank" rel="noopener noreferrer">GitHub</a>` : ""}
    ${safeURL(profile.linkedin) ? `<a href="${escapeHTML(safeURL(profile.linkedin))}" target="_blank" rel="noopener noreferrer">LinkedIn</a>` : ""}
    ${safeURL(profile.personalWebsite) ? `<a href="${escapeHTML(safeURL(profile.personalWebsite))}" target="_blank" rel="noopener noreferrer">Website</a>` : ""}
  `;

  const hasContact = Boolean(contactHTML.trim());

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} | Portfolio</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <header class="header">
    <a href="#home" class="brand">${name}</a>
    <nav>
      <a href="#about">About</a>
      <a href="#skills">Skills</a>
      <a href="#education">Education</a>
      <a href="#projects">Projects</a>
      ${hasContact ? '<a href="#contact">Contact</a>' : ""}
    </nav>
  </header>

  <main>

    <section class="hero" id="home">
      <div class="hero-content">
        <p class="eyebrow">HELLO, I'M</p>
        <h1>${name}</h1>
        ${title ? `<h2>${title}</h2>` : ""}
        ${location ? `<p class="location">${location}</p>` : ""}
        <a class="button" href="#projects">Explore My Work</a>
      </div>

      ${photoURL ? `<img class="profile-photo" src="${escapeHTML(photoURL)}" alt="Profile photo">` : ""}
    </section>

    ${about ? `
      <section class="section" id="about">
        <p class="eyebrow">GET TO KNOW ME</p>
        <h2>About Me</h2>
        <p>${about}</p>
      </section>
    ` : ""}

    ${objective ? `
      <section class="section">
        <p class="eyebrow">MY GOAL</p>
        <h2>Career Objective</h2>
        <p>${objective}</p>
      </section>
    ` : ""}

    ${skillsHTML ? `
      <section class="section" id="skills">
        <p class="eyebrow">WHAT I KNOW</p>
        <h2>My Skills</h2>
        <div class="skills">${skillsHTML}</div>
      </section>
    ` : ""}

    ${educationHTML ? `
      <section class="section" id="education">
        <p class="eyebrow">MY BACKGROUND</p>
        <h2>Education</h2>
        <div class="grid">${educationHTML}</div>
      </section>
    ` : ""}

    ${experienceHTML ? `
      <section class="section">
        <p class="eyebrow">MY JOURNEY</p>
        <h2>Work Experience</h2>
        <div class="grid">${experienceHTML}</div>
      </section>
    ` : ""}

    ${projectsHTML ? `
      <section class="section" id="projects">
        <p class="eyebrow">WHAT I'VE BUILT</p>
        <h2>My Projects</h2>
        <div class="grid">${projectsHTML}</div>
      </section>
    ` : ""}

    ${certificatesHTML ? `
      <section class="section">
        <p class="eyebrow">MY ACHIEVEMENTS</p>
        <h2>Certificates</h2>
        <div class="grid">${certificatesHTML}</div>
      </section>
    ` : ""}

    ${hasContact ? `
      <section class="section contact" id="contact">
        <p class="eyebrow">LET'S CONNECT</p>
        <h2>Contact Me</h2>
        <div class="links">${contactHTML}</div>
      </section>
    ` : ""}

  </main>

  <footer>
    <p>© ${new Date().getFullYear()} ${name}</p>
    <p>Created with CodeFolio AI</p>
  </footer>

</body>
</html>`;
}


function buildPortfolioCSS(profile) {
  const theme = getThemeColors(profile.selectedTheme);

  return `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: "Segoe UI", Arial, sans-serif;
  background: ${theme.background};
  color: ${theme.text};
  line-height: 1.7;
}

.header {
  padding: 22px 8%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  border-bottom: 1px solid ${theme.accent}33;
}

.brand {
  font-size: 22px;
  font-weight: 800;
  color: ${theme.text};
  text-decoration: none;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

nav a {
  color: ${theme.text};
  text-decoration: none;
  font-size: 14px;
}

nav a:hover,
.links a:hover {
  color: ${theme.accent};
}

.hero {
  min-height: 520px;
  padding: 80px 10%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  flex-wrap: wrap;
}

.hero-content {
  flex: 1;
  min-width: 250px;
}

.eyebrow {
  color: ${theme.accent};
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 3px;
  margin-bottom: 12px;
}

h1 {
  font-size: clamp(38px, 7vw, 65px);
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.hero h2 {
  color: ${theme.accent};
  font-size: 24px;
  margin-top: 12px;
}

.location {
  color: ${theme.text};
  opacity: 0.7;
  margin-top: 10px;
}

.profile-photo {
  width: 250px;
  height: 250px;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid ${theme.accent};
}

.button {
  display: inline-block;
  margin-top: 25px;
  padding: 12px 22px;
  color: ${theme.background};
  background: ${theme.accent};
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
}

.section {
  padding: 65px 10%;
  border-top: 1px solid ${theme.accent}33;
}

.section h2 {
  font-size: 32px;
  margin-bottom: 22px;
}

.section p:not(.eyebrow) {
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.skills,
.links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.skill {
  padding: 9px 16px;
  border: 1px solid ${theme.accent};
  border-radius: 30px;
  color: ${theme.accent};
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.card {
  padding: 22px;
  background: ${theme.card};
  border: 1px solid ${theme.accent}55;
  border-radius: 12px;
  overflow-wrap: anywhere;
}

.card h3 {
  margin-bottom: 10px;
}

.card p {
  margin-top: 7px;
  opacity: 0.8;
}

.card a,
.links a {
  color: ${theme.accent};
  text-decoration: none;
  overflow-wrap: anywhere;
}

.contact {
  text-align: center;
}

.contact .links {
  justify-content: center;
}

footer {
  text-align: center;
  padding: 25px;
  border-top: 1px solid ${theme.accent}33;
  opacity: 0.7;
  font-size: 13px;
}

@media (max-width: 700px) {
  .header {
    flex-direction: column;
  }

  nav {
    justify-content: center;
    gap: 13px;
  }

  .hero {
    flex-direction: column-reverse;
    text-align: center;
    padding: 55px 7%;
  }

  .profile-photo {
    width: 190px;
    height: 190px;
  }

  .section {
    padding: 50px 7%;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
`;
}


async function downloadPortfolio() {
  if (!profileData) {
    showMessage("Your profile is not ready yet.", "error");
    return;
  }

  try {
    downloadButton.disabled = true;
    downloadButton.textContent = "Preparing ZIP...";

    const zip = new JSZip();

    const html = buildPortfolioHTML(profileData);
    const css = buildPortfolioCSS(profileData);

    zip.file("index.html", html);
    zip.file("style.css", css);

    zip.file(
      "profile-data.json",
      JSON.stringify(profileData, null, 2)
    );

    zip.file(
      "README.txt",
      `CODEFOLIO AI PORTFOLIO

Thank you for using CodeFolio AI!

HOW TO OPEN YOUR PORTFOLIO:

1. Extract this ZIP file.
2. Open the extracted folder.
3. Double-click index.html to view your portfolio.
4. Keep index.html and style.css in the same folder.

NOTE:
Your profile photo uses its saved online image URL,
so an internet connection may be needed to display it.

To make your portfolio available online, upload the
extracted files to a hosting provider.

Generated by CodeFolio AI.
`
    );

    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6
      }
    });

    const downloadURL = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");

    link.href = downloadURL;
    link.download = `${createSlug(profileData.fullName)}-portfolio.zip`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(downloadURL), 1000);

    showMessage("Your portfolio ZIP is ready!", "success");

  } catch (error) {
    console.error("Portfolio download error:", error);

    showMessage(
      "Unable to create your ZIP. Please try again.",
      "error"
    );

  } finally {
    downloadButton.disabled = false;
    downloadButton.innerHTML = "<span>↓</span> Download Portfolio";
  }
}

downloadButton.addEventListener("click", downloadPortfolio);


hostingButton.addEventListener("click", () => {
  if (!profileData) {
    showMessage("Please save your profile first.", "error");
    return;
  }

  paymentSection.hidden = false;
  linkSection.hidden = true;

  paymentSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  paymentStatus.textContent = "Waiting for payment";
});


closePayment.addEventListener("click", () => {
  paymentSection.hidden = true;
  linkSection.hidden = true;
});


demoPaymentButton.addEventListener("click", () => {
  if (!profileData) return;


  const slug = createSlug(profileData.fullName);

  const sampleURL = `https://${slug}.codefolioai.com`;

  paymentStatus.textContent = "Demo completed - no real payment";

  portfolioLink.textContent = sampleURL;

  paymentSection.hidden = true;
  linkSection.hidden = false;

  showMessage(
    "Demo completed. Hosting has NOT been activated.",
    "info"
  );

  linkSection.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
});


copyLinkButton.addEventListener("click", async () => {
  const text = portfolioLink.textContent;

  try {
    await navigator.clipboard.writeText(text);

    copyLinkButton.textContent = "Copied!";

    setTimeout(() => {
      copyLinkButton.textContent = "Copy";
    }, 1800);

  } catch (error) {
    console.error("Copy error:", error);

    showMessage(
      "Unable to copy automatically. Please select and copy the link.",
      "error"
    );
  }
});


onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;

  await loadProfile(currentUser);
});
