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

  // Only proceed if the popup elements exist (they're only on index.html)
  if (titleEl && messageEl && linkEl && reminderBtn) {
    let timeDiff = event.date - now;
    let hoursLeft = timeDiff / (1000 * 60 * 60);
    let minutesLeft = timeDiff / (1000 * 60 * 60);

    titleEl.innerText = "Shield Maidens 2025!";

    // Display popup if event is in the future
    if (!event || event.date < now) {
      messageEl.innerText = "There are no upcoming events at this time.";
      linkEl.style.display = "none";
      reminderBtn.style.display = "none";
    } else {
      // Detect 1-day-before message
      if (hoursLeft <= 48 && now.getDate() !== event.date.getDate()) {
        messageEl.innerText = "🚨 Just a day to go! Set a reminder so you don't miss it.";
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
    if (popup) {
      popup.style.display = "block";
    }

    // If reminder already set, and it's within 30 minutes, trigger a notification
    if (localStorage.getItem("eventReminder") === "set" && minutesLeft <= 30 && minutesLeft > 0) {
      sendReminderNotification("Your Shield Maidens session starts in 30 minutes! Be ready.");
      localStorage.removeItem("eventReminder"); // clear reminder after showing
    }
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

// Add null check for carousel
const carousel = document.querySelector('.session-carousel');
if (carousel) {
  carousel.innerHTML += carousel.innerHTML; // Duplicate for seamless scroll
}

// Events page
document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');
  
  // Only proceed if calendar exists (only on events.html)
  if (calendarEl) {
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

    if (upcomingList && pastList) {
      events.forEach(event => {
        let eventDate = new Date(event.start);
        let eventItem = `<li><strong>${event.title}</strong> - ${eventDate.toDateString()}<br>${event.description}</li>`;

        if (event.start >= today) {
          upcomingList.innerHTML += eventItem;
        } else {
          pastList.innerHTML += eventItem;
        }
      });
    }
  }
});

function showContactAlert() {
  alert("Thanks for your interest! Please email us at: shi3ldmaidens@gmail.com and we'll get back to you shortly.");
}

// Donate Page
document.addEventListener("DOMContentLoaded", () => {
  const amountButtons = document.querySelectorAll(".amount-btn");
  const customAmount = document.getElementById("customAmount");
  const finalAmount = document.getElementById("finalAmount");
  const summaryText = document.getElementById("summaryText");
  const form = document.getElementById("donationForm");

  // Only proceed if donation form exists (only on donate.html)
  if (form && finalAmount && summaryText) {
    function updateAmount(amount) {
      finalAmount.value = amount;
      summaryText.innerHTML = `Selected donation: <strong>KES ${parseInt(amount).toLocaleString()}</strong>`;
    }

    // Update amount when a preset button is clicked
    amountButtons.forEach(button => {
      button.addEventListener("click", () => {
        amountButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        if (customAmount) customAmount.value = "";
        updateAmount(button.dataset.amount);
      });
    });

    // Update amount when custom amount is entered
    if (customAmount) {
      customAmount.addEventListener("input", () => {
        amountButtons.forEach(btn => btn.classList.remove("active"));
        let value = parseInt(customAmount.value);
        if (!isNaN(value) && value > 0) {
          updateAmount(value);
        } else {
          updateAmount(0);
        }
      });
    }

    // Handle form submission
    form.addEventListener("submit", (e) => {
      e.preventDefault(); // ❌ STOP form from submitting normally

      // Check if a valid amount is entered
      if (!finalAmount.value || parseInt(finalAmount.value) <= 0) {
        alert("❌ Please select or enter a valid donation amount.");
        return;
      }

      // Validate other fields
      const firstName = document.querySelector('input[name="first_name"]');
      const lastName = document.querySelector('input[name="last_name"]');
      const email = document.querySelector('input[name="email"]');
      const phone = document.querySelector('input[name="phone"]');
      const message = document.getElementById('message');
      const donationAmount = finalAmount.value.trim();

      if (!firstName?.value.trim() || !lastName?.value.trim() || !email?.value.trim() || !phone?.value.trim()) {
        alert("❌ Please fill in all required fields.");
        return;
      }

      // ✅ Show Alert
      alert(`✅ Thank you for your donation, ${firstName.value.trim()} ${lastName.value.trim()}!\n\nDonation Details:\nAmount: KES ${parseInt(donationAmount).toLocaleString()}\nEmail: ${email.value.trim()}\nPhone: ${phone.value.trim()}\nMessage: ${message?.value.trim() || 'No message'}`);

      // ✅ After alert, you can reset the form
      form.reset();
      finalAmount.value = 0;
      summaryText.innerHTML = `Selected donation: <strong>KES 0</strong>`;
      amountButtons.forEach(btn => btn.classList.remove("active"));

      // 🛑 Do NOT send anything to PHP!
      // 🛑 No fetch('process_donation.php') call here
    });
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

// Add swipe support for hero section on mobile
let startX = 0;
let endX = 0;

const heroSection = document.querySelector('.hero-alt');
if (heroSection) {
  heroSection.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });

  heroSection.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    if (endX < startX - 30) {
      // Swipe left: next image
      images[current].classList.remove('active');
      current = (current + 1) % images.length;
      images[current].classList.add('active');
    } else if (endX > startX + 30) {
      // Swipe right: previous image
      images[current].classList.remove('active');
      current = (current - 1 + images.length) % images.length;
      images[current].classList.add('active');
    }
  });
}

// Add null checks for mobile menu elements
const hamburger = document.getElementById('hamburger');
const sideMenu = document.getElementById('sideMenu');
const closeBtn = document.getElementById('closeBtn');
const overlay = document.getElementById('menuOverlay');

// Only add event listeners if elements exist
if (hamburger && sideMenu && closeBtn && overlay) {
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
}

// Report Form Functions
function openReportForm() {
  document.getElementById('reportModal').style.display = 'block';
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeReportForm() {
  document.getElementById('reportModal').style.display = 'none';
  document.body.style.overflow = 'auto'; // Re-enable background scrolling
}

function submitReport(event) {
  event.preventDefault();
  
  // Get form data
  const formData = {
    name: document.getElementById('reporterName').value,
    description: document.getElementById('incidentDescription').value,
    email: document.getElementById('reporterEmail').value,
    contactPermission: document.getElementById('contactPermission').checked
  };
  
  // Here you would typically send the data to your server
  // For now, we'll just show a success message
  alert('Thank you for your report. Our team will review it and contact you within 12 hours if you provided contact information and gave permission.');
  
  // Close the modal and reset the form
  closeReportForm();
  document.getElementById('reportForm').reset();
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('reportModal');
  if (event.target == modal) {
    closeReportForm();
  }
}

// Hamburger Menu Functionality
function openMenu() {
    document.getElementById("mobileMenu").classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent scrolling when menu is open
}

function closeMenu() {
    document.getElementById("mobileMenu").classList.remove("active");
    document.body.style.overflow = ""; // Restore scrolling
}

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const mobileMenu = document.getElementById("mobileMenu");
    const hamburger = document.querySelector(".hamburger");
    
    if (mobileMenu.classList.contains("active") && 
        !mobileMenu.contains(event.target) && 
        !hamburger.contains(event.target)) {
        closeMenu();
    }
});

// Close menu when pressing Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        closeMenu();
    }
});
  