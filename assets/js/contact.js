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

    function getFormStatus(form) {
        let status = form.querySelector(".request-form__status, .contact-form__status, [data-form-status]");

        if (!status) {
            status = document.createElement("p");
            status.className = "request-form__status";
            status.setAttribute("data-form-status", "");
            status.setAttribute("role", "status");
            status.setAttribute("aria-live", "polite");
            form.appendChild(status);
        }

        return status;
    }

    function setFormStatus(form, message, type) {
        const status = getFormStatus(form);

        status.textContent = message || "";
        status.classList.remove("is-error", "is-success", "is-loading");

        if (type) {
            status.classList.add(`is-${type}`);
        }
    }

    function validateEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
    }

    function validatePhone(value) {
        const cleaned = String(value).replace(/[^\d+]/g, "");
        return cleaned.length >= 7;
    }

    function validateContactForm(form) {
        const requiredFields = Array.from(form.querySelectorAll("[required]"));
        let isValid = true;

        requiredFields.forEach((field) => {
            const value = field.type === "checkbox" ? field.checked : String(field.value || "").trim();

            field.classList.remove("is-invalid");

            if (!value) {
                field.classList.add("is-invalid");
                isValid = false;
                return;
            }

            if (field.type === "email" && !validateEmail(field.value)) {
                field.classList.add("is-invalid");
                isValid = false;
            }

            if (field.type === "tel" && !validatePhone(field.value)) {
                field.classList.add("is-invalid");
                isValid = false;
            }
        });

        return isValid;
    }

    function collectFormData(form) {
        const formData = new FormData(form);
        const sourcePage = form.getAttribute("data-source-page") || document.body.getAttribute("data-page") || "contact";

        if (!formData.has("source_page")) {
            formData.append("source_page", sourcePage);
        }

        if (!formData.has("site_brand")) {
            formData.append("site_brand", getConfigValue("brand.name", "Kitchora"));
        }

        return formData;
    }

    function disableForm(form, shouldDisable) {
        form.querySelectorAll("input, select, textarea, button").forEach((field) => {
            field.disabled = shouldDisable;
        });
    }

    async function submitContactForm(form) {
        const endpoint = form.getAttribute("action") || getConfigValue("form.endpoint", "contact.php");
        const formData = collectFormData(form);

        setFormStatus(form, getConfigValue("form.loadingMessage", "Sending your request..."), "loading");
        disableForm(form, true);

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                body: formData,
                headers: {
                    "Accept": "application/json"
                }
            });

            let payload = null;

            try {
                payload = await response.json();
            } catch (error) {
                payload = null;
            }

            if (!response.ok || !payload || payload.success !== true) {
                const message = payload && payload.message
                    ? payload.message
                    : getConfigValue("form.errorMessage", "Something went wrong. Please check the form fields and try again.");

                throw new Error(message);
            }

            setFormStatus(
                form,
                payload.message || getConfigValue("form.successMessage", "Thank you. Your request has been received."),
                "success"
            );

            form.reset();

            form.querySelectorAll(".is-invalid").forEach((field) => {
                field.classList.remove("is-invalid");
            });
        } catch (error) {
            setFormStatus(
                form,
                error.message || getConfigValue("form.errorMessage", "Something went wrong. Please check the form fields and try again."),
                "error"
            );
        } finally {
            disableForm(form, false);
        }
    }

    function initializeContactForms() {
        const forms = document.querySelectorAll("form.request-form, form.contact-form, form[data-contact-form]");

        forms.forEach((form) => {
            form.setAttribute("novalidate", "novalidate");

            form.addEventListener("submit", (event) => {
                event.preventDefault();

                const honeypot = form.querySelector('input[name="website"], input[name="company_website"], [data-honeypot]');

                if (honeypot && String(honeypot.value || "").trim() !== "") {
                    setFormStatus(form, getConfigValue("form.spamMessage", "Submission could not be processed."), "error");
                    return;
                }

                if (!validateContactForm(form)) {
                    setFormStatus(
                        form,
                        getConfigValue("form.validationMessage", "Please complete the required fields before submitting."),
                        "error"
                    );
                    return;
                }

                submitContactForm(form);
            });

            form.querySelectorAll("input, select, textarea").forEach((field) => {
                field.addEventListener("input", () => {
                    field.classList.remove("is-invalid");
                });

                field.addEventListener("change", () => {
                    field.classList.remove("is-invalid");
                });
            });
        });
    }

    function initializeContactQuickLinks() {
        const links = document.querySelectorAll(".contact-hero__quick a[href^='#']");

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

    function initializeContactCards() {
        const cards = document.querySelectorAll(".contact-detail-card, .contact-option-card, .provider-contact-card");

        cards.forEach((card) => {
            const link = card.querySelector("a[href]");

            if (!link) {
                return;
            }

            card.setAttribute("tabindex", "0");
            card.setAttribute("role", "link");

            const title = card.querySelector("h3");
            card.setAttribute("aria-label", title ? title.textContent.trim() : "Open contact option");

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

    function initializeContactSteps() {
        const steps = document.querySelectorAll(".contact-step, .request-step, .contact-process__step");

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
                threshold: 0.25,
                rootMargin: "0px 0px -8% 0px"
            }
        );

        steps.forEach((step) => observer.observe(step));
    }

    function initializeContactFAQSchema() {
        const faqSection = document.querySelector(".contact-faq");

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

        const existing = document.querySelector('script[data-contact-faq-schema="true"]');

        if (existing) {
            return;
        }

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-contact-faq-schema", "true");
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqEntities
        });

        document.head.appendChild(script);
    }

    function initializeContactPageSchema() {
        const existing = document.querySelector('script[data-contact-schema="true"]');

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
        script.setAttribute("data-contact-schema", "true");
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": `${brandName} Contact`,
            "description": "Contact page for an independent kitchen remodelling provider-matching platform.",
            "mainEntity": {
                "@type": "Organization",
                "name": brandName,
                "legalName": companyName,
                "email": email,
                "telephone": phone,
                "address": address
            }
        });

        document.head.appendChild(script);
    }

    function prefillServiceFromQuery() {
        const params = new URLSearchParams(window.location.search);
        const service = params.get("service");

        if (!service) {
            return;
        }

        const selects = document.querySelectorAll('select[name="service"], select[name="project_type"], select[name="category"]');

        selects.forEach((select) => {
            const matchingOption = Array.from(select.options).find((option) => {
                return option.value === service || option.textContent.trim().toLowerCase() === service.toLowerCase();
            });

            if (matchingOption) {
                select.value = matchingOption.value;
                select.dispatchEvent(new Event("change", { bubbles: true }));
            }
        });
    }

    function initializeFieldAutoGrow() {
        const textareas = document.querySelectorAll("textarea[data-autogrow], .request-form textarea, .contact-form textarea");

        textareas.forEach((textarea) => {
            function resize() {
                textarea.style.height = "auto";
                textarea.style.height = `${textarea.scrollHeight}px`;
            }

            textarea.addEventListener("input", resize);
            resize();
        });
    }

    function initializeContactPromptSlider() {
        const slider = document.querySelector("[data-prompt-slider]");

        if (!slider) {
            return;
        }

        const track = slider.querySelector("[data-prompt-track]");
        const slides = Array.from(track.children);
        const prev = slider.querySelector("[data-prompt-prev]");
        const next = slider.querySelector("[data-prompt-next]");
        const current = slider.querySelector("[data-prompt-current]");

        if (!track || !slides.length || !prev || !next || !current) {
            return;
        }

        let index = 0;
        let startX = 0;
        let isDragging = false;

        function formatNumber(number) {
            return String(number).padStart(2, "0");
        }

        function updateSlider() {
            track.style.transform = `translateX(-${index * 100}%)`;
            current.textContent = formatNumber(index + 1);
        }

        function goNext() {
            index = (index + 1) % slides.length;
            updateSlider();
        }

        function goPrev() {
            index = (index - 1 + slides.length) % slides.length;
            updateSlider();
        }

        next.addEventListener("click", goNext);
        prev.addEventListener("click", goPrev);

        slider.addEventListener("pointerdown", (event) => {
            isDragging = true;
            startX = event.clientX;
        });

        slider.addEventListener("pointerup", (event) => {
            if (!isDragging) return;

            const diff = event.clientX - startX;

            if (Math.abs(diff) > 45) {
                if (diff < 0) {
                    goNext();
                } else {
                    goPrev();
                }
            }

            isDragging = false;
        });

        slider.addEventListener("pointerleave", () => {
            isDragging = false;
        });

        updateSlider();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeContactPromptSlider);
    } else {
        initializeContactPromptSlider();
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
        initializeContactForms();
        initializeContactQuickLinks();
        initializeContactCards();
        initializeContactSteps();
        initializeContactFAQSchema();
        initializeContactPageSchema();
        prefillServiceFromQuery();
        initializeFieldAutoGrow();
        refreshAfterInit();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();