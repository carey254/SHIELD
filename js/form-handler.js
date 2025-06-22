// Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var form = this;
            var formData = new FormData(form);
            fetch(form.action, {
                method: 'POST',
                body: formData
            })
            .then(res => {
                if (!res.ok) {
                    return res.text().then(text => { throw new Error('Server error: ' + text) });
                }
                return res.json();
            })
            .then(data => {
                console.log(data);
                if(data.status === "success") {
                    alert("Thank you for contacting Shieldmaidens! We value inclusivity, empowerment, and safety. Our team will get back to you shortly. 💖");
                    form.reset();
                } else {
                    alert(data.message || "There was an error. Please try again.");
                }
            })
            .catch((error) => {
                console.error('Fetch Error:', error);
                alert("There was a critical error submitting the form. Please check the console for details and try again.");
            });
        });
    }

    // Mailing List Form Handler
    const mailingListForm = document.getElementById('mailing-list');
    if (mailingListForm) {
        mailingListForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var form = this;
            var formData = new FormData(form);
            fetch(form.action, {
                method: 'POST',
                body: formData
            })
            .then(res => {
                if (!res.ok) {
                    return res.text().then(text => { throw new Error('Server error: ' + text) });
                }
                return res.json();
            })
            .then(data => {
                console.log(data);
                if(data.status === "success") {
                    alert("Thank you for subscribing to our news, let's get updated! 📰");
                    form.reset();
                } else {
                    alert(data.message || "There was an error. Please try again.");
                }
            })
            .catch((error) => {
                console.error('Fetch Error:', error);
                alert("There was a critical error submitting the form. Please check the console for details and try again.");
            });
        });
    }
}); 