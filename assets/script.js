const revealElements = document.querySelectorAll(".reveal");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reduceMotion) {
  revealElements.forEach((element) => element.classList.add("in-view"));
} else {
  const observer = new IntersectionObserver(
    (entries, target) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          target.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 40, 220)}ms`;
    observer.observe(element);
  });
}

const heroParallax = document.querySelector("[data-parallax] img");

if (heroParallax && !reduceMotion) {
  let ticking = false;

  const updateParallax = () => {
    const scrollY = window.scrollY;
    const offset = Math.min(scrollY * 0.08, 18);
    heroParallax.style.transform = `scale(1.02) translateY(${offset}px)`;
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    },
    { passive: true }
  );
}

// Header subtle behavior (shadow / density) on scroll
const header = document.querySelector(".site-header");
if (header) {
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;

    window.requestAnimationFrame(() => {
      const scrolled = window.scrollY > 8;
      header.classList.toggle("scrolled", scrolled);
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// Contact form validation (front-only)
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  const successEl = document.getElementById("contact-success");
  const globalErrorEl = document.getElementById("form-global-error");

  const isEmailValid = (value) => {
    const v = value.trim();
    // Practical email check (no backend, keep it simple & fast)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  };

  const getFieldErrorEl = (inputEl) => {
    const wrapper = inputEl.closest(".form-field");
    return wrapper ? wrapper.querySelector(".field-error") : null;
  };

  const setFieldInvalid = (inputEl, message) => {
    const wrapper = inputEl.closest(".form-field");
    const errorEl = getFieldErrorEl(inputEl);
    if (!wrapper || !errorEl) return;

    wrapper.classList.toggle("invalid", Boolean(message));
    errorEl.textContent = message || "";
  };

  const clearFieldInvalid = (inputEl) => setFieldInvalid(inputEl, "");

  const validate = () => {
    let ok = true;
    globalErrorEl.textContent = "";

    const nom = document.getElementById("nom");
    const prenom = document.getElementById("prenom");
    const email = document.getElementById("email");
    const telephone = document.getElementById("telephone");
    const sujet = document.getElementById("sujet");
    const message = document.getElementById("message");

    const checks = [
      { el: nom, test: () => nom.value.trim().length > 0, msg: "Veuillez renseigner votre nom." },
      { el: prenom, test: () => prenom.value.trim().length > 0, msg: "Veuillez renseigner votre prénom." },
      { el: email, test: () => isEmailValid(email.value), msg: "Veuillez renseigner une adresse e-mail valide." },
      { el: telephone, test: () => telephone.value.trim().length > 0, msg: "Veuillez renseigner votre téléphone." },
      { el: sujet, test: () => sujet.value.trim().length > 0, msg: "Veuillez renseigner le sujet." },
      { el: message, test: () => message.value.trim().length > 0, msg: "Veuillez écrire votre message." },
    ];

    for (const c of checks) {
      if (!c.test()) {
        ok = false;
        setFieldInvalid(c.el, c.msg);
      } else {
        clearFieldInvalid(c.el);
      }
    }

    return ok;
  };

  // Live validation micro-interactions
  const inputs = contactForm.querySelectorAll("input, textarea");
  inputs.forEach((el) => {
    el.addEventListener("input", () => {
      const hasValue = el.value.trim().length > 0;
      if (el.id === "email") {
        setFieldInvalid(el, isEmailValid(el.value) ? "" : "Veuillez renseigner une adresse e-mail valide.");
        return;
      }

      setFieldInvalid(el, hasValue ? "" : "Veuillez renseigner ce champ.");
    });
  });

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) {
      globalErrorEl.textContent = "Certains champs sont invalides. Veuillez vérifier le formulaire.";
      // Keep success hidden on error
      successEl.classList.remove("show");
      return;
    }

    // Front-only "submission"
    successEl.classList.add("show");
    contactForm.reset();

    // Auto-hide message for a cleaner experience
    window.setTimeout(() => {
      successEl.classList.remove("show");
    }, 6500);
  });
}
