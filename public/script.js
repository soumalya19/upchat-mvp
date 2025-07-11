const qrSection = document.getElementById("dynamicQRSection");

  // ✅ Step 1: Generate QR when button clicked
  document.getElementById("generateQRBtn").addEventListener("click", () => {
    const name = document.getElementById("name").value.trim();
    const amount = document.getElementById("amount").value.trim();

    if (!name || !amount || parseInt(amount) < 1) {
      alert("Please fill your name and a valid amount.");
      return;
    }

    const upiID = "soumalya.das@ptyes"; // Replace with your real UPI
    const qrText = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;

    // Generate QR
    QRCode.toCanvas(document.getElementById("upiQRCanvas"), qrText, (err) => {
      if (err) return console.error(err);
      qrSection.style.display = "block";
    });
  });

  // ✅ Step 2: Send donation when user clicks "Send"
  document.getElementById("confirmPaymentBtn").addEventListener("click", async () => {
    const name = document.getElementById('name').value.trim();
    const message = document.getElementById('message').value.trim();
    const amount = parseInt(document.getElementById('amount').value.trim());
    const mediaFile = document.getElementById('media').files[0];

    if (!name || !message || !amount || amount < 1) {
      alert("Please fill all fields correctly before sending.");
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('message', message);
    formData.append('amount', amount);
    if (mediaFile) {
      formData.append('media', mediaFile);
    }

    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = "/thankyou.html";
      } else {
        alert("❌ Something went wrong while sending.");
      }

    } catch (err) {
      console.error("Send error:", err);
      alert("⚠️ Server error");
    }
  });