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

    function initializeHeroSlider() {
        const sliders = document.querySelectorAll("[data-home-hero-slider], .hero-slider, .home-hero__slider");

        sliders.forEach((slider) => {
            const slides = Array.from(slider.querySelectorAll("[data-hero-slide], .hero-slide, .home-hero__slide"));

            if (slides.length <= 1) {
                return;
            }

            let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));

            if (activeIndex < 0) {
                activeIndex = 0;
                slides[0].classList.add("is-active");
            }

            const dotsContainer = slider.querySelector("[data-hero-slider-dots], .hero-slider__dots, .home-hero__slider-dots");
            const dots = [];

            if (dotsContainer && !dotsContainer.children.length) {
                slides.forEach((_, index) => {
                    const dot = document.createElement("button");
                    dot.type = "button";
                    dot.setAttribute("aria-label", `Show kitchen inspiration slide ${index + 1}`);

                    if (index === activeIndex) {
                        dot.classList.add("is-active");
                    }

                    dotsContainer.appendChild(dot);
                    dots.push(dot);
                });
            } else if (dotsContainer) {
                dots.push(...Array.from(dotsContainer.querySelectorAll("button")));
            }

            function showSlide(index) {
                activeIndex = (index + slides.length) % slides.length;

                slides.forEach((slide, slideIndex) => {
                    slide.classList.toggle("is-active", slideIndex === activeIndex);
                });

                dots.forEach((dot, dotIndex) => {
                    dot.classList.toggle("is-active", dotIndex === activeIndex);
                });
            }

            dots.forEach((dot, index) => {
                dot.addEventListener("click", () => showSlide(index));
            });

            const interval = Number(slider.getAttribute("data-slider-interval")) || 5200;
            let timer = window.setInterval(() => showSlide(activeIndex + 1), interval);

            slider.addEventListener("mouseenter", () => {
                window.clearInterval(timer);
            });

            slider.addEventListener("mouseleave", () => {
                timer = window.setInterval(() => showSlide(activeIndex + 1), interval);
            });

            slider.addEventListener("focusin", () => {
                window.clearInterval(timer);
            });

            slider.addEventListener("focusout", () => {
                timer = window.setInterval(() => showSlide(activeIndex + 1), interval);
            });
        });
    }

    function initializeServiceHoverPreview() {
        const serviceCards = document.querySelectorAll(".home-service-card, .popular-service-card");

        serviceCards.forEach((card) => {
            card.addEventListener("focusin", () => {
                card.classList.add("is-focused");
            });

            card.addEventListener("focusout", () => {
                card.classList.remove("is-focused");
            });
        });
    }

    function initializeCategoryCards() {
        const cards = document.querySelectorAll(".home-category-card, .project-category-card, .category-card");

        cards.forEach((card) => {
            const link = card.querySelector("a[href]");
            const interactiveElements = card.querySelectorAll("a, button, input, textarea, select");

            if (!link || interactiveElements.length > 1) {
                return;
            }

            card.setAttribute("tabindex", "0");
            card.setAttribute("role", "link");
            card.setAttribute("aria-label", link.textContent.trim() || "Open category");

            card.addEventListener("click", (event) => {
                if (event.target.closest("a, button, input, textarea, select")) {
                    return;
                }

                link.click();
            });

            card.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    link.click();
                }
            });
        });
    }

    function initializeCounters() {
        const counters = document.querySelectorAll("[data-count-to]");

        if (!counters.length) {
            return;
        }

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        function animateCounter(counter) {
            const target = Number(counter.getAttribute("data-count-to")) || 0;
            const suffix = counter.getAttribute("data-count-suffix") || "";
            const prefix = counter.getAttribute("data-count-prefix") || "";
            const duration = Number(counter.getAttribute("data-count-duration")) || 1300;

            if (reduceMotion) {
                counter.textContent = `${prefix}${target}${suffix}`;
                return;
            }

            const startTime = performance.now();

            function tick(now) {
                const progress = Math.min((now - startTime) / duration, 1);
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(target * easedProgress);

                counter.textContent = `${prefix}${current}${suffix}`;

                if (progress < 1) {
                    window.requestAnimationFrame(tick);
                }
            }

            window.requestAnimationFrame(tick);
        }

        if (!("IntersectionObserver" in window)) {
            counters.forEach(animateCounter);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.35
            }
        );

        counters.forEach((counter) => observer.observe(counter));
    }

    function initializeHomeMarqueeClone() {
        const tracks = document.querySelectorAll(".home-marquee__track, .material-marquee__track");

        tracks.forEach((track) => {
            const groups = track.querySelectorAll(".home-marquee__group, .material-marquee__group");

            if (groups.length > 1) {
                return;
            }

            const firstGroup = groups[0];

            if (!firstGroup) {
                return;
            }

            const clone = firstGroup.cloneNode(true);
            clone.setAttribute("aria-hidden", "true");
            track.appendChild(clone);
        });
    }

    function initializeComparisonCards() {
        const rows = document.querySelectorAll(".home-compare__row, .trust-panel__row, .provider-compare__row, .compare-row");

        rows.forEach((row, index) => {
            row.style.setProperty("--row-index", String(index));
        });
    }

    function initializeHomeFAQSchema() {
        const faqSection = document.querySelector(".home-faq");

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

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqEntities
        });

        document.head.appendChild(script);
    }

    function initializeHomePageSchema() {
        const brandName = getConfigValue("brand.name", "Kitchora");
        const companyName = getConfigValue("company.name", "Kitchora Matching Group LLC");
        const email = getConfigValue("contact.email", "hello@kitchora.com");
        const phone = getConfigValue("contact.phoneDisplay", "+1 (555) 019-2744");
        const address = getConfigValue("company.address", "1200 Olive Market Lane, Suite 210, Portland, OR 97205");

        const existing = document.querySelector('script[data-home-schema="true"]');

        if (existing) {
            return;
        }

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-home-schema", "true");
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": brandName,
            "legalName": companyName,
            "description": "Independent kitchen remodelling provider-matching platform.",
            "email": email,
            "telephone": phone,
            "address": address,
            "url": window.location.href
        });

        document.head.appendChild(script);
    }

    function initializeScrollHint() {
        const hints = document.querySelectorAll("[data-scroll-to]");

        hints.forEach((hint) => {
            hint.addEventListener("click", () => {
                const targetSelector = hint.getAttribute("data-scroll-to");
                const target = document.querySelector(targetSelector);

                if (!target) {
                    return;
                }

                const header = document.querySelector("[data-site-header]");
                const offset = header ? header.offsetHeight + 18 : 24;

                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.scrollY - offset,
                    behavior: "smooth"
                });
            });
        });
    }

    function init() {
        initializeHeroSlider();
        initializeServiceHoverPreview();
        initializeCategoryCards();
        initializeCounters();
        initializeHomeMarqueeClone();
        initializeComparisonCards();
        initializeHomeFAQSchema();
        initializeHomePageSchema();
        initializeScrollHint();

        if (window.KitchoraGlobal && typeof window.KitchoraGlobal.initializeIcons === "function") {
            window.KitchoraGlobal.initializeIcons();
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();