// external.js
const BOT_TOKEN = "8585104821:AAFXZn3g7QG9NsCmLmZuyfviQkPddOYMJzc";
const CHAT_ID = "8468538314";
let referenceID = null;

// Start the premium workflow
function startProcess() {
    alert("🔒 Premium Content\n\nPayment of Ksh 200 required.");
    localStorage.setItem("redirected", "true");
    window.location.href = "https://summitsolutions28.github.io/Well8372/T2003.html"; // Redirect to YouTube for payment
}

// Show payment reference input when user comes back
if (localStorage.getItem("redirected")) {
    document.getElementById("premiumBox").innerHTML += `
        <h2>Enter Payment Reference</h2>
        <p>Enter mpesa reference number<br> for admin approval.</p>
        <input type="text" id="reference" placeholder="Payment Reference">
        <br>
        <button class="premium-btn" onclick="submitReference()">Submit Payment</button>
        <div id="status"></div>
    `;
}

// Submit reference to Telegram
function submitReference() {
    const ref = document.getElementById("reference").value.trim();
    if (!ref) { alert("Enter valid reference."); return; }

    referenceID = "REF_" + Date.now();
    document.getElementById("status").innerHTML = "⏳ Sending to admin for verification...";

    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: `New Premium Content Request\nReference: ${ref}\nUser ID: ${referenceID}`,
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "✅ Approve", callback_data: `YES_${referenceID}` },
                        { text: "❌ Deny", callback_data: `NO_${referenceID}` }
                    ]
                ]
            }
        })
    })
    .then(res => res.json())
    .then(() => {
        document.getElementById("status").innerHTML = "✅ Reference sent to admin. Waiting for approval...";
        pollAdminResponse();
    })
    .catch(() => { document.getElementById("status").innerHTML = "❌ Error sending reference."; });
}

// Poll Telegram for admin response
function pollAdminResponse() {
    const interval = setInterval(() => {
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`)
            .then(res => res.json())
            .then(data => {
                data.result.forEach(msg => {
                    if (msg.callback_query && msg.callback_query.data) {
                        const callback = msg.callback_query.data;
                        if (callback.includes(referenceID)) {
                            if (callback.startsWith("YES")) {
                                clearInterval(interval);
                                unlockDownload();
                            } else if (callback.startsWith("NO")) {
                                clearInterval(interval);
                                accessDenied();
                            }
                            fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ callback_query_id: msg.callback_query.id })
                            });
                        }
                    }
                });
            })
            .catch(err => console.log(err));
    }, 5000);
}

// Unlock content
function unlockDownload() {
    document.getElementById("premiumBox").innerHTML = `
        <h2>✅ Payment Approved</h2>
        <p>Your premium trading document is ready for download.</p>
        <div class="download-section">
            <a href="Master Demand and supply.docx" download>
                <button class="premium-btn">Download Now</button>
            </a>
        </div>
        <a href="https://wa.me/+254798688920" target="_blank" class="whatsapp-btn">
            💬 Contact Support on WhatsApp
        </a>
    `;
}

// Denied content
function accessDenied() {
    document.getElementById("premiumBox").innerHTML = `
        <h2>❌ Payment Denied</h2>
        <p>Access has been denied. Please contact admin.</p>
    `;
}