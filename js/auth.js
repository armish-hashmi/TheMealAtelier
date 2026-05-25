document.addEventListener('DOMContentLoaded', () => {
                const slider = document.getElementById('formSlider');
                const toSignup = document.getElementById('toSignup');
                const toLogin = document.getElementById('toLogin');

                // Slide to Register
                toSignup.addEventListener('click', (e) => {
                    e.preventDefault();
                    slider.classList.add('show-register');
                });

                // Slide back to Login
                toLogin.addEventListener('click', (e) => {
                    e.preventDefault();
                    slider.classList.remove('show-register');
                });
            });

            function togglePassword(inputId, iconEl) {
                const passwordInput = document.getElementById(inputId);

                if (passwordInput.type === "password") {
                    passwordInput.type = "text";
                    iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" 
                        stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off">
                        <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 
                        a10.747 10.747 0 0 1-1.444 2.49"/>
                        <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
                        <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 
                        a10.75 10.75 0 0 1 4.446-5.143"/>
                        <path d="m2 2 20 20"/></svg>`;
                } else {
                    passwordInput.type = "password";
                    iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" 
                        stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye">
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 
                        .696 10.75 10.75 0 0 1-19.876 0"/>
                        <circle cx="12" cy="12" r="3"/></svg>`;

                }
            }

            document.getElementById("loginForm").addEventListener("submit", (event) => {
                event.preventDefault();

                let email = document.getElementById("email").value;
                let password = document.getElementById("password").value;
                
                if (email && password) {
                    window.location.href = "home.html";
                }
            });

            document.getElementById("registerForm").addEventListener("submit", (event) => {
                event.preventDefault();

                let username = document.getElementById("reg-username").value;
                let email = document.getElementById("reg-email").value;
                let password = document.getElementById("reg-password").value;

                if (username && email && password) {
                    window.location.href = "home.html";
                }
            });

