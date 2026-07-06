(function () {
    "use strict";

    const config = window.KITCHORA_CONFIG || {};
    const services = Array.isArray(config.services) ? config.services : [];

    function initializeServiceExplorer() {
        const explorers = document.querySelectorAll(".services-showcase, .all-services-showcase, .service-explorer");

        explorers.forEach((explorer) => {
            const tabs = Array.from(
                explorer.querySelectorAll(".services-showcase__tab, .all-services-showcase__tab, .service-explorer__tab")
            );

            const images = Array.from(
                explorer.querySelectorAll(".services-showcase__media img, .all-services-showcase__media img, .service-explorer__media img")
            );

            const label = explorer.querySelector(".services-showcase__label strong, .all-services-showcase__label strong, .service-explorer__label strong");

            if (!tabs.length || !images.length) {
                return;
            }

            function activate(index) {
                const safeIndex = Math.max(0, Math.min(index, tabs.length - 1));

                tabs.forEach((tab, tabIndex) => {
                    const isActive = tabIndex === safeIndex;
                    tab.classList.toggle("is-active", isActive);
                    tab.setAttribute("aria-pressed", isActive ? "true" : "false");
                });

                images.forEach((image, imageIndex) => {
                    image.classList.toggle("is-active", imageIndex === safeIndex);
                });

                if (label) {
                    const tabTitle = tabs[safeIndex].querySelector("strong");
                    label.textContent = tabTitle ? tabTitle.textContent.trim() : label.textContent;
                }
            }

            tabs.forEach((tab, index) => {
                tab.type = tab.type || "button";
                tab.setAttribute("aria-pressed", tab.classList.contains("is-active") ? "true" : "false");

                tab.addEventListener("click", () => activate(index));
                tab.addEventListener("mouseenter", () => activate(index));
            });

            const activeIndex = tabs.findIndex((tab) => tab.classList.contains("is-active"));
            activate(activeIndex >= 0 ? activeIndex : 0);
        });
    }

    function initializeServiceCards() {
        const cards = document.querySelectorAll(".service-card, .services-card, .all-service-card");

        cards.forEach((card) => {
            const link = card.querySelector("a[href]");

            if (!link) {
                return;
            }

            card.setAttribute("tabindex", "0");
            card.setAttribute("role", "link");

            const title = card.querySelector("h2, h3");
            card.setAttribute("aria-label", title ? `Open ${title.textContent.trim()}` : "Open service category");

            card.addEventListener("click", (event) => {
                if (event.target.closest("a, button, input, select, textarea")) {
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

    function initializeServicesMarqueeClone() {
        const tracks = document.querySelectorAll(".services-marquee__track, .category-marquee__track");

        tracks.forEach((track) => {
            const groups = track.querySelectorAll(".services-marquee__group, .category-marquee__group");

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

    function initializeGuideRows() {
        const rows = document.querySelectorAll(
            ".services-guide__row, .request-guide__row, .category-guide__row, .services-help__row, .provider-help__row, .services-clarity__row"
        );

        rows.forEach((row, index) => {
            row.style.setProperty("--row-index", String(index));
        });
    }

    function initializeHeroQuickLinks() {
        const links = document.querySelectorAll(".services-hero__quick a, .all-services-hero__quick a");

        links.forEach((link) => {
            link.addEventListener("click", (event) => {
                const href = link.getAttribute("href");

                if (!href || !href.startsWith("#")) {
                    return;
                }

                const target = document.querySelector(href);

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

    function initializeServicesFAQSchema() {
        const faqSection = document.querySelector(".services-faq");

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

        const existing = document.querySelector('script[data-services-faq-schema="true"]');

        if (existing) {
            return;
        }

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-services-faq-schema", "true");
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqEntities
        });

        document.head.appendChild(script);
    }

    function initializeServicesCollectionSchema() {
        const existing = document.querySelector('script[data-services-collection-schema="true"]');

        if (existing || !services.length) {
            return;
        }

        const brandName = (window.KitchoraGlobal && window.KitchoraGlobal.getConfigValue)
            ? window.KitchoraGlobal.getConfigValue("brand.name", "Kitchora")
            : "Kitchora";

        const itemList = services.map((service, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": service.title,
            "url": new URL(service.href, window.location.href).href,
            "description": service.summary || service.description || ""
        }));

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-services-collection-schema", "true");
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": `${brandName} Kitchen Service Categories`,
            "description": "Kitchen remodelling request categories for an independent provider-matching platform.",
            "mainEntity": {
                "@type": "ItemList",
                "itemListElement": itemList
            }
        });

        document.head.appendChild(script);
    }

    function initializeMediaReveal() {
        const media = document.querySelectorAll(".services-showcase__media, .all-services-showcase__media, .service-explorer__media");

        if (!media.length || !("IntersectionObserver" in window)) {
            media.forEach((item) => item.classList.add("is-visible"));
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
                threshold: 0.24
            }
        );

        media.forEach((item) => observer.observe(item));
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
        initializeServiceExplorer();
        initializeServiceCards();
        initializeServicesMarqueeClone();
        initializeGuideRows();
        initializeHeroQuickLinks();
        initializeServicesFAQSchema();
        initializeServicesCollectionSchema();
        initializeMediaReveal();
        refreshAfterInit();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();