(function () {
    "use strict";

    const config = window.KITCHORA_CONFIG || {};

    const dom = {
        body: document.body,
        header: document.querySelector("[data-site-header]"),
        mobileMenu: document.querySelector("[data-mobile-menu]"),
        mobileToggle: document.querySelector("[data-mobile-toggle]"),
        mobileClose: document.querySelector("[data-mobile-close]"),
        cookieBanner: document.querySelector("[data-cookie-banner]")
    };

    const state = {
        lastScrollY: window.scrollY || 0,
        ticking: false,
        parallaxItems: [],
        isMobileMenuOpen: false
    };

    function getConfigValue(path, fallback = "") {
        if (!path || typeof path !== "string") {
            return fallback;
        }

        return path.split(".").reduce((source, key) => {
            if (source && Object.prototype.hasOwnProperty.call(source, key)) {
                return source[key];
            }

            return undefined;
        }, config) ?? fallback;
    }

    function applyGlobalBusinessConfig() {
        const oldValues = {
            brandName: "Kitchora",
            companyName: "Kitchora Matching Group LLC",
            companyId: "KMG-472019",
            address: "1200 Olive Market Lane, Suite 210, Portland, OR 97205",
            city: "Portland",
            state: "OR",
            zip: "97205",
            country: "United States",
            serviceArea: "Selected local markets",
            phoneDisplay: "+1 (555) 019-2744",
            phoneRaw: "+15550192744",
            phoneHref: "tel:+15550192744",
            email: "hello@kitchora.com",
            emailHref: "mailto:hello@kitchora.com",
            mapHref: "https://maps.google.com/?q=1200%20Olive%20Market%20Lane%2C%20Suite%20210%2C%20Portland%2C%20OR%2097205"
        };

        const newValues = {
            brandName: getConfigValue("brand.name", oldValues.brandName),
            companyName: getConfigValue("company.name", oldValues.companyName),
            companyId: getConfigValue("company.companyId", oldValues.companyId),
            address: getConfigValue("company.address", oldValues.address),
            city: getConfigValue("company.city", oldValues.city),
            state: getConfigValue("company.state", oldValues.state),
            zip: getConfigValue("company.zip", oldValues.zip),
            country: getConfigValue("company.country", oldValues.country),
            serviceArea: getConfigValue("company.serviceArea", oldValues.serviceArea),
            phoneDisplay: getConfigValue("contact.phoneDisplay", oldValues.phoneDisplay),
            phoneRaw: getConfigValue("contact.phoneRaw", oldValues.phoneRaw),
            phoneHref: getConfigValue("contact.phoneHref", oldValues.phoneHref),
            email: getConfigValue("contact.email", oldValues.email),
            emailHref: getConfigValue("contact.emailHref", oldValues.emailHref),
            mapHref: getConfigValue("company.mapHref", oldValues.mapHref)
        };

        const replacements = [
            [oldValues.brandName, newValues.brandName],
            [oldValues.companyName, newValues.companyName],
            [oldValues.companyId, newValues.companyId],
            [oldValues.address, newValues.address],
            [oldValues.city, newValues.city],
            [oldValues.state, newValues.state],
            [oldValues.zip, newValues.zip],
            [oldValues.country, newValues.country],
            [oldValues.serviceArea, newValues.serviceArea],
            [oldValues.phoneDisplay, newValues.phoneDisplay],
            [oldValues.phoneRaw, newValues.phoneRaw],
            [oldValues.phoneHref, newValues.phoneHref],
            [oldValues.email, newValues.email],
            [oldValues.emailHref, newValues.emailHref],
            [oldValues.mapHref, newValues.mapHref]
        ].filter(([oldValue, newValue]) => {
            return oldValue && newValue && oldValue !== newValue;
        });

        function replaceValue(value) {
            if (typeof value !== "string" || !value || !replacements.length) {
                return value;
            }

            let updatedValue = value;

            replacements.forEach(([oldValue, newValue]) => {
                updatedValue = updatedValue.split(oldValue).join(newValue);
            });

            return updatedValue;
        }

        function applyDataConfigAttributes() {
            document.querySelectorAll("[data-config]").forEach((element) => {
                const path = element.getAttribute("data-config");
                const value = getConfigValue(path);

                if (value !== undefined && value !== null && String(value).trim() !== "") {
                    element.textContent = value;
                }
            });

            document.querySelectorAll("[data-config-href]").forEach((element) => {
                const path = element.getAttribute("data-config-href");
                const value = getConfigValue(path);

                if (value !== undefined && value !== null && String(value).trim() !== "") {
                    element.setAttribute("href", value);
                }
            });

            document.querySelectorAll("[data-config-src]").forEach((element) => {
                const path = element.getAttribute("data-config-src");
                const value = getConfigValue(path);

                if (value !== undefined && value !== null && String(value).trim() !== "") {
                    element.setAttribute("src", value);
                }
            });

            document.querySelectorAll("[data-config-alt]").forEach((element) => {
                const path = element.getAttribute("data-config-alt");
                const value = getConfigValue(path);

                if (value !== undefined && value !== null && String(value).trim() !== "") {
                    element.setAttribute("alt", value);
                }
            });

            document.querySelectorAll("[data-current-year]").forEach((element) => {
                element.textContent = String(new Date().getFullYear());
            });
        }

        function replaceTextNodes(root = document.body) {
            if (!root || !replacements.length) {
                return;
            }

            const ignoredTags = new Set([
                "SCRIPT",
                "STYLE",
                "NOSCRIPT",
                "TEXTAREA",
                "INPUT",
                "SELECT",
                "OPTION"
            ]);

            const walker = document.createTreeWalker(
                root,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode(node) {
                        const parent = node.parentElement;

                        if (!parent || ignoredTags.has(parent.tagName)) {
                            return NodeFilter.FILTER_REJECT;
                        }

                        if (!node.nodeValue || !node.nodeValue.trim()) {
                            return NodeFilter.FILTER_REJECT;
                        }

                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
            );

            const nodes = [];

            while (walker.nextNode()) {
                nodes.push(walker.currentNode);
            }

            nodes.forEach((node) => {
                const updatedText = replaceValue(node.nodeValue);

                if (updatedText !== node.nodeValue) {
                    node.nodeValue = updatedText;
                }
            });
        }

        function replaceAttributes(root = document) {
            if (!root || !replacements.length) {
                return;
            }

            const attributesToUpdate = [
                "href",
                "src",
                "alt",
                "title",
                "aria-label",
                "placeholder",
                "content",
                "value",
                "data-config",
                "data-config-href"
            ];

            root.querySelectorAll("*").forEach((element) => {
                attributesToUpdate.forEach((attributeName) => {
                    if (!element.hasAttribute(attributeName)) {
                        return;
                    }

                    const currentValue = element.getAttribute(attributeName);
                    const updatedValue = replaceValue(currentValue);

                    if (updatedValue !== currentValue) {
                        element.setAttribute(attributeName, updatedValue);
                    }
                });
            });
        }

        function updateContactLinks() {
            document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
                link.setAttribute("href", newValues.phoneHref);

                if (!link.querySelector("[data-config]") && link.textContent.includes(oldValues.phoneDisplay)) {
                    link.textContent = replaceValue(link.textContent);
                }
            });

            document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
                link.setAttribute("href", newValues.emailHref);

                if (!link.querySelector("[data-config]") && link.textContent.includes(oldValues.email)) {
                    link.textContent = replaceValue(link.textContent);
                }
            });

            document.querySelectorAll('a[href*="maps.google.com"]').forEach((link) => {
                link.setAttribute("href", newValues.mapHref);
            });
        }

        function updateForms() {
            document.querySelectorAll("form").forEach((form) => {
                const endpoint = getConfigValue("form.endpoint");

                if (endpoint) {
                    form.setAttribute("action", endpoint);
                }
            });
        }

        function updateStructuredData() {
            document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
                const updatedJson = replaceValue(script.textContent);

                if (updatedJson !== script.textContent) {
                    script.textContent = updatedJson;
                }
            });
        }

        function updateDocumentMeta() {
            document.title = replaceValue(document.title);

            document.querySelectorAll("meta[content]").forEach((meta) => {
                const currentValue = meta.getAttribute("content");
                const updatedValue = replaceValue(currentValue);

                if (updatedValue !== currentValue) {
                    meta.setAttribute("content", updatedValue);
                }
            });
        }

        applyDataConfigAttributes();
        replaceTextNodes();
        replaceAttributes();
        updateContactLinks();
        updateForms();
        updateStructuredData();
        updateDocumentMeta();

        window.KitchoraRefreshConfig = applyGlobalBusinessConfig;
    }

    function initializeIcons() {
        if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons({
                attrs: {
                    "aria-hidden": "true"
                }
            });
        }
    }

    function initializeAOS() {
        if (!window.AOS || typeof window.AOS.init !== "function") {
            return;
        }

        window.AOS.init({
            duration: Number(getConfigValue("animation.aosDuration", 850)),
            offset: Number(getConfigValue("animation.aosOffset", 90)),
            once: Boolean(getConfigValue("animation.aosOnce", true)),
            easing: "ease-out-cubic",
            anchorPlacement: "top-bottom"
        });

        window.addEventListener("load", () => {
            if (window.AOS && typeof window.AOS.refreshHard === "function") {
                window.AOS.refreshHard();
            }
        });
    }

    function updateHeaderState() {
        if (!dom.header) {
            return;
        }

        const currentScroll = window.scrollY || document.documentElement.scrollTop || 0;

        if (currentScroll > 16) {
            dom.header.classList.add("is-scrolled");
        } else {
            dom.header.classList.remove("is-scrolled");
        }

        state.lastScrollY = currentScroll;
    }

    function requestHeaderTick() {
        if (state.ticking) {
            return;
        }

        state.ticking = true;

        window.requestAnimationFrame(() => {
            updateHeaderState();
            updateParallaxItems();
            state.ticking = false;
        });
    }

    function openMobileMenu() {
        if (!dom.mobileMenu) {
            return;
        }

        state.isMobileMenuOpen = true;
        dom.mobileMenu.classList.add("is-open");
        dom.mobileMenu.setAttribute("aria-hidden", "false");
        dom.body.classList.add("is-menu-open");

        if (dom.mobileToggle) {
            dom.mobileToggle.setAttribute("aria-expanded", "true");
            dom.mobileToggle.setAttribute("aria-label", "Close menu");
        }
    }

    function closeMobileMenu() {
        if (!dom.mobileMenu) {
            return;
        }

        state.isMobileMenuOpen = false;
        dom.mobileMenu.classList.remove("is-open");
        dom.mobileMenu.setAttribute("aria-hidden", "true");
        dom.body.classList.remove("is-menu-open");

        if (dom.mobileToggle) {
            dom.mobileToggle.setAttribute("aria-expanded", "false");
            dom.mobileToggle.setAttribute("aria-label", "Open menu");
        }
    }

    function initializeMobileMenu() {
        if (!dom.mobileMenu || !dom.mobileToggle) {
            return;
        }

        dom.mobileToggle.addEventListener("click", () => {
            if (state.isMobileMenuOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        if (dom.mobileClose) {
            dom.mobileClose.addEventListener("click", closeMobileMenu);
        }

        dom.mobileMenu.addEventListener("click", (event) => {
            if (event.target === dom.mobileMenu) {
                closeMobileMenu();
            }

            const link = event.target.closest("a");

            if (link && dom.mobileMenu.contains(link)) {
                closeMobileMenu();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && state.isMobileMenuOpen) {
                closeMobileMenu();
            }
        });
    }

    function initializeDropdowns() {
        const dropdowns = document.querySelectorAll("[data-dropdown]");

        dropdowns.forEach((dropdown) => {
            const trigger = dropdown.querySelector("[data-dropdown-link]");
            const menu = dropdown.querySelector("[data-dropdown-menu]");

            if (!trigger || !menu) {
                return;
            }

            let closeTimer = null;

            function openDropdown() {
                window.clearTimeout(closeTimer);
                dropdown.classList.add("is-open");
                trigger.setAttribute("aria-expanded", "true");
            }

            function closeDropdown() {
                dropdown.classList.remove("is-open");
                trigger.setAttribute("aria-expanded", "false");
            }

            function delayedClose() {
                closeTimer = window.setTimeout(closeDropdown, 130);
            }

            dropdown.addEventListener("mouseenter", openDropdown);
            dropdown.addEventListener("mouseleave", delayedClose);

            trigger.addEventListener("focus", openDropdown);

            dropdown.addEventListener("focusout", (event) => {
                if (!dropdown.contains(event.relatedTarget)) {
                    closeDropdown();
                }
            });

            trigger.addEventListener("click", (event) => {
                const isTouchLike = window.matchMedia("(hover: none)").matches || window.innerWidth <= 980;

                if (!isTouchLike) {
                    return;
                }

                if (!dropdown.classList.contains("is-open")) {
                    event.preventDefault();
                    openDropdown();
                }
            });

            document.addEventListener("click", (event) => {
                if (!dropdown.contains(event.target)) {
                    closeDropdown();
                }
            });

            document.addEventListener("keydown", (event) => {
                if (event.key === "Escape") {
                    closeDropdown();
                }
            });
        });
    }

    function initializeAccordions() {
        const buttons = document.querySelectorAll(
            "[data-accordion-button], .accordion__button, [data-faq-button], [data-home-compare]"
        );

        buttons.forEach((button) => {
            const item = button.closest("[data-accordion-item], .accordion__item, .faq-item, .home-compare__item");

            if (!item) {
                return;
            }

            const content = item.querySelector(
                "[data-accordion-content], .accordion__content, .faq-item__content, .home-compare__answer"
            );

            const isOpen = item.classList.contains("is-open");

            button.setAttribute("aria-expanded", isOpen ? "true" : "false");

            if (content && !content.id) {
                content.id = `accordion-panel-${Math.random().toString(36).slice(2, 9)}`;
            }

            if (content) {
                button.setAttribute("aria-controls", content.id);
            }

            button.addEventListener("click", () => {
                const parent = item.parentElement;
                const shouldOpen = !item.classList.contains("is-open");

                if (parent && parent.hasAttribute("data-accordion-single")) {
                    parent.querySelectorAll("[data-accordion-item], .accordion__item, .faq-item, .home-compare__item").forEach((sibling) => {
                        if (sibling !== item) {
                            sibling.classList.remove("is-open");

                            const siblingButton = sibling.querySelector(
                                "[data-accordion-button], .accordion__button, [data-faq-button], [data-home-compare]"
                            );

                            if (siblingButton) {
                                siblingButton.setAttribute("aria-expanded", "false");
                            }
                        }
                    });
                }

                item.classList.toggle("is-open", shouldOpen);
                button.setAttribute("aria-expanded", shouldOpen ? "true" : "false");

                if (window.AOS && typeof window.AOS.refresh === "function") {
                    window.setTimeout(() => window.AOS.refresh(), 320);
                }
            });
        });
    }

    function initializeCookieBanner() {
        if (!dom.cookieBanner) {
            return;
        }

        const storageKey = getConfigValue("cookie.storageKey", "kitchora_cookie_consent");
        const acceptedValue = getConfigValue("cookie.acceptedValue", "accepted");
        const declinedValue = getConfigValue("cookie.declinedValue", "declined");
        const acceptButton = dom.cookieBanner.querySelector("[data-cookie-accept]");
        const declineButton = dom.cookieBanner.querySelector("[data-cookie-decline]");

        function getStoredConsent() {
            try {
                return window.localStorage.getItem(storageKey);
            } catch (error) {
                return null;
            }
        }

        function setStoredConsent(value) {
            try {
                window.localStorage.setItem(storageKey, value);
            } catch (error) {
                return false;
            }

            return true;
        }

        function hideBanner() {
            dom.cookieBanner.classList.remove("is-visible");
        }

        function showBanner() {
            window.setTimeout(() => {
                dom.cookieBanner.classList.add("is-visible");
            }, 600);
        }

        if (!getStoredConsent()) {
            showBanner();
        }

        if (acceptButton) {
            acceptButton.addEventListener("click", () => {
                setStoredConsent(acceptedValue);
                hideBanner();
            });
        }

        if (declineButton) {
            declineButton.addEventListener("click", () => {
                setStoredConsent(declinedValue);
                hideBanner();
            });
        }
    }

    function initializeSmoothAnchors() {
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

                const headerOffset = dom.header ? dom.header.offsetHeight + 18 : 24;
                const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;

                window.scrollTo({
                    top: targetTop,
                    behavior: "smooth"
                });
            });
        });
    }

    function initializeParallaxItems() {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const isSmallScreen = window.innerWidth <= 760;

        if (reduceMotion || isSmallScreen) {
            return;
        }

        state.parallaxItems = Array.from(document.querySelectorAll(".parallax-bg, [data-parallax-bg]")).map((element) => {
            const parent = element.closest("section") || element.parentElement;
            const strength = Number(element.getAttribute("data-parallax-strength")) || Number(getConfigValue("animation.parallaxStrength", 0.12));

            return {
                element,
                parent,
                strength
            };
        });

        updateParallaxItems();
    }

    function updateParallaxItems() {
        if (!state.parallaxItems.length) {
            return;
        }

        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        state.parallaxItems.forEach((item) => {
            if (!item.parent) {
                return;
            }

            const rect = item.parent.getBoundingClientRect();

            if (rect.bottom < 0 || rect.top > viewportHeight) {
                return;
            }

            const progress = (rect.top - viewportHeight / 2) * item.strength;
            item.element.style.transform = `translate3d(0, ${progress.toFixed(2)}px, 0)`;
        });
    }

    function initializeRevealOnScrollFallback() {
        if (window.AOS) {
            return;
        }

        const elements = document.querySelectorAll("[data-aos]");

        if (!elements.length || !("IntersectionObserver" in window)) {
            elements.forEach((element) => element.classList.add("aos-animate"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("aos-animate");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.16,
                rootMargin: "0px 0px -8% 0px"
            }
        );

        elements.forEach((element) => observer.observe(element));
    }

    function initializeImageLoadRefresh() {
        const images = document.querySelectorAll("img");

        images.forEach((image) => {
            if (image.complete) {
                return;
            }

            image.addEventListener(
                "load",
                () => {
                    if (window.AOS && typeof window.AOS.refresh === "function") {
                        window.AOS.refresh();
                    }
                },
                { once: true }
            );
        });
    }

    function initializeExternalLinks() {
        document.querySelectorAll('a[target="_blank"]').forEach((link) => {
            const rel = link.getAttribute("rel") || "";

            if (!rel.includes("noopener")) {
                link.setAttribute("rel", `${rel} noopener`.trim());
            }
        });
    }

    function setActiveNavigation() {
        const currentPath = window.location.pathname.split("/").pop() || "index.html";
        const navLinks = document.querySelectorAll(".site-nav__link[href], .mobile-menu__nav a[href]");

        navLinks.forEach((link) => {
            const href = link.getAttribute("href");

            if (!href) {
                return;
            }

            const normalizedHref = href.split("#")[0];

            if (normalizedHref === currentPath) {
                link.classList.add("is-active");
            }
        });

        const servicePages = (config.services || []).map((service) => service.href);

        if (servicePages.includes(currentPath)) {
            document.querySelectorAll('.site-nav__link[href="all-services.html"]').forEach((link) => {
                link.classList.add("is-active");
            });
        }
    }

    function initializeBackToTop() {
        const buttons = document.querySelectorAll("[data-back-to-top]");

        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            });
        });
    }

    function refreshLayoutAfterReady() {
        window.setTimeout(() => {
            updateHeaderState();
            updateParallaxItems();

            if (window.AOS && typeof window.AOS.refreshHard === "function") {
                window.AOS.refreshHard();
            }
        }, 250);
    }

    function init() {
        applyGlobalBusinessConfig();
        initializeIcons();
        initializeAOS();
        initializeMobileMenu();
        initializeDropdowns();
        initializeAccordions();
        initializeCookieBanner();
        initializeSmoothAnchors();
        initializeParallaxItems();
        initializeRevealOnScrollFallback();
        initializeImageLoadRefresh();
        initializeExternalLinks();
        initializeBackToTop();
        setActiveNavigation();
        updateHeaderState();
        refreshLayoutAfterReady();

        window.addEventListener("scroll", requestHeaderTick, { passive: true });
        window.addEventListener("resize", () => {
            closeMobileMenu();
            state.parallaxItems = [];
            initializeParallaxItems();
            requestHeaderTick();
        });
    }

    window.KitchoraGlobal = {
        getConfigValue,
        applyGlobalBusinessConfig,
        initializeIcons,
        closeMobileMenu,
        updateHeaderState
    };

    window.applyGlobalBusinessConfig = applyGlobalBusinessConfig;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();