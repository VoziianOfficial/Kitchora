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

    function initializeHomeNavigator() {
        const navigator = document.querySelector("[data-home-navigator]");

        if (!navigator) {
            return;
        }

        const tabs = Array.from(navigator.querySelectorAll("[data-navigator-tab]"));
        const panel = navigator.querySelector(".home-navigator__panel");
        const image = navigator.querySelector("[data-navigator-image]");
        const kicker = navigator.querySelector("[data-navigator-kicker]");
        const title = navigator.querySelector("[data-navigator-title]");
        const text = navigator.querySelector("[data-navigator-text]");
        const list = navigator.querySelector("[data-navigator-list]");
        const link = navigator.querySelector("[data-navigator-link]");

        if (!tabs.length || !panel || !image || !kicker || !title || !text || !list || !link) {
            return;
        }

        const entries = {
            remodel: {
                kicker: "Planning scope",
                title: "Full remodel planning",
                text: "Describe the overall kitchen goal, current pain points, rough room size, desired layout changes, surface preferences, and timeline expectations.",
                items: ["Layout changes or same footprint", "Cabinet, counter, lighting, and tile priorities", "Timeline comfort and provider questions"],
                image: "assets/images/kitchen-detail-2.jpg",
                alt: "Full kitchen remodel request inspiration",
                href: "full-kitchen-remodelling.html"
            },
            cabinet: {
                kicker: "Storage and finish",
                title: "Cabinet update",
                text: "Note whether the cabinet layout should remain, which storage issues matter most, and what door, hardware, and finish direction you prefer.",
                items: ["Existing cabinet condition and layout", "Door style, finish, and hardware direction", "Drawer, pantry, and storage priorities"],
                image: "assets/images/service-2.jpg",
                alt: "Sage cabinet update inspiration",
                href: "cabinet-replacement.html"
            },
            countertop: {
                kicker: "Surface preferences",
                title: "Countertop surfaces",
                text: "Share your approximate counter area, preferred surface character, sink details, edge ideas, and any backsplash coordination questions.",
                items: ["Approximate dimensions or layout notes", "Surface, edge, and color preferences", "Sink, seam, and backsplash questions"],
                image: "assets/images/service-3.jpg",
                alt: "Stone-look countertop inspiration",
                href: "countertop-installation.html"
            },
            backsplash: {
                kicker: "Wall finish",
                title: "Backsplash and tile",
                text: "Describe the coverage area, tile format, pattern, grout direction, current wall condition, and how the finish should relate to nearby surfaces.",
                items: ["Coverage area and wall condition", "Tile size, pattern, and grout preference", "Counter, cabinet, and fixture coordination"],
                image: "assets/images/service-4.jpg",
                alt: "Warm kitchen backsplash tile inspiration",
                href: "backsplash-tile-work.html"
            },
            lighting: {
                kicker: "Light and fixtures",
                title: "Lighting and fixtures",
                text: "Separate practical task-lighting needs from decorative fixture preferences and mention any under-cabinet, pendant, sink, or hardware updates.",
                items: ["Task, ambient, and accent lighting goals", "Pendant or under-cabinet priorities", "Fixture location and finish preferences"],
                image: "assets/images/service-5.jpg",
                alt: "Layered kitchen lighting inspiration",
                href: "kitchen-lighting-fixtures.html"
            },
            storage: {
                kicker: "Function and flow",
                title: "Island and storage",
                text: "Explain how the island or storage should support cooking, seating, pantry organization, appliance placement, and everyday movement.",
                items: ["Island size, seating, and workflow goals", "Drawer, pantry, and shelving needs", "Power, lighting, and surface questions"],
                image: "assets/images/service-6.jpg",
                alt: "Kitchen island and storage inspiration",
                href: "kitchen-island-storage.html"
            }
        };

        const panelId = "home-navigator-panel";
        panel.id = panelId;
        panel.setAttribute("role", "tabpanel");

        function activate(tab, moveFocus = false) {
            const key = tab.getAttribute("data-navigator-tab");
            const entry = entries[key];

            if (!entry) {
                return;
            }

            tabs.forEach((item) => {
                const active = item === tab;
                item.classList.toggle("is-active", active);
                item.setAttribute("aria-selected", active ? "true" : "false");
                item.setAttribute("tabindex", active ? "0" : "-1");
                item.setAttribute("aria-controls", panelId);
            });

            panel.classList.add("is-changing");

            window.setTimeout(() => {
                image.src = entry.image;
                image.alt = entry.alt;
                kicker.textContent = entry.kicker;
                title.textContent = entry.title;
                text.textContent = entry.text;
                list.replaceChildren(...entry.items.map((itemText) => {
                    const item = document.createElement("li");
                    item.textContent = itemText;
                    return item;
                }));
                link.href = entry.href;
                panel.classList.remove("is-changing");
            }, 150);

            if (moveFocus) {
                tab.focus();
            }
        }

        tabs.forEach((tab, index) => {
            tab.addEventListener("click", () => activate(tab));
            tab.addEventListener("keydown", (event) => {
                if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
                    return;
                }

                event.preventDefault();
                let nextIndex = index;

                if (event.key === "ArrowDown") nextIndex = (index + 1) % tabs.length;
                if (event.key === "ArrowUp") nextIndex = (index - 1 + tabs.length) % tabs.length;
                if (event.key === "Home") nextIndex = 0;
                if (event.key === "End") nextIndex = tabs.length - 1;

                activate(tabs[nextIndex], true);
            });
        });

        activate(tabs.find((tab) => tab.classList.contains("is-active")) || tabs[0]);
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

    function initializeHomeProcessSwiper() {
        const swipers = document.querySelectorAll("[data-process-swiper]");

        swipers.forEach((swiper) => {
            const track = swiper.querySelector(".home-process-slider__track");
            const slides = Array.from(swiper.querySelectorAll(".home-process-slide"));
            const prev = swiper.querySelector("[data-process-prev]");
            const next = swiper.querySelector("[data-process-next]");
            const dotsContainer = swiper.querySelector("[data-process-dots]");
            const current = swiper.querySelector("[data-process-current]");
            const total = swiper.querySelector("[data-process-total]");

            const section = swiper.closest(".home-process--photo-slider");
            const sectionBg = section ? section.querySelector("[data-process-section-bg]") : null;

            if (!track || slides.length <= 1) return;

            let activeIndex = 0;

            if (total) {
                total.textContent = String(slides.length).padStart(2, "0");
            }

            const dots = [];

            if (dotsContainer) {
                dotsContainer.innerHTML = "";

                slides.forEach((_, index) => {
                    const dot = document.createElement("button");
                    dot.type = "button";
                    dot.setAttribute("aria-label", `Show process step ${index + 1}`);
                    dotsContainer.appendChild(dot);
                    dots.push(dot);
                });
            }

            function showSlide(index) {
                activeIndex = (index + slides.length) % slides.length;

                const activeSlide = slides[activeIndex];
                const nextBg = activeSlide ? activeSlide.getAttribute("data-process-bg") : "";

                if (sectionBg && nextBg) {
                    sectionBg.classList.add("is-changing");

                    window.setTimeout(() => {
                        sectionBg.style.backgroundImage = `url('${nextBg}')`;
                        sectionBg.classList.remove("is-changing");
                    }, 140);
                }
                track.style.transform = `translateX(-${activeIndex * 100}%)`;

                slides.forEach((slide, slideIndex) => {
                    slide.classList.toggle("is-active", slideIndex === activeIndex);
                    slide.setAttribute("aria-hidden", slideIndex === activeIndex ? "false" : "true");
                });

                dots.forEach((dot, dotIndex) => {
                    dot.classList.toggle("is-active", dotIndex === activeIndex);
                    dot.setAttribute("aria-current", dotIndex === activeIndex ? "true" : "false");
                });

                if (current) {
                    current.textContent = String(activeIndex + 1).padStart(2, "0");
                }
            }

            prev?.addEventListener("click", () => showSlide(activeIndex - 1));
            next?.addEventListener("click", () => showSlide(activeIndex + 1));

            dots.forEach((dot, index) => {
                dot.addEventListener("click", () => showSlide(index));
            });

            showSlide(0);
        });
    }

    function init() {
        initializeHeroSlider();
        initializeServiceHoverPreview();
        initializeCategoryCards();
        initializeCounters();
        initializeHomeMarqueeClone();
        initializeComparisonCards();
        initializeHomeNavigator();
        initializeHomeFAQSchema();
        initializeHomePageSchema();
        initializeScrollHint();
        initializeHomeProcessSwiper();

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
