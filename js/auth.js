import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


/* =====================================================
   ELEMENTS
===================================================== */

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const toggleButton = document.getElementById("toggle");
const googleButton = document.getElementById("googleLogin");
const demoButton = document.getElementById("demo");
const forgotPassword = document.getElementById("forgotPassword");

const statusBox = document.getElementById("status");


/* =====================================================
   GOOGLE PROVIDER
===================================================== */

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});


/* =====================================================
   STATUS MESSAGE
===================================================== */

function setStatus(message, type = "normal") {

    if (!statusBox) return;

    statusBox.textContent = message;

    if (type === "error") {

        statusBox.style.color = "#b42318";

    } else if (type === "success") {

        statusBox.style.color = "#28743c";

    } else {

        statusBox.style.color = "#77736b";

    }
}


/* =====================================================
   REDIRECT CURRENT USER
===================================================== */

async function redirectUser(user) {

    if (!user) {
        return;
    }

    console.log("CURRENT FIREBASE USER:", user);
    console.log("CURRENT USER UID:", user.uid);


    try {

        /*
         * IMPORTANT:
         *
         * The Firestore document is fetched using
         * THIS user's Firebase UID.
         *
         * users/{user.uid}
         */

        const userRef = doc(
            db,
            "users",
            user.uid
        );

        const userSnapshot = await getDoc(userRef);


        /* =============================================
           PROFILE EXISTS
        ============================================= */

        if (userSnapshot.exists()) {

            const userData = userSnapshot.data();

            console.log(
                "CURRENT USER FIRESTORE DATA:",
                userData
            );


            const accountType =
                userData.accountType;


            /* SELLER */

            if (accountType === "seller") {

                window.location.replace(
                    "seller.html"
                );

                return;
            }


            /* RENTER */

            if (accountType === "renter") {

                window.location.replace(
                    "renter.html"
                );

                return;
            }


            /* ADMIN */

            if (accountType === "admin") {

                window.location.replace(
                    "admin.html"
                );

                return;
            }


            /* BUYER */

            if (accountType === "buyer") {

                window.location.replace(
                    "buyer.html"
                );

                return;
            }

        }


        /* =============================================
           PROFILE DOES NOT EXIST
        ============================================= */

        console.log(
            "No Firestore profile found. Creating one..."
        );


        const displayName =
            user.displayName ||
            user.email?.split("@")[0] ||
            "User";


        await setDoc(
            userRef,
            {

                uid: user.uid,

                fullName: displayName,

                email: user.email || "",

                phone: "",

                accountType: "buyer",

                photoURL: user.photoURL || "",

                provider: "google",

                createdAt: serverTimestamp(),

                updatedAt: serverTimestamp()

            },
            {
                merge: true
            }
        );


        window.location.replace(
            "buyer.html"
        );


    } catch (error) {

        console.error(
            "Redirect/profile error:",
            error
        );

        setStatus(
            "Login successful, but your profile could not be loaded.",
            "error"
        );

    }

}


/* =====================================================
   IMPORTANT:
   KEEP LOGGED-IN USER OUT OF LOGIN PAGE
===================================================== */

onAuthStateChanged(
    auth,
    async (user) => {

        /*
         * If there is NO user:
         *
         * Stay on login page.
         */

        if (!user) {

            console.log(
                "No logged-in user. Login page available."
            );

            return;
        }


        /*
         * USER IS ALREADY LOGGED IN.
         *
         * This is the important part.
         *
         * If the user presses browser Back and
         * reaches login.html again, this listener
         * fires and sends them back to their dashboard.
         */

        console.log(
            "User already logged in. Redirecting..."
        );


        setStatus(
            "You are already signed in. Redirecting...",
            "success"
        );


        await redirectUser(user);

    }
);


/* =====================================================
   EMAIL / PASSWORD LOGIN
===================================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            if (!email || !password) {

                setStatus(
                    "Please enter your email and password.",
                    "error"
                );

                return;
            }


            setStatus(
                "Signing you in..."
            );


            try {

                const result =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                console.log(
                    "LOGIN SUCCESS:",
                    result.user
                );


                /*
                 * Email verification check.
                 */

                if (!result.user.emailVerified) {

                    setStatus(
                        "Please verify your email before continuing.",
                        "error"
                    );

                    window.location.replace(
                        "verify-email.html"
                    );

                    return;
                }


                setStatus(
                    "Login successful. Redirecting...",
                    "success"
                );


                await redirectUser(
                    result.user
                );


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                let message =
                    "Unable to sign in. Please try again.";


                switch (error.code) {

                    case "auth/invalid-credential":

                        message =
                            "Incorrect email or password.";

                        break;


                    case "auth/user-not-found":

                        message =
                            "No account exists with this email.";

                        break;


                    case "auth/wrong-password":

                        message =
                            "Incorrect password.";

                        break;


                    case "auth/invalid-email":

                        message =
                            "Please enter a valid email address.";

                        break;


                    case "auth/too-many-requests":

                        message =
                            "Too many attempts. Please try again later.";

                        break;


                    case "auth/network-request-failed":

                        message =
                            "Network error. Check your internet connection.";

                        break;

                }


                setStatus(
                    message,
                    "error"
                );

            }

        }
    );

}


/* =====================================================
   GOOGLE LOGIN
===================================================== */

if (googleButton) {

    googleButton.addEventListener(
        "click",
        async () => {

            googleButton.disabled = true;

            setStatus(
                "Opening Google sign in..."
            );


            try {

                const result =
                    await signInWithPopup(
                        auth,
                        googleProvider
                    );


                const user =
                    result.user;


                console.log(
                    "GOOGLE LOGIN USER:",
                    user
                );


                /*
                 * Google accounts are normally
                 * already email verified.
                 */

                setStatus(
                    "Google login successful. Redirecting...",
                    "success"
                );


                await redirectUser(user);


            } catch (error) {

                console.error(
                    "Google login error:",
                    error
                );


                if (
                    error.code ===
                    "auth/popup-closed-by-user"
                ) {

                    setStatus(
                        "Google sign in was cancelled.",
                        "error"
                    );

                    return;
                }


                if (
                    error.code ===
                    "auth/popup-blocked"
                ) {

                    setStatus(
                        "Your browser blocked the Google popup. Allow popups and try again.",
                        "error"
                    );

                    return;
                }


                if (
                    error.code ===
                    "auth/account-exists-with-different-credential"
                ) {

                    setStatus(
                        "An account already exists with this email using another sign-in method.",
                        "error"
                    );

                    return;
                }


                setStatus(
                    "Google sign in failed. Please try again.",
                    "error"
                );

            } finally {

                googleButton.disabled = false;

            }

        }
    );

}


/* =====================================================
   SHOW / HIDE PASSWORD
===================================================== */

if (toggleButton) {

    toggleButton.addEventListener(
        "click",
        () => {

            if (
                passwordInput.type ===
                "password"
            ) {

                passwordInput.type = "text";

                toggleButton.textContent =
                    "Hide";

            } else {

                passwordInput.type =
                    "password";

                toggleButton.textContent =
                    "Show";

            }

        }
    );

}


/* =====================================================
   DEMO ACCOUNT
===================================================== */

if (demoButton) {

    demoButton.addEventListener(
        "click",
        () => {

            emailInput.value =
                "aryan@humaragar.com";

            passwordInput.value =
                "Humara@2026";


            setStatus(
                "Demo credentials filled. Click Sign in."
            );

        }
    );

}


/* =====================================================
   FORGOT PASSWORD
===================================================== */

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();


            const email =
                emailInput.value.trim();


            if (!email) {

                setStatus(
                    "Enter your email address first.",
                    "error"
                );

                emailInput.focus();

                return;
            }


            setStatus(
                "Sending password reset email..."
            );


            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );


                setStatus(
                    "Password reset email sent. Check your inbox.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Password reset error:",
                    error
                );


                if (
                    error.code ===
                    "auth/user-not-found"
                ) {

                    setStatus(
                        "No account exists with this email.",
                        "error"
                    );

                } else if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    setStatus(
                        "Please enter a valid email address.",
                        "error"
                    );

                } else {

                    setStatus(
                        "Unable to send password reset email.",
                        "error"
                    );

                }

            }

        }
    );

}