import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


/* =====================================================
   ELEMENTS
===================================================== */

const welcomeName =
    document.getElementById("welcomeName");

const topUserName =
    document.getElementById("topUserName");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const userAvatar =
    document.getElementById("userAvatar");

const profileAvatar =
    document.getElementById("profileAvatar");

const logoutBtn =
    document.getElementById("logoutBtn");

const sidebar =
    document.getElementById("sidebar");

const menuBtn =
    document.getElementById("menuBtn");

const listPropertyBtn =
    document.getElementById("listPropertyBtn");

const propertyForm =
    document.getElementById("propertyForm");

const clearFormBtn =
    document.getElementById("clearFormBtn");

const formMessage =
    document.getElementById("formMessage");

const propertiesGrid =
    document.getElementById("propertiesGrid");

const listingCount =
    document.getElementById("listingCount");

const activeListings =
    document.getElementById("activeListings");

const locationInput =
    document.getElementById("locationInput");

const locationSuggestions =
    document.getElementById("locationSuggestions");

const clearLocation =
    document.getElementById("clearLocation");


/* =====================================================
   CURRENT USER
===================================================== */

let currentUser = null;


/* =====================================================
   GUJARAT LOCATIONS
===================================================== */

const GUJARAT_LOCATIONS = [

    "Ahmedabad",
    "Amod",
    "Amreli",
    "Anand",
    "Anjar",
    "Anklav",
    "Ankleshwar",
    "Babra",
    "Bagasara",
    "Balasinor",
    "Bantva",
    "Bareja",
    "Bardoli",
    "Barwala",
    "Bavla",
    "Bayad",
    "Bhabhar",
    "Bhachau",
    "Bhanvad",
    "Bharuch",
    "Bhavnagar",
    "Bhayavadar",
    "Bhuj",
    "Bilimora",
    "Borsad",
    "Botad",
    "Chaklasi",
    "Chalala",
    "Chanasma",
    "Chhota Udepur",
    "Chotila",
    "Chorwad",
    "Dabhoi",
    "Dahod",
    "Dakor",
    "Damnagar",
    "Deesa",
    "Dehgam",
    "Devgadh Baria",
    "Dhandhuka",
    "Dhanera",
    "Dharampur",
    "Dholka",
    "Dhoraji",
    "Dhrangadhra",
    "Dhrol",
    "Dwarka",
    "Gadhada",
    "Gandhidham",
    "Gandhinagar",
    "Gandevi",
    "Gariadhar",
    "Godhra",
    "Gondal",
    "Halol",
    "Halvad",
    "Harij",
    "Himmatnagar",
    "Idar",
    "Jafrabad",
    "Jambusar",
    "Jamjodhpur",
    "Jamnagar",
    "Jam Raval",
    "Jasdan",
    "Jetpur",
    "Jhalod",
    "Junagadh",
    "Kadi",
    "Kadodara",
    "Kalavad",
    "Kalol",
    "Kanjari",
    "Kapadvanj",
    "Karamsad",
    "Karjan",
    "Kathlal",
    "Keshod",
    "Khambhalia",
    "Khambhat",
    "Kheda",
    "Khedbrahma",
    "Kheralu",
    "Kodinar",
    "Kutiyana",
    "Lathi",
    "Limbdi",
    "Lunawada",
    "Mahudha",
    "Mahuva",
    "Maliya Miyana",
    "Manavadar",
    "Mandvi",
    "Mansa",
    "Mehsana",
    "Mehmedabad",
    "Modasa",
    "Morbi",
    "Nadiad",
    "Navsari",
    "Ode",
    "Okha",
    "Padra",
    "Palanpur",
    "Palitana",
    "Pardi",
    "Patadi",
    "Patan",
    "Petlad",
    "Porbandar",
    "Prantij",
    "Radhanpur",
    "Rajkot",
    "Rajpipla",
    "Rajula",
    "Ranavav",
    "Rapar",
    "Sabarmati",
    "Salaya",
    "Sanand",
    "Santrampur",
    "Savarkundla",
    "Savli",
    "Shahera",
    "Sidhpur",
    "Sihor",
    "Sikka",
    "Sojitra",
    "Songadh",
    "Surat",
    "Surendranagar",
    "Sutrapada",
    "Talaja",
    "Talala",
    "Thangadh",
    "Thara",
    "Tharad",
    "Thasra",
    "Umbergaon",
    "Umreth",
    "Unjha",
    "Upleta",
    "Vadnagar",
    "Vadodara",
    "Vadali",
    "Vallabh Vidyanagar",
    "Vallabhipur",
    "Valsad",
    "Vanthli",
    "Vapi",
    "Veraval",
    "Vijapur",
    "Viramgam",
    "Visavadar",
    "Visnagar",
    "Vyara",
    "Wadhwan",
    "Wankaner"

].sort((a, b) =>
    a.localeCompare(b)
);


/* =====================================================
   SHOW MESSAGE
===================================================== */

function showMessage(
    text,
    type = "success"
) {

    if (!formMessage) {
        return;
    }

    formMessage.textContent = text;

    formMessage.className =
        "form-message " + type;

}


/* =====================================================
   GET USER NAME
===================================================== */

function getUserName(userData, user) {

    const fullName =
        userData.fullName ||
        userData.name ||
        user.displayName ||
        "";


    if (fullName.trim()) {

        return fullName.trim();

    }


    const email =
        user.email || "";


    if (email.includes("@")) {

        const emailName =
            email
                .split("@")[0]
                .replace(/[._-]+/g, " ")
                .trim();


        if (emailName) {

            return emailName
                .split(" ")
                .map(word =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
                )
                .join(" ");

        }

    }


    return "User";

}


/* =====================================================
   LOAD USER
===================================================== */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        currentUser = user;


        try {

            console.log(
                "Seller Firebase UID:",
                user.uid
            );


            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const userSnapshot =
                await getDoc(userRef);


            if (!userSnapshot.exists()) {

                console.error(
                    "Seller profile not found."
                );

                alert(
                    "Your profile could not be found. Please sign in again."
                );

                await signOut(auth);

                window.location.href =
                    "login.html";

                return;

            }


            const userData =
                userSnapshot.data();


            console.log(
                "Seller profile:",
                userData
            );


            /* -----------------------------------------
               ACCOUNT TYPE
            ----------------------------------------- */

            if (
                userData.accountType !==
                "seller"
            ) {

                if (
                    userData.accountType ===
                    "buyer"
                ) {

                    window.location.href =
                        "buyer.html";

                    return;

                }


                if (
                    userData.accountType ===
                    "renter"
                ) {

                    window.location.href =
                        "renter.html";

                    return;

                }


                if (
                    userData.accountType ===
                    "admin"
                ) {

                    window.location.href =
                        "admin.html";

                    return;

                }

            }


            /* -----------------------------------------
               NAME
            ----------------------------------------- */

            const fullName =
                getUserName(
                    userData,
                    user
                );


            const firstName =
                fullName
                    .split(" ")[0];


            const email =
                userData.email ||
                user.email ||
                "";


            /* -----------------------------------------
               DISPLAY
            ----------------------------------------- */

            if (welcomeName) {

                welcomeName.textContent =
                    firstName;

            }


            if (topUserName) {

                topUserName.textContent =
                    firstName;

            }


            if (profileName) {

                profileName.textContent =
                    fullName;

            }


            if (profileEmail) {

                profileEmail.textContent =
                    email;

            }


            /* -----------------------------------------
               PHOTO
            ----------------------------------------- */

            const photoURL =
                userData.photoURL ||
                user.photoURL ||
                "";


            if (photoURL) {

                if (userAvatar) {

                    userAvatar.innerHTML = `
                        <img
                            src="${photoURL}"
                            alt="${fullName}"
                        >
                    `;

                }


                if (profileAvatar) {

                    profileAvatar.innerHTML = `
                        <img
                            src="${photoURL}"
                            alt="${fullName}"
                        >
                    `;

                }

            } else {

                const letter =
                    firstName
                        .charAt(0)
                        .toUpperCase();


                if (userAvatar) {

                    userAvatar.textContent =
                        letter;

                }


                if (profileAvatar) {

                    profileAvatar.textContent =
                        letter;

                }

            }


            await loadSellerProperties();


        } catch (error) {

            console.error(
                "Seller dashboard error:",
                error
            );

        }

    }
);


/* =====================================================
   LOAD SELLER PROPERTIES
===================================================== */

async function loadSellerProperties() {

    if (!currentUser) {
        return;
    }


    try {

        const propertiesRef =
            collection(
                db,
                "properties"
            );


        const sellerQuery =
            query(
                propertiesRef,
                where(
                    "sellerId",
                    "==",
                    currentUser.uid
                )
            );


        const snapshot =
            await getDocs(
                sellerQuery
            );


        const properties =
            snapshot.docs.map(
                document => ({
                    id: document.id,
                    ...document.data()
                })
            );


        renderProperties(
            properties
        );


        if (activeListings) {

            activeListings.textContent =
                properties.length;

        }


        if (listingCount) {

            listingCount.textContent =
                `${properties.length} ${
                    properties.length === 1
                        ? "listing"
                        : "listings"
                }`;

        }


    } catch (error) {

        console.error(
            "Could not load properties:",
            error
        );

    }

}


/* =====================================================
   RENDER PROPERTIES
===================================================== */

function renderProperties(
    properties
) {

    if (!propertiesGrid) {
        return;
    }


    if (!properties.length) {

        propertiesGrid.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ⌂
                </div>

                <h3>
                    No properties listed yet
                </h3>

                <p>
                    Your published properties will
                    appear here.
                </p>

            </div>

        `;

        return;

    }


    propertiesGrid.innerHTML =
        properties.map(
            property => `

                <article class="property-card">

                    <div class="property-card-top">

                        <span class="property-status">

                            ${
                                property.listingType === "rent"
                                    ? "FOR RENT"
                                    : "FOR SALE"
                            }

                        </span>

                    </div>


                    <div class="property-card-body">

                        <h3>
                            ${escapeHTML(
                                property.title ||
                                "Untitled Property"
                            )}
                        </h3>


                        <p class="property-price">

                            ₹${formatNumber(
                                property.price || 0
                            )}

                        </p>


                        <p class="property-location">

                            📍
                            ${escapeHTML(
                                property.location ||
                                "Location unavailable"
                            )}

                        </p>


                        <div class="property-meta">

                            ${
                                property.bedrooms
                                    ? `<span>${escapeHTML(String(property.bedrooms))} Beds</span>`
                                    : ""
                            }

                            ${
                                property.bathrooms
                                    ? `<span>${escapeHTML(String(property.bathrooms))} Baths</span>`
                                    : ""
                            }

                            ${
                                property.area
                                    ? `<span>${escapeHTML(String(property.area))} sq ft</span>`
                                    : ""
                            }

                        </div>

                    </div>

                </article>

            `
        )
        .join("");

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   FORMAT NUMBER
===================================================== */

function formatNumber(number) {

    return Number(number)
        .toLocaleString("en-IN");

}


/* =====================================================
   LOCATION AUTOCOMPLETE
===================================================== */

function updateLocationSuggestions() {

    if (!locationInput ||
        !locationSuggestions) {

        return;

    }


    const search =
        locationInput.value
            .trim()
            .toLowerCase();


    if (clearLocation) {

        clearLocation.style.display =
            search
                ? "flex"
                : "none";

    }


    if (!search) {

        locationSuggestions.innerHTML =
            "";

        locationSuggestions.classList.remove(
            "visible"
        );

        return;

    }


    const matches =
        GUJARAT_LOCATIONS
            .filter(location =>
                location
                    .toLowerCase()
                    .includes(search)
            )
            .slice(0, 10);


    if (!matches.length) {

        locationSuggestions.innerHTML = `

            <div class="location-empty">

                No matching Gujarat city found.

            </div>

        `;

        locationSuggestions.classList.add(
            "visible"
        );

        return;

    }


    locationSuggestions.innerHTML =
        matches.map(
            location => `

                <button
                    type="button"
                    class="location-suggestion"
                    data-location="${escapeHTML(location)}"
                >

                    <span class="location-suggestion-icon">
                        ⌖
                    </span>

                    <span>
                        ${escapeHTML(location)}
                    </span>

                </button>

            `
        )
        .join("");


    locationSuggestions.classList.add(
        "visible"
    );


    const buttons =
        locationSuggestions.querySelectorAll(
            ".location-suggestion"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    locationInput.value =
                        button.dataset.location;


                    locationSuggestions.classList.remove(
                        "visible"
                    );


                    if (clearLocation) {

                        clearLocation.style.display =
                            "flex";

                    }

                }
            );

        }
    );

}


/* =====================================================
   LOCATION INPUT
===================================================== */

if (locationInput) {

    locationInput.addEventListener(
        "input",
        updateLocationSuggestions
    );


    locationInput.addEventListener(
        "focus",
        () => {

            if (
                locationInput.value.trim()
            ) {

                updateLocationSuggestions();

            }

        }
    );

}


/* =====================================================
   CLEAR LOCATION
===================================================== */

if (clearLocation) {

    clearLocation.addEventListener(
        "click",
        () => {

            locationInput.value =
                "";

            locationSuggestions.innerHTML =
                "";

            locationSuggestions.classList.remove(
                "visible"
            );

            clearLocation.style.display =
                "none";

            locationInput.focus();

        }
    );

}


/* =====================================================
   CLOSE LOCATION DROPDOWN
===================================================== */

document.addEventListener(
    "click",
    event => {

        if (
            !event.target.closest(
                ".location-wrapper"
            )
        ) {

            if (locationSuggestions) {

                locationSuggestions.classList.remove(
                    "visible"
                );

            }

        }

    }
);


/* =====================================================
   LIST YOUR PROPERTY BUTTON
===================================================== */

if (listPropertyBtn) {

    listPropertyBtn.addEventListener(
        "click",
        () => {

            const listingSection =
                document.getElementById(
                    "list-property"
                );


            if (listingSection) {

                listingSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );

}


/* =====================================================
   PROPERTY FORM
===================================================== */

if (propertyForm) {

    propertyForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!currentUser) {

                showMessage(
                    "You must be logged in to list a property.",
                    "error"
                );

                return;

            }


            const title =
                document
                    .getElementById(
                        "propertyTitle"
                    )
                    .value
                    .trim();


            const propertyType =
                document
                    .getElementById(
                        "propertyType"
                    )
                    .value;


            const location =
                locationInput
                    .value
                    .trim();


            const price =
                Number(
                    document
                        .getElementById(
                            "propertyPrice"
                        )
                        .value
                );


            const bedrooms =
                document
                    .getElementById(
                        "bedrooms"
                    )
                    .value;


            const bathrooms =
                document
                    .getElementById(
                        "bathrooms"
                    )
                    .value;


            const area =
                document
                    .getElementById(
                        "area"
                    )
                    .value;


            const description =
                document
                    .getElementById(
                        "description"
                    )
                    .value
                    .trim();


            const listingType =
                document.querySelector(
                    'input[name="listingType"]:checked'
                )?.value || "sale";


            /* -----------------------------------------
               VALIDATION
            ----------------------------------------- */

            if (!title) {

                showMessage(
                    "Please enter a property title.",
                    "error"
                );

                return;

            }


            if (!propertyType) {

                showMessage(
                    "Please select a property type.",
                    "error"
                );

                return;

            }


            if (!location) {

                showMessage(
                    "Please select a location.",
                    "error"
                );

                return;

            }


            if (!price || price <= 0) {

                showMessage(
                    "Please enter a valid property price.",
                    "error"
                );

                return;

            }


            /* -----------------------------------------
               SUBMIT BUTTON
            ----------------------------------------- */

            const submitButton =
                propertyForm.querySelector(
                    ".submit-listing-btn"
                );


            const originalText =
                submitButton.innerHTML;


            submitButton.disabled =
                true;


            submitButton.innerHTML =
                "Publishing...";


            try {

                /* -------------------------------------
                   GET SELLER PROFILE
                ------------------------------------- */

                const userRef =
                    doc(
                        db,
                        "users",
                        currentUser.uid
                    );


                const userSnapshot =
                    await getDoc(userRef);


                const sellerData =
                    userSnapshot.exists()
                        ? userSnapshot.data()
                        : {};


                const sellerName =
                    sellerData.fullName ||
                    sellerData.name ||
                    currentUser.displayName ||
                    currentUser.email ||
                    "";


                /* -------------------------------------
                   SAVE PROPERTY
                ------------------------------------- */

                await addDoc(
                    collection(
                        db,
                        "properties"
                    ),
                    {

                        sellerId:
                            currentUser.uid,

                        sellerName:
                            sellerName,

                        sellerEmail:
                            sellerData.email ||
                            currentUser.email ||
                            "",

                        title:
                            title,

                        propertyType:
                            propertyType,

                        listingType:
                            listingType,

                        location:
                            location,

                        price:
                            price,

                        bedrooms:
                            bedrooms,

                        bathrooms:
                            bathrooms,

                        area:
                            area,

                        description:
                            description,

                        status:
                            "active",

                        views:
                            0,

                        createdAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()

                    }
                );


                /* -------------------------------------
                   SUCCESS
                ------------------------------------- */

                showMessage(
                    "Property published successfully.",
                    "success"
                );


                propertyForm.reset();


                if (clearLocation) {

                    clearLocation.style.display =
                        "none";

                }


                if (locationSuggestions) {

                    locationSuggestions.classList.remove(
                        "visible"
                    );

                }


                await loadSellerProperties();


                setTimeout(
                    () => {

                        showMessage(
                            "",
                            "success"
                        );

                        if (formMessage) {

                            formMessage.className =
                                "form-message";

                        }

                    },
                    3000
                );


            } catch (error) {

                console.error(
                    "Property publishing error:",
                    error
                );


                showMessage(
                    "Could not publish your property. Please try again.",
                    "error"
                );


            } finally {

                submitButton.disabled =
                    false;

                submitButton.innerHTML =
                    originalText;

            }

        }
    );

}


/* =====================================================
   CLEAR FORM
===================================================== */

if (clearFormBtn) {

    clearFormBtn.addEventListener(
        "click",
        () => {

            propertyForm.reset();


            if (locationSuggestions) {

                locationSuggestions.innerHTML =
                    "";

                locationSuggestions.classList.remove(
                    "visible"
                );

            }


            if (clearLocation) {

                clearLocation.style.display =
                    "none";

            }


            if (formMessage) {

                formMessage.textContent =
                    "";

                formMessage.className =
                    "form-message";

            }

        }
    );

}


/* =====================================================
   LOGOUT
===================================================== */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            const confirmed =
                window.confirm(
                    "Are you sure you want to sign out?"
                );


            if (!confirmed) {

                return;

            }


            try {

                await signOut(auth);

                window.location.href =
                    "login.html";

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                alert(
                    "Unable to sign out. Please try again."
                );

            }

        }
    );

}

/* =====================================================
   PROPERTY TYPE → BEDROOM/BATHROOM CONTROL
===================================================== */

const propertyTypeInput = document.getElementById("propertyType");
const bedroomsInput = document.getElementById("bedrooms");
const bathroomsInput = document.getElementById("bathrooms");


function updatePropertyFields() {

    if (!propertyTypeInput || !bedroomsInput || !bathroomsInput) {
        return;
    }

    const propertyType =
        propertyTypeInput.value.trim().toLowerCase();


    if (propertyType === "plot") {

        // Disable bedrooms
        bedroomsInput.disabled = true;

        // Disable bathrooms
        bathroomsInput.disabled = true;

        // Clear old values
        bedroomsInput.value = "";
        bathroomsInput.value = "";

        // Optional visual indication
        bedroomsInput.style.opacity = "0.5";
        bathroomsInput.style.opacity = "0.5";

        bedroomsInput.style.cursor = "not-allowed";
        bathroomsInput.style.cursor = "not-allowed";

    } else {

        // Enable bedrooms
        bedroomsInput.disabled = false;

        // Enable bathrooms
        bathroomsInput.disabled = false;

        // Restore appearance
        bedroomsInput.style.opacity = "1";
        bathroomsInput.style.opacity = "1";

        bedroomsInput.style.cursor = "auto";
        bathroomsInput.style.cursor = "auto";
    }
}


/* Run when property type changes */

if (propertyTypeInput) {

    propertyTypeInput.addEventListener(
        "change",
        updatePropertyFields
    );

    // Run once when page loads
    updatePropertyFields();
}


/* =====================================================
   MOBILE MENU
===================================================== */

if (menuBtn && sidebar) {

    menuBtn.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );

        }
    );

}