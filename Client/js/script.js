let openBtn = document.querySelector('.btn-open-menu'),
    closeBtn = document.querySelector('.btn-close-menu'),
    overLay = document.querySelector('.over-lay'),
    nav = document.querySelector('.navBar'),
    navElements = [openBtn, closeBtn, overLay],
    landing = document.querySelector('.landing'),
    scrollBtn = document.querySelector('.sroll-to-top-btn');
const adminPageLink = document.getElementById("adminPage");

adminPageLink.addEventListener("click", function (e) {
    const role = localStorage.getItem("role");
 // Only Admin can Access
    if (role !== "admin") {
       e.preventDefault(); // To stop navigation
       alert("You are not authorized to access the admin page.");
       return;
    }

    // admin → allow navigation
    window.location.href = "./adminPage.html";
});
const cartPageLink = document.getElementById("cartPage");

cartPageLink.addEventListener("click", function (e) {
    const role = localStorage.getItem("role");
// To access addToCartPage First logIn as USER
    if (role == "admin") {
        alert("Please First logIn as User.");
        return;
    }

    
    window.location.href = "./addToCartPage.html";
});


// For Responsiveness
for (let i = 0; i < navElements.length; i++) {
    navElements[i].addEventListener('click', function () {
        overLay.classList.toggle('active');
        nav.classList.toggle('active');
    })
}

window.onscroll = () => {
    if (this.scrollY >= 600) {
        scrollBtn.classList.add('show');
    } else {
        scrollBtn.classList.remove('show');
    }
}
// Floating Button
scrollBtn.onclick = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    })
}

document.addEventListener("DOMContentLoaded", () => {
    const loginItem = document.getElementById("auth-login-item");
    const logoutItem = document.getElementById("auth-logout-item");
    const logoutBtn = document.getElementById("logout-btn");
    const usernameDisplay = document.getElementById("username-display");

    //  Tooltip elements 
    const tooltipUsername = document.getElementById("tooltip-username");
    const tooltipEmail = document.getElementById("tooltip-email");

    // Check if user is logged in
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email"); // make sure you store this after login

    if (token) {
        // User is logged in: Hide Login, Show Logout
        if (loginItem) loginItem.style.display = "none";
        if (logoutItem) logoutItem.style.display = "block";
        if (username && usernameDisplay) {
            usernameDisplay.innerText = `Logout (${username})`;
        }

        //  Update tooltip with current user info
        if (tooltipUsername) tooltipUsername.textContent = username;
        if (tooltipEmail) tooltipEmail.textContent = email || "";
    } else {
        // User is logged out: Show Login, Hide Logout
        if (loginItem) loginItem.style.display = "block";
        if (logoutItem) logoutItem.style.display = "none";
    }

    // Logout Functionality
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();

            // Clear credentials
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("email"); // also remove email from localStorage

            alert("Logged out successfully!");

            // Refresh page to reset UI state
            window.location.reload();
        });
    }
});
