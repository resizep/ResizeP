import { auth } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

// Auth modal elements
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authSubmit = document.getElementById('authSubmit');
const authSwitch = document.getElementById('authSwitch');
const switchToRegister = document.getElementById('switchToRegister');
const closeModal = document.querySelector('.close');

let isLoginMode = true;

// Switch between login and register
switchToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        authTitle.textContent = 'Login to Resize P';
        authSubmit.textContent = 'Login';
        authSwitch.innerHTML = 'Don\'t have an account? <a href="#" id="switchToRegister">Register</a>';
    } else {
        authTitle.textContent = 'Register for Resize P';
        authSubmit.textContent = 'Register';
        authSwitch.innerHTML = 'Already have an account? <a href="#" id="switchToRegister">Login</a>';
    }
    
    // Re-attach event listener for the new link
    document.getElementById('switchToRegister').addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        
        if (isLoginMode) {
            authTitle.textContent = 'Login to Resize P';
            authSubmit.textContent = 'Login';
            authSwitch.innerHTML = 'Don\'t have an account? <a href="#" id="switchToRegister">Register</a>';
        } else {
            authTitle.textContent = 'Register for Resize P';
            authSubmit.textContent = 'Register';
            authSwitch.innerHTML = 'Already have an account? <a href="#" id="switchToRegister">Login</a>';
        }
    });
});

// Auth form submission
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    
    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
        }
        
        authModal.style.display = 'none';
        authForm.reset();
    } catch (error) {
        alert(error.message);
    }
});

// Modal controls
document.getElementById('loginBtn').addEventListener('click', () => {
    authModal.style.display = 'block';
    isLoginMode = true;
    authTitle.textContent = 'Login to Resize P';
    authSubmit.textContent = 'Login';
});

closeModal.addEventListener('click', () => {
    authModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.style.display = 'none';
    }
});

// Auth state observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        localStorage.setItem('resizeP_user', JSON.stringify(user));
        window.dispatchEvent(new Event('authStateChange'));
    } else {
        // User is signed out
        localStorage.removeItem('resizeP_user');
        window.dispatchEvent(new Event('authStateChange'));
    }
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await signOut(auth);
    } catch (error) {
        alert(error.message);
    }
});
