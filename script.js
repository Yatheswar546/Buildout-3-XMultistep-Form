const form = document.getElementById("multi-step-form");
const panels = [...document.querySelectorAll(".form-step")];
const indicators = [...document.querySelectorAll(".step-indicator")];

const nameInput = document.querySelector('input[name="userName"]');
const emailInput = document.querySelector('input[name="email"]');
const phoneInput = document.querySelector('input[name="phone"]');

const nextButton = document.getElementById("next-button");
const confirmButton = document.getElementById("confirm-button");
const billingSwitch = document.getElementById("billing-switch");

let currentStep = 1;
let selectedPlan = null;
let isYearly = false;

const plans = {
    Arcade: { monthly: 9, yearly: 90 },
    Advance: { monthly: 12, yearly: 120 },
    Pro: { monthly: 15, yearly: 150 }
};

const addons = {
    online: {
        name: "Online Services",
        monthly: 1,
        yearly: 10
    },
    storage: {
        name: "Larger Storage",
        monthly: 2,
        yearly: 20
    },
    profile: {
        name: "Customizable Profile",
        monthly: 2,
        yearly: 20
    }
};

function showStep(step) {
    currentStep = step;

    panels.forEach((panel) => {
        const active = Number(panel.dataset.panel) === step;
        panel.hidden = !active;
        panel.classList.toggle("active", active);
    });

    indicators.forEach((indicator) => {
        const number = Number(indicator.dataset.step);
        indicator.classList.toggle("active", number === step);
    });

    if (step === 4) {
        updateSummary();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function setError(input, errorElement, message) {
    input.classList.toggle("invalid", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
    errorElement.textContent = message;
}

function validatePersonalInfo() {
    let valid = true;

    const nameError = document.getElementById("name-error");
    const emailError = document.getElementById("email-error");
    const phoneError = document.getElementById("phone-error");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    let message = "";

    if (!name) {
        message = "Enter your name";
        valid = false;
    }

    setError(nameInput, nameError, message);

    message = "";

    if (!email) {
        message = "Enter email";
        valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        message = "Enter a valid email address";
        valid = false;
    }

    setError(emailInput, emailError, message);

    message = "";

    if (!phone) {
        message = "Enter your mobile number";
        valid = false;
    } else if (!/^[+\d][\d\s()-]{6,19}$/.test(phone)) {
        message = "Enter a valid mobile number";
        valid = false;
    }

    setError(phoneInput, phoneError, message);

    if (!valid) {
        const firstInvalid = [nameInput, emailInput, phoneInput]
            .find((input) => input.classList.contains("invalid"));

        firstInvalid?.focus();
    }

    return valid;
}

[nameInput, emailInput, phoneInput].forEach((input) => {
    input.addEventListener("input", () => {
        if (input === nameInput) {
            setError(
                input,
                document.getElementById("name-error"),
                input.value.trim() ? "" : "Enter your name"
            );
        }

        if (input === emailInput) {
            let message = "";

            if (!input.value.trim()) {
                message = "Enter email";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
                message = "Enter a valid email address";
            }

            setError(input, document.getElementById("email-error"), message);
        }

        if (input === phoneInput) {
            let message = "";

            if (!input.value.trim()) {
                message = "Enter your mobile number";
            } else if (!/^[+\d][\d\s()-]{6,19}$/.test(input.value.trim())) {
                message = "Enter a valid mobile number";
            }

            setError(input, document.getElementById("phone-error"), message);
        }
    });
});

function getPlanPrice(planName) {
    if (!planName || !plans[planName]) {
        return 0;
    }

    return isYearly
        ? plans[planName].yearly
        : plans[planName].monthly;
}

function formatPrice(amount) {
    return `$${amount}/${isYearly ? "yr" : "mo"}`;
}

function selectPlan(planName) {
    selectedPlan = planName;

    document.querySelectorAll(".plan_card").forEach((card) => {
        const selected = card.dataset.plan === planName;
        card.classList.toggle("selected", selected);
        card.setAttribute("aria-pressed", String(selected));
    });

    document.getElementById("plan-error").textContent = "";
}

document.querySelectorAll(".plan_card").forEach((card) => {
    card.addEventListener("click", () => {
        selectPlan(card.dataset.plan);
    });
});

function updateBillingDisplay() {
    billingSwitch.setAttribute("aria-checked", String(isYearly));

    document.getElementById("monthly-label")
        .classList.toggle("selected", !isYearly);

    document.getElementById("yearly-label")
        .classList.toggle("selected", isYearly);

    document.querySelectorAll(".plan_card").forEach((card) => {
        const plan = plans[card.dataset.plan];
        const price = isYearly ? plan.yearly : plan.monthly;

        card.querySelector(".plan-price").textContent =
            isYearly ? `$${price}/yr` : `$${price}/mo`;

        card.querySelector(".yearly-benefit").hidden = !isYearly;
    });

    document.querySelectorAll(".addon_card").forEach((card) => {
        const priceElement = card.querySelector(".addon-price");
        const price = Number(
            isYearly
                ? priceElement.dataset.yearly
                : priceElement.dataset.monthly
        );

        priceElement.textContent =
            `+$${price}/${isYearly ? "yr" : "mo"}`;
    });

    if (currentStep === 4) {
        updateSummary();
    }
}

billingSwitch.addEventListener("click", () => {
    isYearly = !isYearly;
    updateBillingDisplay();
});

function getSelectedAddons() {
    return [...document.querySelectorAll('input[name="addons"]:checked')]
        .map((input) => addons[input.value])
        .filter(Boolean);
}

function getAddonPrice(addon) {
    return isYearly ? addon.yearly : addon.monthly;
}

function updateSummary() {
    if (!selectedPlan) {
        return;
    }

    const planPrice = getPlanPrice(selectedPlan);
    const selectedAddons = getSelectedAddons();

    const addonTotal = selectedAddons.reduce(
        (total, addon) => total + getAddonPrice(addon),
        0
    );

    document.getElementById("summary-plan-name").textContent =
        `${selectedPlan} (${isYearly ? "Yearly" : "Monthly"})`;

    document.getElementById("summary-plan-price").textContent =
        formatPrice(planPrice);

    const summaryAddons = document.getElementById("summary-addons");
    summaryAddons.replaceChildren();

    selectedAddons.forEach((addon) => {
        const row = document.createElement("div");
        row.className = "summary-addon-row";

        const name = document.createElement("span");
        name.textContent = addon.name;

        const price = document.createElement("strong");
        price.textContent = `+$${getAddonPrice(addon)}/${isYearly ? "yr" : "mo"}`;

        row.append(name, price);
        summaryAddons.appendChild(row);
    });

    document.getElementById("total-label").textContent =
        `Total (per ${isYearly ? "year" : "month"})`;

    document.getElementById("summary-total").textContent =
        formatPrice(planPrice + addonTotal);
}

function validatePlan() {
    const error = document.getElementById("plan-error");

    if (!selectedPlan) {
        error.textContent = "Please select a plan";
        return false;
    }

    error.textContent = "";
    return true;
}

function goNext() {
    if (currentStep === 1) {
        if (validatePersonalInfo()) {
            showStep(2);
        }
        return;
    }

    if (currentStep === 2) {
        if (validatePlan()) {
            showStep(3);
        }
        return;
    }

    if (currentStep === 3) {
        showStep(4);
    }
}

nextButton.addEventListener("click", goNext);

document.querySelectorAll(".next-step").forEach((button) => {
    button.addEventListener("click", goNext);
});

document.querySelectorAll(".back-button").forEach((button) => {
    button.addEventListener("click", () => {
        if (currentStep > 1 && currentStep <= 4) {
            showStep(currentStep - 1);
        }
    });
});

document.querySelector(".change-plan").addEventListener("click", () => {
    showStep(2);
});

confirmButton.addEventListener("click", () => {
    showStep(5);
});

updateBillingDisplay();
showStep(1);
