document.addEventListener("DOMContentLoaded", function () {
  let event = {
    title: "Introduction to Cyber Attacks",
    date: new Date("2025-05-15T19:00:00"), // Adjust your event date/time here
    link: "https://calendar.app.google/Uas6NuqhVGtgV6Vz9"
  };

  let now = new Date();
  let popup = document.getElementById("eventPopup");
  let titleEl = document.getElementById("eventTitle");
  let messageEl = document.getElementById("eventMessage");
  let linkEl = document.getElementById("eventLink");
  let reminderBtn = document.getElementById("setReminder");

  let timeDiff = event.date - now;
  let hoursLeft = timeDiff / (1000 * 60 * 60);
  let minutesLeft = timeDiff / (1000 * 60);

  titleEl.innerText = "Shield Maidens 2024!";

  // Display popup if event is in the future
  if (!event || event.date < now) {
    messageEl.innerText = "There are no upcoming events at this time.";
    linkEl.style.display = "none";
    reminderBtn.style.display = "none";
  } else {
    // Detect 1-day-before message
    if (hoursLeft <= 48 && now.getDate() !== event.date.getDate()) {
      messageEl.innerText = "🚨 Just a day to go! Set a reminder so you don’t miss it.";
      reminderBtn.style.display = "block";
      linkEl.style.display = "none";

    } else if (hoursLeft <= 24) {
      messageEl.innerText = "Join us later today for an exciting session!";
      reminderBtn.style.display = "none";

      if (event.link) {
        linkEl.style.display = "block";
        linkEl.href = event.link;
        linkEl.innerText = "Join Now";
      } else {
        linkEl.style.display = "none";
      }

    } else {
      messageEl.innerText = "We have an exciting session coming up. Stay tuned!";
      reminderBtn.style.display = "block";
      linkEl.style.display = "none";
    }
  }

  // Show popup box
  popup.style.display = "block";

  // If reminder already set, and it’s within 30 minutes, trigger a notification
  if (localStorage.getItem("eventReminder") === "set" && minutesLeft <= 30 && minutesLeft > 0) {
    sendReminderNotification("Your Shield Maidens session starts in 30 minutes! Be ready.");
    localStorage.removeItem("eventReminder"); // clear reminder after showing
  }
});

// Close popup
function closePopup() {
  document.getElementById("eventPopup").style.display = "none";
}

// Set reminder and store in localStorage
function setReminder() {
  alert("Reminder set! We'll notify you 30 minutes before the session.");
  localStorage.setItem("eventReminder", "set");
}

// Notification trigger
function sendReminderNotification(message) {
  if (Notification.permission === "granted") {
    new Notification(message);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(message);
      }
    });
  }
}


  
const carousel = document.querySelector('.session-carousel');
carousel.innerHTML += carousel.innerHTML; // Duplicate for seamless scroll

  
  
  // Events page
  document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var today = new Date().toISOString().split('T')[0];
  
    var events = [
      { title: 'Training on Internet Safety', start: '2025-04-24', description: 'Amazon Leadership Initiative for Girls in ICT Day' },
      { title: 'Cyber Security Talk', start: '2024-12-15', description: 'Session at Gifted Community Centre' },
      { title: 'Hour of Code Launch', start: '2024-11-30', description: 'Event at Pharo School Nairobi' }
    ];
  
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      selectable: true,
      events: events,
      eventClick: function(info) {
        alert(info.event.title + "\n" + info.event.start.toDateString() + "\n" + info.event.extendedProps.description);
      }
    });
  
    calendar.render();
  
    // Categorize events into Upcoming and Past
    var upcomingList = document.getElementById('upcoming-events-list');
    var pastList = document.getElementById('past-events-list');
  
    events.forEach(event => {
      let eventDate = new Date(event.start);
      let eventItem = `<li><strong>${event.title}</strong> - ${eventDate.toDateString()}<br>${event.description}</li>`;
  
      if (event.start >= today) {
        upcomingList.innerHTML += eventItem;
      } else {
        pastList.innerHTML += eventItem;
      }
    });
  });
  
  function showContactAlert() {
    alert("Thanks for your interest! Please email us at: shi3ldmaidens@gmail.com and we’ll get back to you shortly.");
  }
  
  // Donate Page
// Donate Page
document.addEventListener("DOMContentLoaded", () => {
  const amountButtons = document.querySelectorAll(".amount-btn");
  const customAmount = document.getElementById("customAmount");
  const finalAmount = document.getElementById("finalAmount");
  const summaryText = document.getElementById("summaryText");
  const form = document.getElementById("donationForm");

  function updateAmount(amount) {
    finalAmount.value = amount;
    summaryText.innerHTML = `Selected donation: <strong>KES ${parseInt(amount).toLocaleString()}</strong>`;
  }

  // Update amount when a preset button is clicked
  amountButtons.forEach(button => {
    button.addEventListener("click", () => {
      amountButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      customAmount.value = "";
      updateAmount(button.dataset.amount);
    });
  });

  // Update amount when custom amount is entered
  customAmount.addEventListener("input", () => {
    amountButtons.forEach(btn => btn.classList.remove("active"));
    let value = parseInt(customAmount.value);
    if (!isNaN(value) && value > 0) {
      updateAmount(value);
    } else {
      updateAmount(0);
    }
  });

  // Handle form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // ❌ STOP form from submitting normally

    // Check if a valid amount is entered
    if (!finalAmount.value || parseInt(finalAmount.value) <= 0) {
      alert("❌ Please select or enter a valid donation amount.");
      return;
    }

    // Validate other fields
    const firstName = document.querySelector('input[name="first_name"]').value.trim();
    const lastName = document.querySelector('input[name="last_name"]').value.trim();
    const email = document.querySelector('input[name="email"]').value.trim();
    const phone = document.querySelector('input[name="phone"]').value.trim();
    const message = document.getElementById('message').value.trim();
    const donationAmount = finalAmount.value.trim();

    if (!firstName || !lastName || !email || !phone) {
      alert("❌ Please fill in all required fields.");
      return;
    }

    // ✅ Show Alert
    alert(`✅ Thank you for your donation, ${firstName} ${lastName}!\n\nDonation Details:\nAmount: KES ${parseInt(donationAmount).toLocaleString()}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message || 'No message'}`);

    // ✅ After alert, you can reset the form
    form.reset();
    finalAmount.value = 0;
    summaryText.innerHTML = `Selected donation: <strong>KES 0</strong>`;
    amountButtons.forEach(btn => btn.classList.remove("active"));

    // 🛑 Do NOT send anything to PHP!
    // 🛑 No fetch('process_donation.php') call here
  });
});


//CONTACT EMAIL SEND
// Handle mailing list form
document.getElementById('mailing-list').addEventListener('submit', function (e) {
  e.preventDefault(); // Prevent normal form submission

  const email = document.getElementById('mailingEmail').value;

  fetch('send_email.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'email=' + encodeURIComponent(email)
  })
  .then(response => response.text())
  .then(text => {
    console.log("Server response:", text);
    try {
      const json = JSON.parse(text);
      document.getElementById('mailingResponse').textContent = json.message;
    } catch (err) {
      document.getElementById('mailingResponse').textContent = "Something went wrong. Please try again.";
      console.error("JSON parse error:", err);
    }
  })
  .catch(error => {
    document.getElementById('mailingResponse').textContent = "Request failed. Please try again.";
    console.error("Fetch error:", error);
  });
});

// Handle contact form submission
document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const form = this;
  const responseEl = document.getElementById('response');
  const formData = new FormData(form);

  responseEl.textContent = 'Sending…';
  responseEl.style.color = '';

  try {
    const res = await fetch('submit_contact.php', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    responseEl.textContent = data.message;
    responseEl.style.color = data.status === 'success' ? 'green' : 'red';

    if (data.status === 'success') {
      form.reset();

      const existingPopup = document.getElementById('submissionPopup');
      if (existingPopup) existingPopup.remove();

      const popup = document.createElement('div');
      popup.id = 'submissionPopup';
      popup.textContent = "Thank you for your thoughts. Let's stay safe online 💙!";
      popup.style.position = 'fixed';
      popup.style.top = '20px';
      popup.style.right = '20px';
      popup.style.padding = '15px 20px';
      popup.style.backgroundColor = '#28a745';
      popup.style.color = '#fff';
      popup.style.fontWeight = 'bold';
      popup.style.borderRadius = '10px';
      popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
      popup.style.zIndex = '1000';
      popup.style.transition = 'opacity 0.5s ease-in-out';

      document.body.appendChild(popup);
      setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 500);
      }, 5000);
    }
  } catch (error) {
    console.error('Error:', error);
    responseEl.textContent = 'Server error. Please try again later.';
    responseEl.style.color = 'red';
  }
});





//heroes section


  const images = document.querySelectorAll('.bg-image');
  let current = 0;

  setInterval(() => {
    images[current].classList.remove('active');
    current = (current + 1) % images.length;
    images[current].classList.add('active');
  }, 4000); // change every 4 seconds



  const hamburger = document.getElementById('hamburger');
  const sideMenu = document.getElementById('sideMenu');
  const closeBtn = document.getElementById('closeBtn');
  const overlay = document.getElementById('menuOverlay');

  hamburger.addEventListener('click', () => {
    sideMenu.classList.add('open');
    overlay.classList.add('active');
  });

  closeBtn.addEventListener('click', () => {
    sideMenu.classList.remove('open');
    overlay.classList.remove('active');
  });

  overlay.addEventListener('click', () => {
    sideMenu.classList.remove('open');
    overlay.classList.remove('active');
  });


  








  /* ===== Server-side Node.js (keep in backend files, not frontend) =====
  
  const express = require('express');
  const app = express();
  const Feedback = require('./models/Feedback');
  const Subscriber = require('./models/Subscriber');
  const nodemailer = require('nodemailer');
  
  app.use(express.json());
  
  // Contact Us API
  app.post('/send-message', async (req, res) => {
    try {
      const { name, email, message } = req.body;
      const newFeedback = new Feedback({ name, email, message, response: "" });
      await newFeedback.save();
      res.json({ message: "Your message has been received!" });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Mailing List API
  app.post('/subscribe', async (req, res) => {
    try {
      const { email } = req.body;
  
      if (!email.endsWith("@gmail.com")) {
        return res.status(400).json({ error: "Please enter a valid Gmail address." });
      }
  
      const existingSubscriber = await Subscriber.findOne({ email });
      if (existingSubscriber) {
        return res.json({ message: "You're already subscribed!" });
      }
  
      const newSubscriber = new Subscriber({ email });
      await newSubscriber.save();
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Subscription Confirmed",
        text: "Thank you for subscribing! We will notify you about upcoming sessions."
      };
  
      await transporter.sendMail(mailOptions);
      res.json({ message: "Subscription successful! Check your email." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Send update to all subscribers
  app.post('/send-update', async (req, res) => {
    try {
      const { sessionInfo } = req.body;
      const subscribers = await Subscriber.find({ subscribed: true });
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
  
      for (let subscriber of subscribers) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: subscriber.email,
          subject: "New Session Update!",
          text: `Hello! We have a new session coming up: ${sessionInfo}. Stay tuned!`
        };
  
        await transporter.sendMail(mailOptions);
      }
  
      res.json({ message: "Email updates sent successfully!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error sending updates." });
    }
  });
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  
  ===== END OF SERVER-SIDE CODE ===== */
  