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

    function initializeLegalSidebar() {
        const currentPath = window.location.pathname.split("/").pop() || "privacy-policy.html";
        const links = document.querySelectorAll(".legal-sidebar a[href]");

        links.forEach((link) => {
            const href = link.getAttribute("href");

            if (!href) {
                return;
            }

            const cleanHref = href.split("#")[0];
            const isCurrent = cleanHref === currentPath;

            link.classList.toggle("is-active", isCurrent);

            if (isCurrent) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    function initializeLegalAnchorLinks() {
        const documentArea = document.querySelector(".legal-document");

        if (!documentArea) {
            return;
        }

        const sections = Array.from(documentArea.querySelectorAll("section"));

        sections.forEach((section, index) => {
            if (!section.id) {
                section.id = `legal-section-${index + 1}`;
            }
        });

        document.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener("click", (event) => {
                const href = link.getAttribute("href");

                if (!href || href === "#") {
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

    function initializeLegalReadingProgress() {
        const legalDocument = document.querySelector(".legal-document");

        if (!legalDocument) {
            return;
        }

        const progress = document.createElement("div");
        progress.className = "legal-reading-progress";
        progress.setAttribute("aria-hidden", "true");

        const bar = document.createElement("span");
        progress.appendChild(bar);
        document.body.appendChild(progress);

        function updateProgress() {
            const rect = legalDocument.getBoundingClientRect();
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            const total = rect.height - viewportHeight;
            const passed = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
            const percent = total <= 0 ? 100 : (passed / total) * 100;

            bar.style.transform = `scaleX(${Math.min(Math.max(percent / 100, 0), 1)})`;
        }

        updateProgress();

        window.addEventListener("scroll", updateProgress, { passive: true });
        window.addEventListener("resize", updateProgress);
    }

    function initializeLegalPrintButton() {
        const legalDocument = document.querySelector(".legal-document");

        if (!legalDocument) {
            return;
        }

        const ctaCard = document.querySelector(".legal-cta__actions");

        if (!ctaCard) {
            return;
        }

        const printButton = document.createElement("button");
        printButton.type = "button";
        printButton.className = "btn btn-secondary legal-print-button";
        printButton.innerHTML = `
            <span>Print Page</span>
            <i data-lucide="printer" aria-hidden="true"></i>
        `;

        printButton.addEventListener("click", () => {
            window.print();
        });

        ctaCard.appendChild(printButton);
    }

    function initializeLegalExternalLinks() {
        const links = document.querySelectorAll(".legal-document a[href]");

        links.forEach((link) => {
            const href = link.getAttribute("href");

            if (!href) {
                return;
            }

            const isExternal = href.startsWith("http") && !href.includes(window.location.hostname);

            if (!isExternal) {
                return;
            }

            link.setAttribute("target", "_blank");
            link.setAttribute("rel", "noopener noreferrer");
        });
    }

    function initializeLegalPageSchema() {
        const existing = document.querySelector('script[data-legal-schema="true"]');

        if (existing) {
            return;
        }

        const brandName = getConfigValue("brand.name", "Kitchora");
        const companyName = getConfigValue("company.name", "Kitchora Matching Group LLC");
        const currentTitle = document.title || `${brandName} Legal Page`;
        const description = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-legal-schema", "true");
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": currentTitle,
            "description": description,
            "url": window.location.href,
            "publisher": {
                "@type": "Organization",
                "name": brandName,
                "legalName": companyName,
                "email": getConfigValue("contact.email", "hello@kitchora.com"),
                "telephone": getConfigValue("contact.phoneDisplay", "+1 (555) 019-2744"),
                "address": getConfigValue("company.address", "1200 Olive Market Lane, Suite 210, Portland, OR 97205")
            }
        });

        document.head.appendChild(script);
    }

    function initializeLegalSectionObserver() {
        const sections = Array.from(document.querySelectorAll(".legal-document section"));

        if (!sections.length || !("IntersectionObserver" in window)) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    entry.target.classList.toggle("is-visible", entry.isIntersecting);
                });
            },
            {
                threshold: 0.18,
                rootMargin: "0px 0px -20% 0px"
            }
        );

        sections.forEach((section) => observer.observe(section));
    }

    function addLegalRuntimeStyles() {
        if (document.querySelector("style[data-legal-runtime-styles]")) {
            return;
        }

        const style = document.createElement("style");
        style.setAttribute("data-legal-runtime-styles", "true");
        style.textContent = `
            .legal-reading-progress {
                position: fixed;
                left: 0;
                top: 0;
                z-index: 1400;
                width: 100%;
                height: 3px;
                pointer-events: none;
                background: transparent;
            }

            .legal-reading-progress span {
                display: block;
                width: 100%;
                height: 100%;
                transform: scaleX(0);
                transform-origin: left center;
                background: linear-gradient(90deg, var(--color-copper), var(--color-muted-sage));
                transition: transform 120ms linear;
            }

            .legal-print-button {
                cursor: pointer;
            }

            .legal-document section {
                transition:
                    transform var(--transition-base),
                    opacity var(--transition-base);
            }

            .legal-document section:not(.is-visible) {
                opacity: 0.94;
            }

            @media print {
                .site-header,
                .mobile-menu,
                .site-footer,
                .cookie-banner,
                .legal-sidebar,
                .legal-cta,
                .legal-reading-progress {
                    display: none !important;
                }

                .legal-hero {
                    padding: 0 0 24px !important;
                    background: #fff !important;
                    color: #111 !important;
                }

                .legal-hero *,
                .legal-document * {
                    color: #111 !important;
                }

                .legal-content {
                    padding: 0 !important;
                    background: #fff !important;
                }

                .legal-content__layout {
                    display: block !important;
                }

                .legal-document {
                    padding: 0 !important;
                    border: 0 !important;
                    box-shadow: none !important;
                    background: #fff !important;
                }

                .legal-document section {
                    page-break-inside: avoid;
                }

                a {
                    text-decoration: underline !important;
                }
            }
        `;

        document.head.appendChild(style);
    }

    function refreshAfterInit() {
        if (window.KitchoraGlobal && typeof window.KitchoraGlobal.initializeIcons === "function") {
            window.KitchoraGlobal.initializeIcons();
        }

        if (window.KitchoraGlobal && typeof window.KitchoraGlobal.applyGlobalBusinessConfig === "function") {
            window.KitchoraGlobal.applyGlobalBusinessConfig();
        }

        if (window.AOS && typeof window.AOS.refresh === "function") {
            window.setTimeout(() => window.AOS.refresh(), 240);
        }
    }

    function init() {
        addLegalRuntimeStyles();
        initializeLegalSidebar();
        initializeLegalAnchorLinks();
        initializeLegalReadingProgress();
        initializeLegalPrintButton();
        initializeLegalExternalLinks();
        initializeLegalPageSchema();
        initializeLegalSectionObserver();
        refreshAfterInit();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();