(function () {
    "use strict";

    const config = window.KITCHORA_CONFIG || {};
    const services = Array.isArray(config.services) ? config.services : [];

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

    function getCurrentService() {
        const pageId = document.body.getAttribute("data-service-id");
        const currentPath = window.location.pathname.split("/").pop();

        return services.find((service) => {
            return service.id === pageId || service.href === currentPath;
        }) || null;
    }

    function initializeServiceSidebar() {
        const currentService = getCurrentService();
        const links = document.querySelectorAll(".service-sidebar__nav a[href]");

        links.forEach((link) => {
            const href = link.getAttribute("href");

            if (!href) {
                return;
            }

            const isCurrent = currentService && href === currentService.href;

            link.classList.toggle("is-active", Boolean(isCurrent));

            if (isCurrent) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    function initializeServiceInternalAnchors() {
        const links = document.querySelectorAll(".service-sidebar__nav a[href^='#'], [data-service-scroll]");

        links.forEach((link) => {
            link.addEventListener("click", (event) => {
                const selector = link.getAttribute("href") || link.getAttribute("data-service-scroll");

                if (!selector || !selector.startsWith("#")) {
                    return;
                }

                const target = document.querySelector(selector);

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

    function initializeRelatedServices() {
        const currentService = getCurrentService();
        const relatedContainers = document.querySelectorAll("[data-related-services]");

        if (!relatedContainers.length || !services.length) {
            return;
        }

        relatedContainers.forEach((container) => {
            const limit = Number(container.getAttribute("data-related-limit")) || 3;
            const related = services
                .filter((service) => !currentService || service.id !== currentService.id)
                .slice(0, limit);

            if (!related.length || container.children.length) {
                return;
            }

            related.forEach((service) => {
                const card = document.createElement("a");
                card.className = "service-card related-service-card";
                card.href = service.href;
                card.innerHTML = `
                    <img src="${service.image}" alt="${service.title}">
                    <span class="service-card__icon">
                        <i data-lucide="${service.icon || "chef-hat"}" aria-hidden="true"></i>
                    </span>
                    <div class="service-card__content">
                        <span class="service-card__number">${String(services.indexOf(service) + 1).padStart(2, "0")}</span>
                        <h3>${service.title}</h3>
                        <p>${service.summary || service.description || "Compare available local provider options for this kitchen request category."}</p>
                        <span class="service-card__link">
                            View category
                            <i data-lucide="arrow-up-right" aria-hidden="true"></i>
                        </span>
                    </div>
                `;

                container.appendChild(card);
            });
        });
    }

    function initializeServiceCards() {
        const cards = document.querySelectorAll(".service-card, .related-service-card");

        cards.forEach((card) => {
            const link = card.matches("a[href]") ? card : card.querySelector("a[href]");

            if (!link) {
                return;
            }

            card.setAttribute("tabindex", "0");
            card.setAttribute("role", "link");

            const title = card.querySelector("h2, h3");
            card.setAttribute("aria-label", title ? `Open ${title.textContent.trim()}` : "Open related kitchen category");

            card.addEventListener("click", (event) => {
                if (card.matches("a[href]")) {
                    return;
                }

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

    function initializeServiceBenefitCards() {
        const cards = document.querySelectorAll(".service-benefit-card");

        cards.forEach((card, index) => {
            card.style.setProperty("--benefit-index", String(index));
        });
    }

    function initializeServiceChecklist() {
        const checklistItems = document.querySelectorAll(".service-inclusions__checklist article");

        checklistItems.forEach((item, index) => {
            item.style.setProperty("--check-index", String(index));
        });
    }

    function initializeServiceProfile() {
        const detailCards = document.querySelectorAll(".service-profile__details article");

        detailCards.forEach((card, index) => {
            card.style.setProperty("--profile-index", String(index));
        });
    }

    function initializeServiceFAQSchema() {
        const faqSection = document.querySelector(".service-faq");

        if (!faqSection) {
            return;
        }

        const currentService = getCurrentService();
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

        const existing = document.querySelector('script[data-service-faq-schema="true"]');

        if (existing) {
            return;
        }

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-service-faq-schema", "true");
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "name": currentService ? `${currentService.title} FAQ` : "Kitchen Service FAQ",
            "mainEntity": faqEntities
        });

        document.head.appendChild(script);
    }

    function initializeServicePageSchema() {
        const currentService = getCurrentService();

        if (!currentService) {
            return;
        }

        const existing = document.querySelector('script[data-service-page-schema="true"]');

        if (existing) {
            return;
        }

        const brandName = getConfigValue("brand.name", "Kitchora");
        const companyName = getConfigValue("company.name", "Kitchora Matching Group LLC");
        const email = getConfigValue("contact.email", "hello@kitchora.com");
        const phone = getConfigValue("contact.phoneDisplay", "+1 (555) 019-2744");

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-service-page-schema", "true");
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": `${currentService.title} | ${brandName}`,
            "description": currentService.summary || currentService.description || "Kitchen remodelling provider-matching category page.",
            "url": window.location.href,
            "publisher": {
                "@type": "Organization",
                "name": brandName,
                "legalName": companyName,
                "email": email,
                "telephone": phone
            },
            "about": {
                "@type": "Service",
                "name": currentService.title,
                "description": currentService.description || currentService.summary || "",
                "provider": {
                    "@type": "Organization",
                    "name": brandName
                },
                "serviceType": "Kitchen remodelling provider matching"
            }
        });

        document.head.appendChild(script);
    }

    function initializeImageFocus() {
        const images = document.querySelectorAll(
            ".service-detail__main-image, .service-inclusions__image-large, .service-inclusions__image-small, .service-profile__gallery img"
        );

        images.forEach((image) => {
            image.addEventListener("load", () => {
                image.classList.add("is-loaded");
            });

            if (image.complete) {
                image.classList.add("is-loaded");
            }
        });
    }

    function initializeMediaTilt() {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const isSmallScreen = window.innerWidth <= 980;

        if (reduceMotion || isSmallScreen) {
            return;
        }

        const tiltItems = document.querySelectorAll(".service-inclusions__media, .service-profile__gallery");

        tiltItems.forEach((item) => {
            item.addEventListener("mousemove", (event) => {
                const rect = item.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;

                item.style.transform = `perspective(900px) rotateX(${(-y * 1.6).toFixed(2)}deg) rotateY(${(x * 1.6).toFixed(2)}deg)`;
            });

            item.addEventListener("mouseleave", () => {
                item.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
            });
        });
    }

    function initializeRequestButtons() {
        const currentService = getCurrentService();

        if (!currentService) {
            return;
        }

        const requestLinks = document.querySelectorAll('a[href="contact.html#request-form"], a[data-service-request-link]');

        requestLinks.forEach((link) => {
            const url = new URL("contact.html", window.location.href);
            url.searchParams.set("service", currentService.title);
            url.hash = "request-form";

            link.setAttribute("href", `${url.pathname.split("/").pop()}${url.search}${url.hash}`);
        });
    }

    function initializeSidebarMobileToggle() {
        const sidebar = document.querySelector(".service-sidebar");
        const panel = document.querySelector(".service-sidebar__panel");

        if (!sidebar || !panel) {
            return;
        }

        const nav = panel.querySelector(".service-sidebar__nav");

        if (!nav) {
            return;
        }

        const button = document.createElement("button");
        button.className = "service-sidebar__toggle";
        button.type = "button";
        button.setAttribute("aria-expanded", "false");
        button.innerHTML = `
            <span>Browse kitchen categories</span>
            <i data-lucide="chevron-down" aria-hidden="true"></i>
        `;

        panel.insertBefore(button, nav);

        button.addEventListener("click", () => {
            const isOpen = panel.classList.toggle("is-open");
            button.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function initializeVisibleSections() {
        const sections = document.querySelectorAll(".service-detail, .service-benefits, .service-inclusions, .service-profile, .service-faq");

        if (!sections.length || !("IntersectionObserver" in window)) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    entry.target.classList.toggle("is-in-view", entry.isIntersecting);
                });
            },
            {
                threshold: 0.18
            }
        );

        sections.forEach((section) => observer.observe(section));
    }

    function refreshAfterInit() {
        if (window.KitchoraGlobal && typeof window.KitchoraGlobal.initializeIcons === "function") {
            window.KitchoraGlobal.initializeIcons();
        }

        if (window.KitchoraGlobal && typeof window.KitchoraGlobal.applyGlobalBusinessConfig === "function") {
            window.KitchoraGlobal.applyGlobalBusinessConfig();
        }

        if (window.AOS && typeof window.AOS.refresh === "function") {
            window.setTimeout(() => window.AOS.refresh(), 300);
        }
    }

    function init() {
        initializeServiceSidebar();
        initializeServiceInternalAnchors();
        initializeRelatedServices();
        initializeServiceCards();
        initializeServiceBenefitCards();
        initializeServiceChecklist();
        initializeServiceProfile();
        initializeServiceFAQSchema();
        initializeServicePageSchema();
        initializeImageFocus();
        initializeMediaTilt();
        initializeRequestButtons();
        initializeSidebarMobileToggle();
        initializeVisibleSections();
        refreshAfterInit();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();