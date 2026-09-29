// OPB Live - Application Logic

document.addEventListener("DOMContentLoaded", function () {

    // =========================
    // OPB LIVE APP STATE
    // =========================

    const OPB = {
        currentUser: null,
        currentRole: null,
        loggedIn: false
    };

    // =========================
    // HELPER FUNCTIONS
    // =========================

    function showMessage(message) {
        alert(message);
    }

    function getElement(selector) {
        return document.querySelector(selector);
    }

    function getElements(selector) {
        return document.querySelectorAll(selector);
    }

    // =========================
    // LOGIN
    // =========================

    const loginForms = getElements("form");

    loginForms.forEach(function (form) {

        form.addEventListener("submit", function (event) {

            event.preventDefault();

            const inputs = form.querySelectorAll("input");

            let email = "";
            let password = "";

            inputs.forEach(function (input) {

                if (
                    input.type === "email" ||
                    input.name === "email" ||
                    input.placeholder?.toLowerCase().includes("email")
                ) {
                    email = input.value;
                }

                if (
                    input.type === "password" ||
                    input.name === "password" ||
                    input.placeholder?.toLowerCase().includes("password")
                ) {
                    password = input.value;
                }

            });

            if (!email || !password) {
                showMessage("Please enter your email and password.");
                return;
            }

            OPB.currentUser = email;
            OPB.loggedIn = true;

            localStorage.setItem("opb_user", email);
            localStorage.setItem("opb_logged_in", "true");

            showMessage("Login successful!");

        });

    });

    // =========================
    // LOGOUT
    // =========================

    getElements("button").forEach(function (button) {

        const text = button.textContent.trim().toLowerCase();

        if (text.includes("logout") || text.includes("log out")) {

            button.addEventListener("click", function () {

                localStorage.removeItem("opb_user");
                localStorage.removeItem("opb_logged_in");

                OPB.currentUser = null;
                OPB.loggedIn = false;

                showMessage("You have been logged out.");

            });

        }

    });

    // =========================
    // APPOINTMENT ACTIONS
    // =========================

    getElements("button").forEach(function (button) {

        const text = button.textContent.trim().toLowerCase();

        if (
            text.includes("book appointment") ||
            text.includes("book appointment")
        ) {

            button.addEventListener("click", function () {

                if (!OPB.loggedIn) {
                    showMessage(
                        "Please login first before booking an appointment."
                    );
                    return;
                }

                showMessage(
                    "Appointment booking will be connected to the OPB system."
                );

            });

        }

    });

    // =========================
    // JOIN OPD
    // =========================

    getElements("button").forEach(function (button) {

        const text = button.textContent.trim().toLowerCase();

        if (
            text.includes("join opd") ||
            text.includes("join queue")
        ) {

            button.addEventListener("click", function () {

                if (!OPB.loggedIn) {
                    showMessage(
                        "Please login first to join an OPD."
                    );
                    return;
                }

                showMessage(
                    "OPD joining request created."
                );

            });

        }

    });

    // =========================
    // MY OPD
    // =========================

    getElements("button").forEach(function (button) {

        const text = button.textContent.trim().toLowerCase();

        if (text.includes("my opd")) {

            button.addEventListener("click", function () {

                if (!OPB.loggedIn) {
                    showMessage(
                        "Please login to view My OPD."
                    );
                    return;
                }

                showMessage(
                    "My OPD will show your live queue position and appointment status."
                );

            });

        }

    });

    // =========================
    // MEDICAL RECORDS
    // =========================

    getElements("button").forEach(function (button) {

        const text = button.textContent.trim().toLowerCase();

        if (
            text.includes("medical records") ||
            text.includes("records")
        ) {

            button.addEventListener("click", function () {

                if (!OPB.loggedIn) {
                    showMessage(
                        "Please login to access medical records."
                    );
                    return;
                }

                showMessage(
                    "Medical records section opened."
                );

            });

        }

    });

    // =========================
    // NOTIFICATIONS
    // =========================

    getElements("button").forEach(function (button) {

        const text = button.textContent.trim().toLowerCase();

        if (
            text.includes("notification") ||
            text.includes("notifications")
        ) {

            button.addEventListener("click", function () {

                showMessage(
                    "No new notifications."
                );

            });

        }

    });

    // =========================
    // ROLE SELECTION
    // =========================

    getElements("select").forEach(function (select) {

        select.addEventListener("change", function () {

            const role = select.value;

            OPB.currentRole = role;

            localStorage.setItem(
                "opb_role",
                role
            );

        });

    });

    // =========================
    // LOCAL SESSION RESTORE
    // =========================

    const savedUser = localStorage.getItem("opb_user");
    const savedLogin = localStorage.getItem("opb_logged_in");
    const savedRole = localStorage.getItem("opb_role");

    if (savedLogin === "true" && savedUser) {

        OPB.currentUser = savedUser;
        OPB.loggedIn = true;

    }

    if (savedRole) {

        OPB.currentRole = savedRole;

    }

    // =========================
    // MOBILE MENU
    // =========================

    const menuButtons = getElements(
        ".menu-btn, .menu-button, [aria-label='menu']"
    );

    menuButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const menu = getElement(
                ".nav-menu, .mobile-menu, .sidebar"
            );

            if (menu) {
                menu.classList.toggle("active");
            }

        });

    });

    // =========================
    // OPB LIVE INITIALIZATION
    // =========================

    console.log("OPB Live initialized successfully.");

});
