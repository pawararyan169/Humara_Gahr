import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc,
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

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const toggleButton =
    document.getElementById("toggle");

const googleButton =
    document.getElementById("googleLogin");

const demoButton =
    document.getElementById("demo");

const forgotPassword =
    document.getElementById("forgotPassword");

const statusBox =
    document.getElementById("status");


/* =====================================================
   GOOGLE PROVIDER
===================================================== */

const googleProvider =
    new GoogleAuthProvider();

googleProvider.setCustomParameters(
    {
        prompt: "select_account"
    }
);


/* =====================================================
   STATUS
===================================================== */

function setStatus(
    message,
    type = "normal"
) {

    if (!statusBox) {
        return;
    }


    statusBox.textContent =
        message;


    if (type === "error") {

        statusBox.style.color =
            "#b42318";

    } else if (type === "success") {

        statusBox.style.color =
            "#28743c";

    } else {

        statusBox.style.color =
            "#77736b";

    }

}


/* =====================================================
   REDIRECT CURRENT USER
===================================================== */

async function redirectUser(user) {

    try {

        /*
         * IMPORTANT:
         *
         * We use THIS user's UID.
         *
         * Not Aryan's.
         * Not another user's.
         */

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const userSnapshot =
            await getDoc(userRef);


        /* ---------------------------------------------
           USER PROFILE EXISTS
        --------------------------------------------- */

        if (userSnapshot.exists()) {

            const userData =
                userSnapshot.data();


            const accountType =
                userData.accountType;


            if (accountType === "seller") {

                window.location.href =
                    "seller.html";

                return;
            }


            if (accountType === "renter") {

                window.location.href =
                    "renter.html";

                return;
            }


            if (accountType === "buyer") {

                window.location.href =
                    "buyer.html";

                return;
            }


            if (accountType === "admin") {

                window.location.href =
                    "admin.html";

                return;
            }

        }


        /* ---------------------------------------------
           PROFILE DOESN'T EXIST

           This can happen if a Google account
           authenticated but its Firestore profile
           hasn't been created yet.
        --------------------------------------------- */

        const googleName =
            user.displayName || "";


        await setDoc(
            userRef,
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

                email: user.email || "",

                phone: "",

                accountType: "buyer",

                photoURL:
                    user.photoURL || "",

                provider: "google",

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            },
            {
                merge: true
            }
        );


        window.location.href =
            "buyer.html";


    } catch (error) {

        console.error(
            "Profile redirect error:",
            error
        );


        setStatus(
            "Login succeeded, but your profile could not be loaded.",
            "error"
        );

    }

}


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


                /*
                 * Firebase has now authenticated
                 * THIS specific user.
                 */

                const user =
                    result.user;


                setStatus(
                    "Login successful. Redirecting...",
                    "success"
                );


                await redirectUser(user);


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                let message =
                    "Unable to sign in. Please try again.";


                if (
                    error.code ===
                    "auth/invalid-credential"
                ) {

                    message =
                        "Incorrect email or password.";

                } else if (
                    error.code ===
                    "auth/user-not-found"
                ) {

                    message =
                        "No account exists with this email.";

                } else if (
                    error.code ===
                    "auth/wrong-password"
                ) {

                    message =
                        "Incorrect password.";

                } else if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    message =
                        "Please enter a valid email address.";

                } else if (
                    error.code ===
                    "auth/too-many-requests"
                ) {

                    message =
                        "Too many attempts. Please try again later.";

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

            setStatus(
                "Opening Google sign in..."
            );


            try {

                const result =
                    await signInWithPopup(
                        auth,
                        googleProvider
                    );


                /*
                 * This is the Google account
                 * that was just selected.
                 */

                const user =
                    result.user;


                console.log(
                    "Google user:",
                    user.displayName
                );

                console.log(
                    "Google email:",
                    user.email
                );

                console.log(
                    "Firebase UID:",
                    user.uid
                );


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
                        "Google sign in was cancelled."
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

                passwordInput.type =
                    "text";

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