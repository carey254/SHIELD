const quizData = {
    basic: [
        {
            question: "What is TFGBV?",
            options: [
                "Violence only in physical spaces",
                "Violence using digital technologies",
                "Only verbal abuse offline",
                "Violence targeting men exclusively"
            ],
            correct: 1,
            explanation: "TFGBV refers to violence that uses digital technologies, including online harassment, cyberstalking, and other forms of digital abuse."
        },
        {
            question: "Which is an example of TFGBV?",
            options: [
                "Sending anonymous threats online",
                "A face-to-face argument",
                "Schoolyard bullying",
                "None of the above"
            ],
            correct: 0,
            explanation: "Sending anonymous threats online is a common form of TFGBV, as it uses technology to harass or intimidate someone."
        },
        {
            question: "Who are chiefly targeted by TFGBV?",
            options: [
                "All genders equally",
                "Women and girls",
                "Only men",
                "Children under 5"
            ],
            correct: 1,
            explanation: "Women and girls are disproportionately targeted by TFGBV, although it can affect anyone."
        },
        {
            question: "What is 'doxxing'?",
            options: [
                "Publishing private info without consent",
                "Sending kind messages",
                "Setting up security software",
                "None of these"
            ],
            correct: 0,
            explanation: "Doxxing is the act of publishing someone's private information online without their consent, which can lead to harassment and safety concerns."
        },
        {
            question: "A consequence of TFGBV can be:",
            options: [
                "Better job offers",
                "Increased self-esteem",
                "More trust in technology",
                "Emotional distress and reputational harm"
            ],
            correct: 3,
            explanation: "TFGBV often results in emotional distress and can cause serious harm to a person's reputation and well-being."
        }
    ],
    intermediate: [
        {
            question: "What makes digital tools powerful for TFGBV perpetrators?",
            options: [
                "Anonymity and wide reach",
                "Strong encryption",
                "Offline meetups",
                "Legal barriers"
            ],
            correct: 0,
            explanation: "Digital tools provide anonymity to perpetrators and allow them to reach victims widely, making TFGBV particularly harmful."
        },
        {
            question: "Which is NOT a form of TFGBV?",
            options: [
                "Cyberstalking",
                "Impersonation",
                "Non-consensual image sharing",
                "Peaceful protest"
            ],
            correct: 3,
            explanation: "Peaceful protest is a legitimate form of expression, while the other options are forms of technology-facilitated harassment or abuse."
        },
        {
            question: "A common impact of TFGBV is:",
            options: [
                "More online participation",
                "Negative psychological harm",
                "Improved finances",
                "Better career prospects"
            ],
            correct: 1,
            explanation: "TFGBV often results in negative psychological impacts, including anxiety, depression, and fear."
        },
        {
            question: "What is 'revenge porn'?",
            options: [
                "Posting memes",
                "Non-consensual sharing of intimate images",
                "Cyberbullying by text only",
                "Hacking bank accounts"
            ],
            correct: 1,
            explanation: "Revenge porn involves sharing intimate images without consent, often to cause harm or distress to the victim."
        },
        {
            question: "How can communities reduce TFGBV?",
            options: [
                "Spreading awareness and digital literacy",
                "Ignoring the issue",
                "Limiting all online use",
                "Encouraging anonymous threats"
            ],
            correct: 0,
            explanation: "Education, awareness, and digital literacy are key tools in preventing and reducing TFGBV in communities."
        }
    ]
};

class Quiz {
    constructor() {
        this.currentLevel = 'basic';
        this.currentQuestion = 0;
        this.score = 0;
        this.init();
    }

    init() {
        document.getElementById('basic-quiz').style.display = 'block';
        document.getElementById('intermediate-quiz').style.display = 'none';
        document.getElementById('results').style.display = 'none';
        this.showQuestion(0);
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Navigation buttons for basic quiz
        document.getElementById('prev').addEventListener('click', (e) => {
            e.preventDefault();
            if (this.currentQuestion > 0) {
                this.currentQuestion--;
                this.showQuestion(this.currentQuestion);
            }
        });

        document.getElementById('next').addEventListener('click', (e) => {
            e.preventDefault();
            if (this.currentQuestion < 4) {
                this.currentQuestion++;
                this.showQuestion(this.currentQuestion);
            }
        });

        // Remove focus/outline/box from radio buttons and labels
        document.querySelectorAll('.quiz-options input[type="radio"]').forEach(radio => {
            radio.addEventListener('focus', function(e) {
                this.blur(); // Remove focus ring
            });
        });
        // Remove outline from label on click
        document.querySelectorAll('.quiz-options label').forEach(label => {
            label.addEventListener('mousedown', function(e) {
                this.style.outline = 'none';
            });
        });

        // Submit buttons with scroll position preservation
        ['submit-basic', 'submit-intermediate'].forEach(buttonId => {
            document.getElementById(buttonId).addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const quizContainer = document.querySelector('.quiz-container');
                const containerTop = quizContainer.getBoundingClientRect().top + window.pageYOffset;
                
                this.submitQuiz(buttonId === 'submit-basic' ? 'basic' : 'intermediate');
                
                // Keep the quiz container in the same position
                window.scrollTo({
                    top: containerTop,
                    behavior: 'instant'
                });
            });
        });

        // Retry button
        document.getElementById('retry-quiz').addEventListener('click', (e) => {
            e.preventDefault();
            const quizContainer = document.querySelector('.quiz-container');
            const containerTop = quizContainer.getBoundingClientRect().top + window.pageYOffset;
            
            this.retryQuiz();
            
            window.scrollTo({
                top: containerTop,
                behavior: 'instant'
            });
        });

        // Go to intermediate button
        document.getElementById('go-intermediate').addEventListener('click', (e) => {
            e.preventDefault();
            const quizContainer = document.querySelector('.quiz-container');
            const containerTop = quizContainer.getBoundingClientRect().top + window.pageYOffset;
            
            this.startIntermediateQuiz();
            
            window.scrollTo({
                top: containerTop,
                behavior: 'instant'
            });
        });
    }

    showQuestion(index) {
        if (this.currentLevel === 'basic') {
            const questions = document.querySelectorAll('#basic-quiz .question');
            questions.forEach(q => q.style.display = 'none');
            questions[index].style.display = 'block';
            this.updateNavigationButtons();
        }
    }

    updateNavigationButtons() {
        const prevButton = document.getElementById('prev');
        const nextButton = document.getElementById('next');
        const submitButton = document.getElementById('submit-basic');

        prevButton.disabled = this.currentQuestion === 0;
        if (this.currentQuestion === 0) {
            prevButton.classList.add('disabled');
        } else {
            prevButton.classList.remove('disabled');
        }
        nextButton.disabled = this.currentQuestion === 4;
        
        if (submitButton) {
            submitButton.style.display = this.currentQuestion === 4 ? 'block' : 'none';
        }
    }

    submitQuiz(level) {
        this.score = 0;
        const questions = document.querySelectorAll(`#${level}-quiz .question`);
        
        questions.forEach((question) => {
            const correctAnswer = parseInt(question.getAttribute('data-correct'));
            const selectedAnswer = question.querySelector('input[type="radio"]:checked');
            
            if (selectedAnswer && parseInt(selectedAnswer.value) === correctAnswer) {
                this.score++;
            }
        });

        this.showResults();
    }

    showResults() {
        document.getElementById('basic-quiz').style.display = 'none';
        document.getElementById('intermediate-quiz').style.display = 'none';
        
        const resultsDiv = document.getElementById('results');
        const scoreSpan = document.getElementById('score');
        const feedbackP = document.getElementById('feedback');
        const goIntermediateBtn = document.getElementById('go-intermediate');
        const retryBtn = document.getElementById('retry-quiz');
        
        resultsDiv.style.display = 'block';
        const percentage = (this.score / 5) * 100;
        scoreSpan.textContent = percentage.toFixed(0);
        
        if (this.currentLevel === 'basic') {
            if (percentage >= 60) {
                feedbackP.textContent = "Congratulations! You've passed the basic level. You can now proceed to the intermediate quiz.";
                feedbackP.style.color = '#28a745';
                goIntermediateBtn.style.display = 'block';
                retryBtn.style.display = 'none';
            } else {
                feedbackP.textContent = "You need to score at least 60% to proceed to the intermediate level. Please try again.";
                feedbackP.style.color = '#dc3545';
                goIntermediateBtn.style.display = 'none';
                retryBtn.style.display = 'block';
            }
        } else {
            retryBtn.style.display = percentage < 60 ? 'block' : 'none';
            goIntermediateBtn.style.display = 'none';
            
            if (percentage >= 60) {
                feedbackP.innerHTML = `
                    <div class="celebration">
                        <p>🌸 Excellent work! You've mastered TFGBV awareness! 🌸</p>
                        <p>🌺 Keep spreading awareness and staying safe online! 🌺</p>
                        <p>Remember: Your online safety matters! 💪</p>
                        <div class="flowers">🌷 🌹 🌺 🌸 🌼</div>
                    </div>
                `;
                feedbackP.style.color = '#28a745';
            } else {
                feedbackP.textContent = "Keep learning about TFGBV and try again to improve your score.";
                feedbackP.style.color = '#dc3545';
            }
        }
    }

    retryQuiz() {
        this.currentQuestion = 0;
        this.score = 0;
        
        const radioButtons = document.querySelectorAll(`#${this.currentLevel}-quiz input[type="radio"]`);
        radioButtons.forEach(radio => radio.checked = false);
        
        document.getElementById('results').style.display = 'none';
        document.getElementById(`${this.currentLevel}-quiz`).style.display = 'block';
        
        if (this.currentLevel === 'basic') {
            this.showQuestion(0);
        } else {
            const questions = document.querySelectorAll('#intermediate-quiz .question');
            questions.forEach(q => q.style.display = 'block');
            document.getElementById('submit-intermediate').style.display = 'block';
        }
    }

    startIntermediateQuiz() {
        this.currentLevel = 'intermediate';
        this.currentQuestion = 0;
        this.score = 0;
        
        document.getElementById('results').style.display = 'none';
        document.getElementById('basic-quiz').style.display = 'none';
        
        document.getElementById('intermediate-quiz').style.display = 'block';
        const questions = document.querySelectorAll('#intermediate-quiz .question');
        questions.forEach(q => q.style.display = 'block');
        
        document.getElementById('prev').style.display = 'none';
        document.getElementById('next').style.display = 'none';
        document.getElementById('submit-intermediate').style.display = 'block';
    }
}

// Initialize quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Quiz();
});