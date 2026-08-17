import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyByUO4jJMyhNv_71ydnGa8pB1bCqU5U6HQ",
    authDomain: "humara-ghar-189e9.firebaseapp.com",
    projectId: "humara-ghar-189e9",
    storageBucket: "humara-ghar-189e9.firebasestorage.app",
    messagingSenderId: "234753099186",
    appId: "1:234753099186:web:01a8ed9857576ddd7310ab"
};


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


/* =========================================================
   HELPER
========================================================= */

const $ = id => document.getElementById(id);


/* =========================================================
   DATA
========================================================= */

let data = {
    users: [],
    properties: [],
    inquiries: [],
    appointments: [],
    documents: [],
    photos: []
};


/* =========================================================
   SECURITY / HTML ESCAPE
========================================================= */

const esc = value => {

    return String(value ?? "")
        .replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[character]));

};


/* =========================================================
   USER INITIALS
========================================================= */

const initials = name => {

    return String(name || "User")
        .split(/\s+/)
        .slice(0, 2)
        .map(word => word[0])
        .join("")
        .toUpperCase();

};


/* =========================================================
   DATE FORMATTER
========================================================= */

const date = value => {

    if (!value) {
        return "—";
    }

    if (value?.toDate) {

        return value
            .toDate()
            .toLocaleDateString("en-IN");

    }

    const d = new Date(value);

    if (isNaN(d)) {
        return "—";
    }

    return d.toLocaleDateString("en-IN");

};


/* =========================================================
   READ FIRESTORE COLLECTION
========================================================= */

async function read(collectionName) {

    try {

        const snapshot = await getDocs(
            collection(db, collectionName)
        );

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

    } catch (error) {

        console.warn(
            `Could not read ${collectionName}:`,
            error
        );

        return [];

    }

}


/* =========================================================
   LOAD ALL ADMIN DATA
========================================================= */

async function load() {

    $("loading").classList.remove("hidden");


    for (const collectionName of Object.keys(data)) {

        data[collectionName] =
            await read(collectionName);

    }


    /* COUNTERS */

    $("totalUsers").textContent =
        data.users.length;


    $("buyersCount").textContent =
        data.users.filter(user =>
            ["buyer"].includes(
                user.accountType || user.role
            )
        ).length;


    $("tenantsCount").textContent =
        data.users.filter(user =>
            ["renter", "tenant"].includes(
                user.accountType || user.role
            )
        ).length;


    $("sellersCount").textContent =
        data.users.filter(user =>
            user.accountType === "seller" ||
            user.role === "seller"
        ).length;


    $("propertiesCount").textContent =
        data.properties.length;


    $("inquiriesCount").textContent =
        data.inquiries.length;


    /* RENDER TABLES */

    renderUsers(
        "buyer",
        "buyersTable"
    );


    renderUsers(
        "tenant",
        "tenantsTable"
    );


    renderUsers(
        "seller",
        "sellersTable"
    );


    renderProperties();


    renderRecent();


    renderSimple(
        "inquiriesTable",
        data.inquiries,
        [
            "id",
            "userId",
            "propertyId",
            "message",
            "createdAt"
        ]
    );


    renderSimple(
        "appointmentsTable",
        data.appointments,
        [
            "id",
            "userId",
            "propertyId",
            "date",
            "status"
        ]
    );


    renderSimple(
        "documentsTable",
        data.documents,
        [
            "id",
            "userId",
            "propertyId",
            "type",
            "fileUrl"
        ]
    );


    renderPhotos();


    $("loading").classList.add("hidden");

}


/* =========================================================
   USER AVATAR
========================================================= */

function avatar(user) {

    const photo =
        user.profilePhoto ||
        user.photoURL;


    return `
        <div class="avatar">

            ${
                photo
                    ? `<img src="${esc(photo)}">`
                    : esc(initials(user.name))
            }

        </div>
    `;

}


/* =========================================================
   USERS TABLE
========================================================= */

function renderUsers(role, target) {

    const users = data.users.filter(user => {

        const userRole =
            user.accountType ||
            user.role;


        if (role === "tenant") {

            return [
                "tenant",
                "renter"
            ].includes(userRole);

        }


        return userRole === role;

    });


    $(target).innerHTML = users.length

        ? `
            <div style="overflow:auto">

                <table>

                    <thead>

                        <tr>

                            <th>User</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Joined</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${
                            users.map(user => `

                                <tr data-user="${esc(user.id)}">

                                    <td>

                                        <div class="person">

                                            ${avatar(user)}

                                            <div>

                                                <b>
                                                    ${esc(
                                                        user.name ||
                                                        "Unnamed"
                                                    )}
                                                </b>

                                                <div class="muted">
                                                    ${esc(
                                                        user.email ||
                                                        ""
                                                    )}
                                                </div>

                                            </div>

                                        </div>

                                    </td>


                                    <td>
                                        ${esc(
                                            user.phone ||
                                            "—"
                                        )}
                                    </td>


                                    <td>

                                        <span class="badge">

                                            ${esc(
                                                user.status ||
                                                "Active"
                                            )}

                                        </span>

                                    </td>


                                    <td>
                                        ${date(user.createdAt)}
                                    </td>

                                </tr>

                            `).join("")
                        }

                    </tbody>

                </table>

            </div>
        `

        : `
            <div class="empty">
                No ${role} accounts found yet.
            </div>
        `;

}


/* =========================================================
   PROPERTIES
========================================================= */

function renderProperties() {

    const properties =
        data.properties;


    $("propertiesTable").innerHTML =
        properties.length

            ? `
                <div style="overflow:auto">

                    <table>

                        <thead>

                            <tr>

                                <th>Property</th>
                                <th>Owner</th>
                                <th>Location</th>
                                <th>Price</th>
                                <th>Status</th>

                            </tr>

                        </thead>


                        <tbody>

                            ${
                                properties.map(property => `

                                    <tr>

                                        <td>

                                            <div class="person">

                                                ${
                                                    property.photos?.[0]

                                                        ? `
                                                            <img
                                                                class="thumb"
                                                                src="${esc(
                                                                    property.photos[0]
                                                                )}"
                                                            >
                                                        `

                                                        : `
                                                            <div class="thumb"></div>
                                                        `
                                                }


                                                <b>

                                                    ${esc(
                                                        property.title ||
                                                        property.name ||
                                                        "Untitled"
                                                    )}

                                                </b>

                                            </div>

                                        </td>


                                        <td>

                                            ${esc(
                                                property.sellerName ||
                                                property.ownerName ||
                                                property.sellerId ||
                                                "—"
                                            )}

                                        </td>


                                        <td>

                                            ${esc(
                                                property.location ||
                                                "—"
                                            )}

                                        </td>


                                        <td>

                                            ${esc(
                                                property.price ||
                                                "—"
                                            )}

                                        </td>


                                        <td>

                                            <span class="badge">

                                                ${esc(
                                                    property.status ||
                                                    "Listed"
                                                )}

                                            </span>

                                        </td>

                                    </tr>

                                `).join("")
                            }

                        </tbody>

                    </table>

                </div>
            `

            : `
                <div class="empty">
                    No properties found yet.
                </div>
            `;

}


/* =========================================================
   SIMPLE TABLE
========================================================= */

function renderSimple(
    target,
    list,
    fields
) {

    $(target).innerHTML = list.length

        ? `
            <div style="overflow:auto">

                <table>

                    <thead>

                        <tr>

                            ${
                                fields.map(field => `
                                    <th>
                                        ${esc(field)}
                                    </th>
                                `).join("")
                            }

                        </tr>

                    </thead>


                    <tbody>

                        ${
                            list.map(record => `

                                <tr>

                                    ${
                                        fields.map(field => `

                                            <td>

                                                ${esc(
                                                    (
                                                        field === "createdAt" ||
                                                        field === "date"
                                                    )

                                                    ? date(record[field])

                                                    : record[field] ?? "—"
                                                )}

                                            </td>

                                        `).join("")
                                    }

                                </tr>

                            `).join("")
                        }

                    </tbody>

                </table>

            </div>
        `

        : `
            <div class="empty">
                No records found yet.
            </div>
        `;

}


/* =========================================================
   PHOTOS
========================================================= */

function renderPhotos() {

    let photos =
        data.photos;


    /*
        If there is no separate photos
        collection, look inside properties.
    */

    if (!photos.length) {

        photos =
            data.properties.flatMap(property =>

                (property.photos || [])
                    .map(url => ({
                        url,
                        propertyId: property.id
                    }))

            );

    }


    $("photosTable").innerHTML = photos.length

        ? photos.map(photo => `

            <div class="media-card">

                <img
                    src="${esc(
                        photo.url ||
                        photo.photoURL
                    )}"
                >

                <div>

                    ${esc(
                        photo.propertyName ||
                        photo.propertyId ||
                        "Uploaded photo"
                    )}

                </div>

            </div>

        `).join("")

        : `
            <div class="empty">
                No uploaded photos found yet.
            </div>
        `;

}


/* =========================================================
   RECENT USERS + PROPERTIES
========================================================= */

function renderRecent() {

    const users =
        data.users
            .slice(-5)
            .reverse();


    const properties =
        data.properties
            .slice(-5)
            .reverse();


    /* RECENT USERS */

    $("recentUsers").innerHTML = users.length

        ? `
            <div style="overflow:auto">

                <table>

                    <tr>

                        <th>User</th>
                        <th>Role</th>
                        <th>Joined</th>

                    </tr>


                    ${
                        users.map(user => `

                            <tr data-user="${esc(user.id)}">

                                <td>

                                    <div class="person">

                                        ${avatar(user)}

                                        <b>
                                            ${esc(
                                                user.name ||
                                                "Unnamed"
                                            )}
                                        </b>

                                    </div>

                                </td>


                                <td>

                                    ${esc(
                                        user.accountType ||
                                        user.role ||
                                        "—"
                                    )}

                                </td>


                                <td>

                                    ${date(
                                        user.createdAt
                                    )}

                                </td>

                            </tr>

                        `).join("")
                    }

                </table>

            </div>
        `

        : `
            <div class="empty">
                No users yet.
            </div>
        `;


    /* RECENT PROPERTIES */

    $("recentProperties").innerHTML =
        properties.length

            ? `
                <div style="overflow:auto">

                    <table>

                        <tr>

                            <th>Property</th>
                            <th>Price</th>
                            <th>Status</th>

                        </tr>


                        ${
                            properties.map(property => `

                                <tr>

                                    <td>

                                        <b>

                                            ${esc(
                                                property.title ||
                                                property.name ||
                                                "Untitled"
                                            )}

                                        </b>


                                        <div class="muted">

                                            ${esc(
                                                property.location ||
                                                ""
                                            )}

                                        </div>

                                    </td>


                                    <td>

                                        ${esc(
                                            property.price ||
                                            "—"
                                        )}

                                    </td>


                                    <td>

                                        <span class="badge">

                                            ${esc(
                                                property.status ||
                                                "Listed"
                                            )}

                                        </span>

                                    </td>

                                </tr>

                            `).join("")
                        }

                    </table>

                </div>
            `

            : `
                <div class="empty">
                    No properties yet.
                </div>
            `;

}


/* =========================================================
   USER PROFILE DRAWER
========================================================= */

function showUser(id) {

    const user =
        data.users.find(
            item => item.id === id
        );


    if (!user) {
        return;
    }


    const properties =
        data.properties.filter(property =>

            [
                property.userId,
                property.ownerId,
                property.sellerId
            ].includes(id)

        );


    const inquiries =
        data.inquiries.filter(
            item => item.userId === id
        );


    const appointments =
        data.appointments.filter(
            item => item.userId === id
        );


    $("drawerContent").innerHTML = `

        <small>
            USER PROFILE
        </small>


        <div class="profile">

            ${avatar(user)}


            <div>

                <h2>

                    ${esc(
                        user.name ||
                        "Unnamed"
                    )}

                </h2>


                <p class="muted">

                    ${esc(
                        user.accountType ||
                        user.role ||
                        "User"
                    )}

                </p>

            </div>

        </div>


        <div class="details">


            <div class="detail">

                <small>
                    Email
                </small>

                <b>
                    ${esc(
                        user.email ||
                        "—"
                    )}
                </b>

            </div>


            <div class="detail">

                <small>
                    Phone
                </small>

                <b>
                    ${esc(
                        user.phone ||
                        "—"
                    )}
                </b>

            </div>


            <div class="detail">

                <small>
                    Status
                </small>

                <b>
                    ${esc(
                        user.status ||
                        "Active"
                    )}
                </b>

            </div>


            <div class="detail">

                <small>
                    Joined
                </small>

                <b>
                    ${date(
                        user.createdAt
                    )}
                </b>

            </div>


            <div class="detail">

                <small>
                    Properties
                </small>

                <b>
                    ${properties.length}
                </b>

            </div>


            <div class="detail">

                <small>
                    Inquiries
                </small>

                <b>
                    ${inquiries.length}
                </b>

            </div>


            <div class="detail">

                <small>
                    Appointments
                </small>

                <b>
                    ${appointments.length}
                </b>

            </div>

        </div>


        <h3>
            Profile data
        </h3>


        <div class="detail">

            <b>

                ${esc(
                    JSON.stringify(
                        user,
                        null,
                        2
                    )
                )}

            </b>

        </div>

    `;


    $("drawer")
        .classList
        .add("open");


    $("shade")
        .classList
        .remove("hidden");

}


/* =========================================================
   PAGE / SECTION NAVIGATION
========================================================= */

function section(sectionName) {

    document
        .querySelectorAll(".page")
        .forEach(page =>
            page.classList.add("hidden")
        );


    $(sectionName)
        .classList
        .remove("hidden");


    document
        .querySelectorAll(".nav")
        .forEach(nav => {

            nav.classList.toggle(
                "active",
                nav.dataset.section === sectionName
            );

        });


    $("title").textContent =
        sectionName[0].toUpperCase() +
        sectionName.slice(1);


    $("sidebar")
        .classList
        .remove("open");

}


/* =========================================================
   GLOBAL CLICK HANDLER
========================================================= */

document.addEventListener(
    "click",
    event => {

        /* Navigation */

        const nav =
            event.target.closest(
                "[data-section]"
            );


        if (nav) {

            section(
                nav.dataset.section
            );

        }


        /* Dashboard shortcuts */

        const go =
            event.target.closest(
                "[data-go]"
            );


        if (go) {

            section(
                go.dataset.go
            );

        }


        /* User profile */

        const user =
            event.target.closest(
                "[data-user]"
            );


        if (user) {

            showUser(
                user.dataset.user
            );

        }

    }
);


/* =========================================================
   SEARCH / FILTER
========================================================= */

document
    .querySelectorAll("[data-filter]")
    .forEach(input => {

        input.addEventListener(
            "input",
            () => {

                const box =
                    $(input.dataset.filter);


                const query =
                    input.value.toLowerCase();


                box
                    .querySelectorAll(
                        "tbody tr"
                    )
                    .forEach(row => {

                        row.style.display =
                            row.innerText
                                .toLowerCase()
                                .includes(query)

                                ? ""

                                : "none";

                    });

            }
        );

    });


/* =========================================================
   REFRESH
========================================================= */

$("refresh").onclick = load;


/* =========================================================
   MOBILE MENU
========================================================= */

$("menu").onclick = () => {

    $("sidebar")
        .classList
        .toggle("open");

};


/* =========================================================
   CLOSE PROFILE DRAWER
========================================================= */

$("closeDrawer").onclick = () => {

    $("drawer")
        .classList
        .remove("open");


    $("shade")
        .classList
        .add("hidden");

};


$("shade").onclick = () => {

    $("drawer")
        .classList
        .remove("open");


    $("shade")
        .classList
        .add("hidden");

};


/* =========================================================
   LOGOUT
========================================================= */

$("logout").onclick = async () => {

    await signOut(auth);

    location.href =
        "login.html";

};


/* =========================================================
   CHECK LOGIN
========================================================= */

onAuthStateChanged(
    auth,
    user => {

        if (!user) {

            location.href =
                "login.html";

            return;

        }


        $("email").textContent =
            user.email ||
            "Authenticated user";


        load();

    }
);