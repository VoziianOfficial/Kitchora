(function () {
    "use strict";

    const config = window.KITCHORA_CONFIG || {};

    function getConfigValue(path, fallback = "") {
        if (window.KitchoraGlobal && typeof window.KitchoraGlobal.getConfigValue === "function") {
            return window.KitchoraGlobal.getConfigValue(path, fallback);
        }

        return path.split(".").reduce((source, key) => {
            if (source && Object.prototype.hasOwnProperty.call(source, key)) {
                return source[key];
            }

            return undefined;
        }, config) ?? fallback;
    }

    function initializeAboutHeroNav() {
        const links = document.querySelectorAll(".about-hero__nav a[href^='#']");

        links.forEach((link) => {
            link.addEventListener("click", (event) => {
                const targetSelector = link.getAttribute("href");
                const target = document.querySelector(targetSelector);

                if (!target) {
                    return;
                }

                event.preventDefault();

                const header = document.querySelector("[data-site-header]");
                const offset = header ? header.offsetHeight + 18 : 24;

                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.scrollY - offset,
                    behavior: "smooth"
                });
            });
        });
    }

    function initializeAboutPrincipleHover() {
        const cards = document.querySelectorAll(".value-card, .principle-card, .about-value-card");

        cards.forEach((card, index) => {
            card.style.setProperty("--principle-index", String(index));

            card.addEventListener("mouseenter", () => {
                cards.forEach((item) => {
                    if (item !== card) {
                        item.classList.add("is-softened");
                    }
                });
            });

            card.addEventListener("mouseleave", () => {
                cards.forEach((item) => item.classList.remove("is-softened"));
            });
        });
    }

    function initializeAboutStepProgress() {
        const steps = document.querySelectorAll(".about-step, .about-process__step, .platform-step");

        if (!steps.length || !("IntersectionObserver" in window)) {
            steps.forEach((step) => step.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.28,
                rootMargin: "0px 0px -8% 0px"
            }
        );

        steps.forEach((step) => observer.observe(step));
    }

    function initializeAboutMetaCards() {
        const cards = document.querySelectorAll(
            ".about-intro__meta article, .about-platform__meta article, .about-story__meta article"
        );

        cards.forEach((card, index) => {
            card.style.setProperty("--meta-index", String(index));
        });
    }

    function initializeAboutFAQSchema() {
        const faqSection = document.querySelector(".about-faq");

        if (!faqSection) {
            return;
        }

        const items = Array.from(faqSection.querySelectorAll(".accordion__item"));
        const faqEntities = [];

        items.forEach((item) => {
            const questionElement = item.querySelector(".accordion__button span, .accordion__button");
            const answerElement = item.querySelector(".accordion__content p");

            if (!questionElement || !answerElement) {
                return;
            }

            const question = questionElement.textContent.trim();
            const answer = answerElement.textContent.trim();

            if (!question || !answer) {
                return;
            }

            faqEntities.push({
                "@type": "Question",
                "name": question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": answer
                }
            });
        });

        if (!faqEntities.length) {
            return;
        }

        const existing = document.querySelector('script[data-about-faq-schema="true"]');

        if (existing) {
            return;
        }

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-about-faq-schema", "true");
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqEntities
        });

        document.head.appendChild(script);
    }

    function initializeAboutPageSchema() {
        const existing = document.querySelector('script[data-about-schema="true"]');

        if (existing) {
            return;
        }

        const brandName = getConfigValue("brand.name", "Kitchora");
        const companyName = getConfigValue("company.name", "Kitchora Matching Group LLC");
        const email = getConfigValue("contact.email", "hello@kitchora.com");
        const phone = getConfigValue("contact.phoneDisplay", "+1 (555) 019-2744");
        const address = getConfigValue("company.address", "1200 Olive Market Lane, Suite 210, Portland, OR 97205");

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-about-schema", "true");
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": brandName,
            "legalName": companyName,
            "description": "Independent kitchen remodelling provider-matching platform helping homeowners organize project details before comparing local provider options.",
            "email": email,
            "telephone": phone,
            "address": address,
            "url": window.location.href,
            "sameAs": []
        });

        document.head.appendChild(script);
    }

    function initializeAboutMediaTilt() {
        const mediaBlocks = document.querySelectorAll(
            ".about-intro__media, .about-platform__media, .about-story__media, .about-steps__media, .about-process__media, .platform-steps__media"
        );

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const isSmallScreen = window.innerWidth <= 980;

        if (reduceMotion || isSmallScreen) {
            return;
        }

        mediaBlocks.forEach((media) => {
            media.addEventListener("mousemove", (event) => {
                const rect = media.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;

                media.style.transform = `perspective(900px) rotateX(${(-y * 2).toFixed(2)}deg) rotateY(${(x * 2).toFixed(2)}deg)`;
            });

            media.addEventListener("mouseleave", () => {
                media.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
            });
        });
    }

    function initializeAboutRows() {
        const rows = document.querySelectorAll(
            ".about-compare__row, .about-safety__row, .about-clarity__row, .about-mission__item, .platform-model__item, .about-model__item"
        );

        rows.forEach((row, index) => {
            row.style.setProperty("--row-index", String(index));
        });
    }

    function refreshAfterInit() {
        if (window.KitchoraGlobal && typeof window.KitchoraGlobal.initializeIcons === "function") {
            window.KitchoraGlobal.initializeIcons();
        }

        if (window.AOS && typeof window.AOS.refresh === "function") {
            window.setTimeout(() => window.AOS.refresh(), 260);
        }
    }

    function init() {
        initializeAboutHeroNav();
        initializeAboutPrincipleHover();
        initializeAboutStepProgress();
        initializeAboutMetaCards();
        initializeAboutFAQSchema();
        initializeAboutPageSchema();
        initializeAboutMediaTilt();
        initializeAboutRows();
        refreshAfterInit();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();