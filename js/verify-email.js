import {
    onAuthStateChanged,
    sendEmailVerification,
    reload,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


/* =====================================================
   ELEMENTS
===================================================== */

const userEmail = document.getElementById("userEmail");
const message = document.getElementById("message");
const checkVerification = document.getElementById("checkVerification");
const resendEmail = document.getElementById("resendEmail");
const logout = document.getElementById("logout");


/* =====================================================
   CURRENT USER
===================================================== */

let currentUser = null;


/* =====================================================
   MESSAGE HELPER
===================================================== */

function showMessage(text, type = "normal") {

    if (!message) return;

    message.textContent = text;

    if (type === "success") {

        message.style.color = "#287a45";

    } else if (type === "error") {

        message.style.color = "#b33a3a";

    } else {

        message.style.color = "#77736b";

    }
}


/* =====================================================
   CHECK AUTH STATE
===================================================== */

onAuthStateChanged(auth, (user) => {

    console.log("VERIFY PAGE USER:", user);

    if (!user) {

        window.location.href = "login.html";

        return;
    }


    currentUser = user;


    if (userEmail) {

        userEmail.textContent =
            user.email || "";

    }

});


/* =====================================================
   CHECK EMAIL VERIFICATION
===================================================== */

if (checkVerification) {

    checkVerification.addEventListener(
        "click",
        async () => {

            if (!currentUser) {

                showMessage(
                    "Please wait while your account is loading.",
                    "error"
                );

                return;
            }


            try {

                showMessage(
                    "Checking your email verification..."
                );


                /* -----------------------------------------
                   Refresh Firebase user's information
                ----------------------------------------- */

                await reload(currentUser);


                /*
                 * Important:
                 * reload() refreshes the Firebase Auth user.
                 * Get the latest user object again.
                 */

                const refreshedUser = auth.currentUser;


                console.log(
                    "EMAIL VERIFIED:",
                    refreshedUser?.emailVerified
                );


                /* -----------------------------------------
                   EMAIL NOT VERIFIED
                ----------------------------------------- */

                if (!refreshedUser?.emailVerified) {

                    showMessage(
                        "Your email is not verified yet. Please click the verification link in your email.",
                        "error"
                    );

                    return;
                }


                /* -----------------------------------------
                   EMAIL VERIFIED
                ----------------------------------------- */

                showMessage(
                    "Email verified! Setting up your account...",
                    "success"
                );


                console.log(
                    "Verified Firebase UID:",
                    refreshedUser.uid
                );


                /* -----------------------------------------
                   GET USER PROFILE FROM FIRESTORE
                   
                   IMPORTANT:
                   We use:
                   
                   doc(db, "users", UID)
                   
                   NOT collection().
                ----------------------------------------- */

                const userRef = doc(
                    db,
                    "users",
                    refreshedUser.uid
                );


                const userSnap =
                    await getDoc(userRef);


                let accountType = "buyer";


                if (userSnap.exists()) {

                    const userData =
                        userSnap.data();


                    console.log(
                        "Verified user's Firestore profile:",
                        userData
                    );


                    accountType =
                        userData.accountType ||
                        "buyer";

                } else {

                    console.warn(
                        "No Firestore profile found for UID:",
                        refreshedUser.uid
                    );

                }


                console.log(
                    "ACCOUNT TYPE:",
                    accountType
                );


                /* -----------------------------------------
                   REDIRECT
                ----------------------------------------- */

                setTimeout(() => {

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


                    if (accountType === "admin") {

                        window.location.href =
                            "admin.html";

                        return;
                    }


                    /* Default */

                    window.location.href =
                        "buyer.html";

                }, 800);


            } catch (error) {

                console.error(
                    "Verification error:",
                    error
                );


                showMessage(
                    "Could not check verification status. Please try again.",
                    "error"
                );

            }

        }
    );

}


/* =====================================================
   RESEND VERIFICATION EMAIL
===================================================== */

if (resendEmail) {

    resendEmail.addEventListener(
        "click",
        async () => {

            if (!currentUser) {

                showMessage(
                    "Please wait while your account is loading.",
                    "error"
                );

                return;
            }


            try {

                await sendEmailVerification(
                    currentUser
                );


                showMessage(
                    "Verification email sent again. Check your inbox.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Resend verification error:",
                    error
                );


                if (
                    error.code ===
                    "auth/too-many-requests"
                ) {

                    showMessage(
                        "Too many requests. Please wait a little before trying again.",
                        "error"
                    );

                } else {

                    showMessage(
                        "Could not send the verification email. Please try again.",
                        "error"
                    );

                }

            }

        }
    );

}


/* =====================================================
   LOGOUT
===================================================== */

if (logout) {

    logout.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                window.location.href =
                    "login.html";

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                showMessage(
                    "Unable to sign out. Please try again.",
                    "error"
                );

            }

        }
    );

}