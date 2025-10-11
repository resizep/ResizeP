// auth.js - Supabase Version
import { supabase } from './supabase-config.js'

// Auth modal elements
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authSubmit = document.getElementById('authSubmit');
const authSwitch = document.getElementById('authSwitch');
const closeModal = document.querySelector('.close');

let isLoginMode = true;

// Switch between login and register
function setupAuthSwitch() {
    const switchToRegister = document.getElementById('switchToRegister');
    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            updateAuthUI();
        });
    }
}

function updateAuthUI() {
    if (isLoginMode) {
        authTitle.textContent = 'Login to Resize P';
        authSubmit.textContent = 'Login';
        authSwitch.innerHTML = 'Don\'t have an account? <a href="#" id="switchToRegister">Register</a>';
    } else {
        authTitle.textContent = 'Register for Resize P';
        authSubmit.textContent = 'Register';
        authSwitch.innerHTML = 'Already have an account? <a href="#" id="switchToRegister">Login</a>';
    }
    setupAuthSwitch();
}

// Auth form submission
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const authSubmitBtn = document.getElementById('authSubmit');
    
    // Show loading state
    authSubmitBtn.textContent = 'Loading...';
    authSubmitBtn.disabled = true;
    
    try {
        let result;
        
        if (isLoginMode) {
            // Login
            result = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
        } else {
            // Register
            result = await supabase.auth.signUp({
                email: email,
                password: password
            });
        }

        if (result.error) throw result.error;
        
        authModal.style.display = 'none';
        authForm.reset();
        alert(isLoginMode ? 'Login successful!' : 'Registration successful! Check your email for verification.');
        
    } catch (error) {
        console.error('Auth error:', error);
        let errorMessage = 'An error occurred. Please try again.';
        
        switch (error.message) {
            case 'Invalid login credentials':
                errorMessage = 'Invalid email or password.';
                break;
            case 'Email not confirmed':
                errorMessage = 'Please verify your email address.';
                break;
            case 'User already registered':
                errorMessage = 'This email is already registered.';
                break;
            case 'Password should be at least 6 characters':
                errorMessage = 'Password should be at least 6 characters.';
                break;
        }
        
        alert(errorMessage);
    } finally {
        authSubmitBtn.textContent = isLoginMode ? 'Login' : 'Register';
        authSubmitBtn.disabled = false;
    }
});

// Modal controls
document.getElementById('loginBtn').addEventListener('click', () => {
    authModal.style.display = 'block';
    isLoginMode = true;
    updateAuthUI();
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
supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        // User is signed in
        console.log('User logged in:', session.user.email);
        updateUIForAuthState(true);
        saveUserToStorage(session.user);
    } else {
        // User is signed out
        console.log('User logged out');
        updateUIForAuthState(false);
        clearUserFromStorage();
    }
});

function saveUserToStorage(user) {
    localStorage.setItem('resizeP_user', JSON.stringify({
        uid: user.id,
        email: user.email
    }));
}

function clearUserFromStorage() {
    localStorage.removeItem('resizeP_user');
    localStorage.removeItem('resizeP_projects');
}

function updateUIForAuthState(isLoggedIn) {
    const premiumSizes = document.getElementById('premiumSizes');
    const saveProjectBtn = document.getElementById('saveProjectBtn');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const historyBtn = document.getElementById('historyBtn');
    const projectsBtn = document.getElementById('projectsBtn');
    const profileBtn = document.getElementById('profileBtn');

    if (isLoggedIn) {
        premiumSizes.style.display = 'block';
        saveProjectBtn.style.display = 'block';
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        historyBtn.style.display = 'block';
        projectsBtn.style.display = 'block';
        profileBtn.style.display = 'block';
    } else {
        premiumSizes.style.display = 'none';
        saveProjectBtn.style.display = 'none';
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        historyBtn.style.display = 'none';
        projectsBtn.style.display = 'none';
        profileBtn.style.display = 'none';
    }
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        alert('Logged out successfully!');
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out. Please try again.');
    }
});

// Initialize auth UI
updateAuthUI();

// Export for use in other files
window.authModule = {
    supabase,
    getCurrentUser: () => supabase.auth.getUser()
};
