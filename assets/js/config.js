window.KITCHORA_CONFIG = {
    brand: {
        name: "Kitchora",
        tagline: "Independent Kitchen Matching Platform"
    },

    company: {
        name: "Kitchora Matching Group LLC",
        companyId: "KMG-472019",
        address: "1200 Olive Market Lane, Suite 210, Portland, OR 97205",
        city: "Portland",
        state: "OR",
        zip: "97205",
        country: "United States",
        serviceArea: "Selected local markets",
        mapHref: "https://maps.google.com/?q=1200%20Olive%20Market%20Lane%2C%20Suite%20210%2C%20Portland%2C%20OR%2097205"
    },

    contact: {
        phoneDisplay: "+1 (555) 019-2744",
        phoneRaw: "+15550192744",
        phoneHref: "tel:+15550192744",
        phoneButtonText: "Start Request",
        email: "hello@kitchora.com",
        emailHref: "mailto:hello@kitchora.com"
    },

    footer: {
        description: "Independent kitchen remodelling provider-matching platform helping homeowners organize project details before comparing available local provider options.",
        copyright: "© 2026 Kitchora. All rights reserved."
    },

    legal: {
        shortDisclaimer: "Kitchora is an independent provider-matching platform. Final pricing, availability, warranties, licensing, insurance, scheduling, and service terms are provided by participating providers.",
        disclaimer: "Disclaimer: This site is a free service to assist homeowners in connecting with local service providers. All contractors/providers are independent and this site does not warrant or guarantee any work performed. It is the responsibility of the homeowner to verify that the hired contractor furnishes the necessary license and insurance required for the work being performed. All persons depicted in a photo or video are actors or models and not contractors listed on this site."
    },

    form: {
        endpoint: "contact.php",
        successMessage: "Thank you. Your request has been received. Kitchora may use your submitted details to help organize provider-matching options where available.",
        errorMessage: "Something went wrong. Please check the form fields and try again.",
        validationMessage: "Please complete the required fields before submitting.",
        spamMessage: "Submission could not be processed.",
        loadingMessage: "Sending your request..."
    },

    services: [
        {
            id: "full-kitchen-remodelling",
            title: "Full Kitchen Remodelling",
            shortTitle: "Full Remodelling",
            href: "full-kitchen-remodelling.html",
            image: "assets/images/service-1.jpg",
            icon: "chef-hat",
            summary: "Organize a complete kitchen update request before comparing available local provider options.",
            description: "Full kitchen remodelling requests may include layout updates, cabinetry, counters, surfaces, lighting, storage, finishes, and planning details."
        },
        {
            id: "cabinet-replacement",
            title: "Cabinet Replacement",
            shortTitle: "Cabinets",
            href: "cabinet-replacement.html",
            image: "assets/images/service-2.jpg",
            icon: "archive",
            summary: "Prepare cabinet replacement details such as style, storage goals, layout notes, and finish direction.",
            description: "Cabinet replacement requests can help homeowners clarify door style, finish preferences, layout needs, hardware direction, and storage priorities."
        },
        {
            id: "countertop-installation",
            title: "Countertop Installation",
            shortTitle: "Countertops",
            href: "countertop-installation.html",
            image: "assets/images/service-3.jpg",
            icon: "panel-top",
            summary: "Compare provider options for countertop-focused kitchen updates and surface planning.",
            description: "Countertop requests may include material preferences, measurements, edge profiles, backsplash tie-ins, sink details, and timing needs."
        },
        {
            id: "backsplash-tile-work",
            title: "Backsplash & Tile Work",
            shortTitle: "Backsplash",
            href: "backsplash-tile-work.html",
            image: "assets/images/service-4.jpg",
            icon: "grid-3x3",
            summary: "Outline backsplash, tile pattern, finish, grout, and wall-surface details before provider conversations.",
            description: "Backsplash and tile requests may include tile size, pattern direction, wall prep, grout preference, fixture spacing, and finish coordination."
        },
        {
            id: "kitchen-lighting-fixtures",
            title: "Kitchen Lighting & Fixtures",
            shortTitle: "Lighting",
            href: "kitchen-lighting-fixtures.html",
            image: "assets/images/service-5.jpg",
            icon: "lamp-ceiling",
            summary: "Organize lighting and fixture update details for local provider comparison.",
            description: "Lighting and fixture requests may involve pendants, under-cabinet lighting, recessed lighting, faucets, sinks, hardware, and finish coordination."
        },
        {
            id: "kitchen-island-storage",
            title: "Kitchen Island & Storage",
            shortTitle: "Island & Storage",
            href: "kitchen-island-storage.html",
            image: "assets/images/service-6.jpg",
            icon: "layout-grid",
            summary: "Clarify kitchen island, pantry, drawer, shelving, seating, and storage goals before moving forward.",
            description: "Kitchen island and storage requests may include island size, seating needs, drawer inserts, pantry goals, workflow zones, and material preferences."
        }
    ],

    serviceCategories: [
        "Full Kitchen Remodelling",
        "Cabinet Replacement",
        "Countertop Installation",
        "Backsplash & Tile Work",
        "Kitchen Lighting & Fixtures",
        "Kitchen Island & Storage"
    ],

    requestDetails: [
        "Project category",
        "Kitchen size or layout notes",
        "Style direction",
        "Timeline preference",
        "Budget comfort range",
        "Photos or measurements if available"
    ],

    cookie: {
        storageKey: "kitchora_cookie_consent",
        acceptedValue: "accepted",
        declinedValue: "declined"
    },

    animation: {
        aosDuration: 850,
        aosOffset: 90,
        aosOnce: true,
        parallaxStrength: 0.12
    }
};