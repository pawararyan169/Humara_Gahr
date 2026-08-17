import { auth, db } from "./firebase.js";

import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const welcomeName = document.getElementById("welcomeName");
const topUserName = document.getElementById("topUserName");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const userAvatar = document.getElementById("userAvatar");
const profileAvatar = document.getElementById("profileAvatar");
const logoutBtn = document.getElementById("logoutBtn");
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const searchBtn = document.getElementById("searchBtn");
const propertiesGrid = document.getElementById("buyerPropertiesGrid");
const propertyCount = document.getElementById("buyerPropertyCount");

let allProperties = [];

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toLocaleString("en-IN") : "0";
}

function getName(userData, user) {
    const name = userData.fullName || userData.name || user.displayName || "";
    if (name.trim()) return name.trim();

    if (user.email?.includes("@")) {
        return user.email.split("@")[0]
            .replace(/[._-]+/g, " ")
            .split(" ")
            .filter(Boolean)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");
    }

    return "User";
}

function renderAvatar(element, photoURL, firstName, fullName) {
    if (!element) return;
    if (photoURL) {
        element.innerHTML = `<img src="${escapeHTML(photoURL)}" alt="${escapeHTML(fullName)}">`;
    } else {
        element.textContent = firstName.charAt(0).toUpperCase() || "U";
    }
}

function formatListingAge(property) {
    const seconds = property.createdAt?.seconds;
    if (!seconds) return "Recently listed";

    const days = Math.max(0, Math.floor((Date.now() - seconds * 1000) / 86400000));
    if (days === 0) return "Listed today";
    if (days === 1) return "Listed yesterday";
    return `Listed ${days} days ago`;
}

function renderProperties(properties) {
    if (!propertiesGrid) return;

    if (propertyCount) propertyCount.textContent = `${properties.length} ${properties.length === 1 ? "property" : "properties"}`;

    if (!properties.length) {
        propertiesGrid.innerHTML = `
            <div class="buyer-empty-state">
                <div class="empty-icon">⌂</div>
                <h3>No properties found</h3>
                <p>Seller listings will appear here once they are published.</p>
            </div>`;
        return;
    }

    propertiesGrid.innerHTML = properties.map(property => {
        const images = Array.isArray(property.images) ? property.images : [];
        const mainImage = images[0] || "";
        const sellerPhoto = property.sellerPhotoURL || "";
        const listingLabel = property.listingType === "rent" ? "FOR RENT" : "FOR SALE";

        return `
        <article class="property-card buyer-property-card" data-property-id="${escapeHTML(property.id)}">
            <div class="buyer-property-media">
                ${mainImage
                    ? `<img class="buyer-main-property-image" src="${escapeHTML(mainImage)}" alt="${escapeHTML(property.title || "Property")}">`
                    : `<div class="buyer-no-image">No property image</div>`}
                <span class="property-tag">${listingLabel}</span>
                <button type="button" class="heart-btn" data-property="${escapeHTML(property.id)}">♡</button>
            </div>

            ${images.length > 1 ? `
            <div class="buyer-thumbnail-row">
                ${images.map((url, index) => `<button type="button" class="buyer-thumb ${index === 0 ? "active" : ""}" data-image="${escapeHTML(url)}"><img src="${escapeHTML(url)}" alt="Property image ${index + 1}"></button>`).join("")}
            </div>` : ""}

            <div class="property-details">
                <div class="price-row">
                    <h3>₹${formatNumber(property.price)}</h3>
                    <span>${listingLabel}</span>
                </div>

                <h4>${escapeHTML(property.title || "Untitled Property")}</h4>
                <p class="location">📍 ${escapeHTML(property.location || "Location unavailable")}</p>

                <div class="property-meta">
                    <span>${escapeHTML(property.propertyType || "Property")}</span>
                    ${property.bedrooms ? `<span>${escapeHTML(property.bedrooms)} Beds</span>` : ""}
                    ${property.bathrooms ? `<span>${escapeHTML(property.bathrooms)} Baths</span>` : ""}
                    ${property.area ? `<span>${escapeHTML(property.area)} sq ft</span>` : ""}
                </div>

                <div class="buyer-property-description">
                    <strong>Description</strong>
                    <p>${escapeHTML(property.description || "The seller has not added a description.")}</p>
                </div>

                <div class="buyer-seller-profile">
                    <div class="buyer-seller-avatar">
                        ${sellerPhoto ? `<img src="${escapeHTML(sellerPhoto)}" alt="${escapeHTML(property.sellerName || "Seller")}">` : escapeHTML((property.sellerName || "S").charAt(0).toUpperCase())}
                    </div>
                    <div>
                        <small>LISTED BY</small>
                        <strong>${escapeHTML(property.sellerName || "Seller")}</strong>
                        <span>${escapeHTML(property.sellerEmail || "")}</span>
                    </div>
                </div>

                <div class="property-footer">
                    <span>${formatListingAge(property)}</span>
                    <button type="button" class="view-property-btn" data-property-id="${escapeHTML(property.id)}">View details</button>
                </div>
            </div>
        </article>`;
    }).join("");

    attachPropertyInteractions();
}

function attachPropertyInteractions() {
    propertiesGrid?.querySelectorAll(".heart-btn").forEach(button => {
        button.addEventListener("click", () => {
            button.classList.toggle("saved");
            button.textContent = button.classList.contains("saved") ? "♥" : "♡";
        });
    });

    propertiesGrid?.querySelectorAll(".buyer-thumb").forEach(button => {
        button.addEventListener("click", () => {
            const card = button.closest(".buyer-property-card");
            const mainImage = card?.querySelector(".buyer-main-property-image");
            if (!mainImage) return;
            mainImage.src = button.dataset.image;
            card.querySelectorAll(".buyer-thumb").forEach(item => item.classList.remove("active"));
            button.classList.add("active");
        });
    });

    propertiesGrid?.querySelectorAll(".view-property-btn").forEach(button => {
        button.addEventListener("click", () => {
            const property = allProperties.find(item => item.id === button.dataset.propertyId);
            if (!property) return;
            alert(`${property.title}\n\n${property.description || "No description provided."}\n\nLocation: ${property.location}\nSeller: ${property.sellerName || "Seller"}`);
        });
    });
}

async function loadProperties() {
    try {
        const snapshot = await getDocs(
            query(collection(db, "properties"), where("status", "==", "active"))
        );

        allProperties = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
        allProperties.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        renderProperties(allProperties);
    } catch (error) {
        console.error("Could not load buyer properties:", error);
        if (propertiesGrid) {
            propertiesGrid.innerHTML = `<div class="buyer-empty-state"><h3>Unable to load properties</h3><p>${escapeHTML(error.message)}</p></div>`;
        }
    }
}

onAuthStateChanged(auth, async user => {
    if (!user) {
        window.location.replace("login.html");
        return;
    }

    if (!user.emailVerified) {
        window.location.replace("verify-email.html");
        return;
    }

    try {
        const snapshot = await getDoc(doc(db, "users", user.uid));
        if (!snapshot.exists()) {
            await signOut(auth);
            window.location.replace("login.html");
            return;
        }

        const userData = snapshot.data();
        const accountType = userData.accountType;

        if (accountType === "seller") return window.location.replace("seller.html");
        if (accountType === "renter") return window.location.replace("renter.html");
        if (accountType === "admin") return window.location.replace("admin.html");
        if (accountType !== "buyer") return window.location.replace("index.html");

        const fullName = getName(userData, user);
        const firstName = fullName.split(" ")[0] || "User";
        const email = user.email || userData.email || "";
        const photoURL = user.photoURL || userData.photoURL || "";

        if (welcomeName) welcomeName.textContent = firstName;
        if (topUserName) topUserName.textContent = firstName;
        if (profileName) profileName.textContent = fullName;
        if (profileEmail) profileEmail.textContent = email;

        renderAvatar(userAvatar, photoURL, firstName, fullName);
        renderAvatar(profileAvatar, photoURL, firstName, fullName);

        await loadProperties();
    } catch (error) {
        console.error("Buyer dashboard error:", error);
    }
});

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        if (!window.confirm("Are you sure you want to sign out?")) return;
        try {
            logoutBtn.disabled = true;
            await signOut(auth);
            window.location.replace("login.html");
        } catch (error) {
            logoutBtn.disabled = false;
            console.error("Logout error:", error);
            alert("Unable to sign out. Please try again.");
        }
    });
}

if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => sidebar.classList.toggle("open"));
}

if (searchBtn) {
    searchBtn.addEventListener("click", () => {
        const location = document.getElementById("propertyLocation")?.value.trim().toLowerCase() || "";
        const type = document.getElementById("propertyType")?.value || "";
        const budget = document.getElementById("propertyBudget")?.value || "Any budget";

        const filtered = allProperties.filter(property => {
            const locationMatch = !location || String(property.location || "").toLowerCase().includes(location);
            const typeMatch = !type || String(property.propertyType || "").toLowerCase() === type.toLowerCase();
            let budgetMatch = true;
            const price = Number(property.price || 0);

            if (budget === "Under ₹50 Lakh") budgetMatch = price < 5000000;
            else if (budget === "₹50 Lakh – ₹1 Crore") budgetMatch = price >= 5000000 && price <= 10000000;
            else if (budget === "₹1 Crore – ₹2 Crore") budgetMatch = price > 10000000 && price <= 20000000;
            else if (budget === "₹2 Crore+") budgetMatch = price > 20000000;

            return locationMatch && typeMatch && budgetMatch;
        });

        renderProperties(filtered);
        document.getElementById("properties")?.scrollIntoView({ behavior: "smooth" });
    });
}
