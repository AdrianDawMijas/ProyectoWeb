document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const nav = document.querySelector("#nav");
    const abrir = document.querySelector("#abrir");
    const cerrar = document.querySelector("#cerrar");

    if (registerForm) {
        initRegisterForm(registerForm);
    }

    if (loginForm) {
        initLoginForm(loginForm);
    }

    if (abrir && cerrar) {
        initMenu(nav, abrir, cerrar);
    }
});

function initRegisterForm(form) {
    const fullName = document.getElementById("fullName");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const privacyPolicy = document.getElementById("privacyPolicy");
    const passwordHelp = document.getElementById("passwordHelp");

    // Set maxlength attributes for fullName and telefono
    fullName.maxLength = 20;  // Max length for fullName
    const telefono = document.getElementById("telefono");
    telefono.maxLength = 9;  // Max length for telefono

    fullName.addEventListener("input", validateField);
    email.addEventListener("input", validateField);
    password.addEventListener("input", function(event) {
        validateField(event, true);  // Validate password with full criteria
        togglePasswordHelp(password, passwordHelp);
    });
    confirmPassword.addEventListener("input", function(event) {
        validateConfirmPassword(password, confirmPassword);
    });
    password.addEventListener("focus", () => togglePasswordHelp(password, passwordHelp));
    password.addEventListener("blur", () => passwordHelp.style.display = "none");

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        submitRegisterForm(fullName, email, password, confirmPassword, privacyPolicy);
    });
}

function submitRegisterForm(fullName, email, password, confirmPassword, privacyPolicy) {
    if (validateForm(fullName, email, password, confirmPassword, privacyPolicy)) {
        const userData = {
            fullName: fullName.value,
            email: email.value,
            password: password.value
        };

        if (saveUserData(userData)) {
            const userDataJson = JSON.stringify(userData, null, 2); // Convertir userData a JSON string
            Swal.fire({
                icon: 'success',
                title: 'Registrado',
                html: `Te has registrado correctamente.<br>Se ha creado el JSON:<pre>${escapeHtml(userDataJson)}</pre>`, // Mostrar JSON en el mensaje
                customClass: {
                    popup: 'formatted-json'
                }
            });
            resetForm(fullName, email, password, confirmPassword, privacyPolicy);
        }
    } else {
        if (!privacyPolicy.checked) {
            Swal.fire({
                icon: 'error',
                title: 'Política de privacidad no aceptada',
                text: 'Por favor, acepta la política de privacidad para continuar.',
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error en el formulario',
                text: 'Por favor, rellena todos los campos correctamente.',
            });
        }
    }
}

// Función para escapar HTML y evitar inyecciones XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function initLoginForm(form) {
    const emailLogin = document.getElementById("emailLogin");
    const passwordLogin = document.getElementById("passwordLogin");

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        loginUser(emailLogin, passwordLogin);
    });
}

function loginUser(emailLogin, passwordLogin) {
    const users = getUserData();
    const user = users.find(u => u.email === emailLogin.value && u.password === passwordLogin.value);

    if (user) {
        Swal.fire({
            icon: 'success',
            title: 'Login Exitoso',
            text: 'Te has logueado correctamente.',
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Correo electrónico o contraseña incorrectos.',
        });
    }
}

function togglePasswordHelp(password, passwordHelp) {
    if (!validatePassword(password.value)) {
        passwordHelp.style.display = "block";
    } else {
        passwordHelp.style.display = "none";
    }
}

function validateField(event, isPassword = false) {
    const field = event.target;
    let isValid = field.checkValidity();  // Basic HTML5 validation first

    if (isPassword) {
        // If it's the password field, we need additional checks
        isValid = validatePassword(field.value);
    }

    const errorIcon = field.nextElementSibling;
    const successIcon = errorIcon ? errorIcon.nextElementSibling : null;

    field.style.borderColor = isValid ? "green" : "red";
    errorIcon.style.display = isValid ? "none" : "block";
    // Display the success icon only if the field is valid
    if (successIcon) {
        successIcon.style.display = isValid ? "block" : "none";
    }
}

function validateConfirmPassword(password, confirmPassword) {
    const isMatch = password.value === confirmPassword.value && confirmPassword.value !== '';
    const errorIcon = confirmPassword.nextElementSibling;
    const successIcon = errorIcon.nextElementSibling;

    confirmPassword.style.borderColor = isMatch ? "green" : "red";
    errorIcon.style.display = isMatch ? "none" : "block";
    successIcon.style.display = isMatch ? "block" : "none";
}

function resetForm(...elements) {
    elements.forEach(element => element.value = "");
    resetIcons();
}

function resetIcons() {
    document.querySelectorAll('.error-icon, .success-icon').forEach(icon => icon.style.display = 'none');
}

function initMenu(nav, abrir, cerrar) {
    abrir.addEventListener("click", () => nav.classList.add("visible"));
    cerrar.addEventListener("click", () => nav.classList.remove("visible"));
}

function getUserData() {
    const data = localStorage.getItem('users');
    return data ? JSON.parse(data) : [];
}

function saveUserData(userData) {
    const users = getUserData();
    const existingUser = users.find(user => user.email === userData.email);
    if (existingUser) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Este correo electrónico ya está registrado.',
        });
        return false;
    }
    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
    return true;
}


function validatePassword(password) {
    return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])[A-Za-z\d\W_]{8,16}$/.test(password);
}

function validateForm(fullName, email, password, confirmPassword, privacyPolicy) {
    let isValid = /^[A-Za-z ]+$/.test(fullName.value) &&
        email.validity.valid && /^\S+@\S+\.\S+$/.test(email.value) &&
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])[A-Za-z\d\W_]{8,16}$/.test(password.value) &&
        confirmPassword.value === password.value &&
        confirmPassword.value.length > 0 &&
        privacyPolicy.checked;
    return isValid;
}
