import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCXqYafCxMR8Q71NfKJyeg8JDr4xmIjc6M",
    authDomain: "projetodevweb-eleicoes.firebaseapp.com",
    projectId: "projetodevweb-eleicoes",
    storageBucket: "projetodevweb-eleicoes.firebasestorage.app",
    messagingSenderId: "341314530921",
    appId: "1:341314530921:web:f549e6c007fd713b0b7cf8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const authForm = document.getElementById("auth-form");
const emailInput = document.getElementById("auth-email");
const passwordInput = document.getElementById("auth-password");
const btnSubmit = document.getElementById("btn-auth-submit");
const authMessage = document.getElementById("auth-message");

let isLoginMode = true;

if (tabLogin && tabRegister) {
    tabLogin.addEventListener("click", () => {
        isLoginMode = true;
        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");
        btnSubmit.textContent = "Entrar";
        authMessage.textContent = "";
    });

    tabRegister.addEventListener("click", () => {
        isLoginMode = false;
        tabRegister.classList.add("active");
        tabLogin.classList.remove("active");
        btnSubmit.textContent = "Cadastrar";
        authMessage.textContent = "";
    });
}

if (authForm) {
    authForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;
        authMessage.textContent = "";

        try {
            if (isLoginMode) {
                await signInWithEmailAndPassword(auth, email, password);
                window.location.href = "index.html";
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                await setDoc(doc(db, "usuarios", user.uid), {
                    email: user.email,
                    tipo: "comum"
                });

                authMessage.className = "auth-message success";
                authMessage.textContent = "Cadastro realizado!";

               setTimeout(() => {
                    window.location.href = "index.html";
                }, 5000);
            }
        } catch (error) {
            authMessage.className = "auth-message error";
            if (error.code === 'auth/email-already-in-use') {
                authMessage.textContent = "Este e-mail já está cadastrado.";
            } else if (error.code === 'auth/weak-password') {
                authMessage.textContent = "A senha deve ter pelo menos 6 caracteres.";
            } else {
                authMessage.textContent = "Erro na autenticação. Verifique os dados.";
            }
        }
    });
}