
document.addEventListener("DOMContentLoaded", () => {

  const navigationLinks = document.querySelectorAll(
    '.nav-links a[href^="#"]'
  );

  navigationLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        event.preventDefault();

        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });


  const navbar = document.querySelector(".navbar");

  if (navbar) {
    const updateNavbar = () => {
      if (window.scrollY > 50) {
        navbar.classList.add("navbar-scrolled");
      } else {
        navbar.classList.remove("navbar-scrolled");
      }
    };

    window.addEventListener("scroll", updateNavbar, {
      passive: true
    });

    updateNavbar();
  }


  const cards = document.querySelectorAll(".feature-card");

  if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show-card");

            observerInstance.unobserve(entry.target);
          }
        });

      },
      {
        threshold: 0.15
      }
    );

    cards.forEach((card) => {
      card.classList.add("hidden-card");
      observer.observe(card);
    });

  } else {
    cards.forEach((card) => {
      card.classList.add("show-card");
    });
  }


  const footer = document.querySelector("footer");

  if (footer) {
    const copyright = footer.querySelector("p:last-child");

    if (copyright) {
      copyright.textContent =
        `© ${new Date().getFullYear()} CodeFolio AI. All rights reserved.`;
    }
  }


  console.log("CodeFolio AI landing page loaded successfully!");

});
