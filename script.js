let flashlightOn = false;
let subscribed = false;

let stream = null;
let track = null;

const onBtn = document.getElementById("onBtn");
const offBtn = document.getElementById("offBtn");

const status = document.getElementById("status");
const lightText = document.getElementById("lightText");
const circle = document.getElementById("circle");

const subscribeBtn = document.getElementById("subscribeBtn");

const subscription = document.getElementById("subscription");
const confirmSubscribe = document.getElementById("confirmSubscribe");
const closeSubscribe = document.getElementById("closeSubscribe");


// ========================================
// CHECK SAVED SUBSCRIPTION
// ========================================

const savedSubscription =
    localStorage.getItem("flashpay_subscription");

if (savedSubscription === "active") {
    subscribed = true;
}


// ========================================
// TURN FLASHLIGHT ON
// ========================================

onBtn.addEventListener("click", async () => {

    // Prevent pressing ON when already ON
    if (flashlightOn) {
        return;
    }

    try {

        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: {
                    ideal: "environment"
                }
            }
        });

        track = stream.getVideoTracks()[0];

        const capabilities = track.getCapabilities();

        if (!capabilities.torch) {

            alert(
                "Your device or browser does not support flashlight control."
            );

            stopCamera();

            return;
        }

        await track.applyConstraints({
            advanced: [
                {
                    torch: true
                }
            ]
        });

        flashlightOn = true;

        updateUI();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to access flashlight. Please allow camera permission."
        );
    }
});


// ========================================
// TURN FLASHLIGHT OFF
// ========================================

offBtn.addEventListener("click", async () => {

    // If flashlight isn't ON, do nothing
    if (!flashlightOn) {
        return;
    }

    // If user hasn't paid
    if (!subscribed) {

        subscription.classList.add("show");

        return;
    }

    // Paid user can turn OFF
    await turnOffFlashlight();
});


// ========================================
// TURN OFF FLASHLIGHT
// ========================================

async function turnOffFlashlight() {

    try {

        if (track) {

            await track.applyConstraints({
                advanced: [
                    {
                        torch: false
                    }
                ]
            });
        }

    } catch (error) {

        console.error(error);
    }

    stopCamera();

    flashlightOn = false;

    updateUI();
}


// ========================================
// STOP CAMERA
// ========================================

function stopCamera() {

    if (stream) {

        stream.getTracks().forEach(track => {
            track.stop();
        });

        stream = null;
        track = null;
    }
}


// ========================================
// UPDATE BUTTONS AND UI
// ========================================

function updateUI() {

    if (flashlightOn) {

        // -----------------------------
        // FLASHLIGHT IS ON
        // -----------------------------

        status.textContent = "ON";

        lightText.textContent =
            "Flashlight is ON";

        circle.classList.add("active");


        // TURN ON MUST BE DISABLED
        onBtn.disabled = true;

        onBtn.textContent = "🔆 FLASHLIGHT ON";


        // OFF DEPENDS ON PAYMENT
        if (subscribed) {

            offBtn.disabled = false;

            offBtn.textContent = "🔆 TURN OFF";

            offBtn.classList.remove("locked");

        } else {

            offBtn.disabled = true;

            offBtn.textContent = "🔒 SUBSCRIBE TO TURN OFF";

            offBtn.classList.add("locked");
        }

    } else {

        // -----------------------------
        // FLASHLIGHT IS OFF
        // -----------------------------

        status.textContent = "OFF";

        lightText.textContent =
            "Flashlight is OFF";

        circle.classList.remove("active");


        // TURN ON ENABLED
        onBtn.disabled = false;

        onBtn.textContent = "🔆 TURN ON";


        // OFF IS ALWAYS DISABLED WHEN LIGHT IS OFF
        offBtn.disabled = true;

        offBtn.textContent = "🔒 TURN OFF";

        offBtn.classList.add("locked");
    }
}


// ========================================
// OPEN SUBSCRIPTION
// ========================================

subscribeBtn.addEventListener("click", () => {

    subscription.classList.add("show");
});


// ========================================
// CLOSE SUBSCRIPTION
// ========================================

closeSubscribe.addEventListener("click", () => {

    subscription.classList.remove("show");
});


// ========================================
// DEMO PAYMENT
// ========================================

confirmSubscribe.addEventListener("click", () => {

    /*
        DEMO PAYMENT ONLY.

        This simulates a successful subscription.

        A REAL APP needs a payment provider
        and server-side subscription verification.
    */

    subscribed = true;

    localStorage.setItem(
        "flashpay_subscription",
        "active"
    );

    subscription.classList.remove("show");

    // Immediately enable OFF
    updateUI();

    alert(
        "Subscription activated! TURN OFF is now unlocked."
    );
});


// ========================================
// INITIAL UI
// ========================================

updateUI();
