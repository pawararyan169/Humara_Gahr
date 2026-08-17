import {
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


/* =====================================================
   ELEMENTS
===================================================== */

const signupForm = document.getElementById("signupForm");

const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");

const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");

const passwordInput = document.getElementById("password");

const accountTypeInput =
    document.getElementById("accountType");

const termsInput =
    document.getElementById("terms");

const signupMessage =
    document.getElementById("signupMessage");

const togglePassword =
    document.getElementById("togglePassword");

const googleSignup =
    document.getElementById("googleSignup");


/* =====================================================
   MESSAGE
===================================================== */

function showMessage(message, type = "error") {

    if (!signupMessage) {
        return;
    }

    signupMessage.textContent = message;

    if (type === "success") {

        signupMessage.style.color = "#287a45";

    } else {

        signupMessage.style.color = "#b33a3a";

    }
}


/* =====================================================
   PASSWORD TOGGLE
===================================================== */

if (togglePassword && passwordInput) {

    togglePassword.addEventListener(
        "click",
        () => {

            if (passwordInput.type === "password") {

                passwordInput.type = "text";

                togglePassword.textContent = "Hide";

            } else {

                passwordInput.type = "password";

                togglePassword.textContent = "Show";

            }

        }
    );

}


/* =====================================================
   NORMAL EMAIL SIGNUP
===================================================== */

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const firstName =
                firstNameInput.value.trim();

            const lastName =
                lastNameInput.value.trim();

            const email =
                emailInput.value.trim();

            const phone =
                phoneInput.value.trim();

            const password =
                passwordInput.value;

            const accountType =
                accountTypeInput.value;


            /* ---------------------------------------------
               VALIDATION
            --------------------------------------------- */

            if (!firstName || !lastName) {

                showMessage(
                    "Please enter your first and last name."
                );

                return;
            }


            if (!email) {

                showMessage(
                    "Please enter your email address."
                );

                return;
            }


            if (!accountType) {

                showMessage(
                    "Please select what you want to do."
                );

                return;
            }


            if (!termsInput.checked) {

                showMessage(
                    "Please accept the Terms of Service and Privacy Policy."
                );

                return;
            }


            if (password.length < 6) {

                showMessage(
                    "Password must contain at least 6 characters."
                );

                return;
            }


            try {

                showMessage(
                    "Creating your account...",
                    "success"
                );


                /* -----------------------------------------
                   CREATE FIREBASE ACCOUNT
                ----------------------------------------- */

                const credential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    credential.user;


                /* -----------------------------------------
                   FULL NAME
                ----------------------------------------- */

                const fullName =
                    `${firstName} ${lastName}`.trim();


                /* -----------------------------------------
                   FIREBASE AUTH PROFILE
                ----------------------------------------- */

                await updateProfile(
                    user,
                    {
                        displayName: fullName
                    }
                );


                /* -----------------------------------------
                   EMAIL VERIFICATION
                ----------------------------------------- */

                await sendEmailVerification(user);


                /* -----------------------------------------
                   FIRESTORE USER PROFILE

                   Document ID = Firebase UID
                ----------------------------------------- */

                await setDoc(
                    doc(
                        db,
                        "users",
                        user.uid
                    ),
                    {

                        uid: user.uid,

                        firstName: firstName,

                        lastName: lastName,

                        fullName: fullName,

                        email: user.email,

                        phone: phone,

                        accountType: accountType,

                        photoURL: "",

                        provider: "password",

                        createdAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()

                    }
                );


                showMessage(
                    "Account created! We sent a verification email to your inbox.",
                    "success"
                );


                setTimeout(
                    () => {

                        window.location.href =
                            "verify-email.html";

                    },
                    1200
                );


            } catch (error) {

                console.error(
                    "Signup error:",
                    error
                );

                handleFirebaseError(error);

            }

        }
    );

}


/* =====================================================
   GOOGLE SIGNUP
===================================================== */

if (googleSignup) {

    googleSignup.addEventListener(
        "click",
        async () => {

            try {

                googleSignup.disabled = true;

                googleSignup.style.opacity = "0.6";


                showMessage(
                    "Opening Google sign in...",
                    "success"
                );


                /* -----------------------------------------
                   GOOGLE PROVIDER
                ----------------------------------------- */

                const provider =
                    new GoogleAuthProvider();


                provider.setCustomParameters(
                    {
                        prompt: "select_account"
                    }
                );


                /* -----------------------------------------
                   GOOGLE POPUP
                ----------------------------------------- */

                const result =
                    await signInWithPopup(
                        auth,
                        provider
                    );


                const user =
                    result.user;


                /* -----------------------------------------
                   GET NAME DIRECTLY FROM GOOGLE/FIREBASE

                   NEVER hardcode a name.
                ----------------------------------------- */

                const googleName =
                    user.displayName || "";


                const googleEmail =
                    user.email || "";


                const googlePhoto =
                    user.photoURL || "";


                /* -----------------------------------------
                   DEFAULT ACCOUNT TYPE

                   Google signup currently doesn't have
                   the buyer/renter/seller selection.

                   We use buyer here.
                ----------------------------------------- */

                const accountType =
                    "buyer";


                /* -----------------------------------------
                   CREATE/UPDATE USER DOCUMENT

                   users/{Firebase UID}
                ----------------------------------------- */

                await setDoc(
                    doc(
                        db,
                        "users",
                        user.uid
                    ),
                    {

                        uid: user.uid,

                        fullName: googleName,

                        firstName:
                            googleName
                                ? googleName
                                    .trim()
                                    .split(/\s+/)[0]
                                : "",

                        lastName:
                            googleName
                                ? googleName
                                    .trim()
                                    .split(/\s+/)
                                    .slice(1)
                                    .join(" ")
                                : "",

                        email: googleEmail,

                        phone: "",

                        accountType: accountType,

                        photoURL: googlePhoto,

                        provider: "google",

                        updatedAt:
                            serverTimestamp()

                    },
                    {
                        merge: true
                    }
                );


                showMessage(
                    "Google account connected. Redirecting...",
                    "success"
                );


                setTimeout(
                    () => {

                        window.location.href =
                            "buyer.html";

                    },
                    700
                );


            } catch (error) {

                console.error(
                    "Google signup error:",
                    error
                );


                if (
                    error.code ===
                    "auth/popup-closed-by-user"
                ) {

                    showMessage(
                        "Google sign up was cancelled."
                    );

                } else {

                    handleFirebaseError(error);

                }

            } finally {

                googleSignup.disabled = false;

                googleSignup.style.opacity = "1";

            }

        }
    );

}


/* =====================================================
   FIREBASE ERROR HANDLER
===================================================== */

function handleFirebaseError(error) {

    let message =
        "Something went wrong. Please try again.";


    switch (error.code) {

        case "auth/email-already-in-use":

            message =
                "This email is already registered. Please sign in.";

            break;


        case "auth/invalid-email":

            message =
                "Please enter a valid email address.";

            break;


        case "auth/weak-password":

            message =
                "Password is too weak. Use at least 6 characters.";

            break;


        case "auth/network-request-failed":

            message =
                "Network error. Please check your internet connection.";

            break;


        case "auth/popup-blocked":

            message =
                "Your browser blocked the Google popup. Please allow popups.";

            break;


        case "auth/popup-closed-by-user":

            message =
                "Google sign up was cancelled.";

            break;


        case "permission-denied":

        case "firestore/permission-denied":

            message =
                "Firebase database permissions are preventing this signup.";

            break;

    }


    showMessage(message);

}