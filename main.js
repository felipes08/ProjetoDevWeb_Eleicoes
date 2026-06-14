import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

const adminAction = document.querySelector(".admin-action");
const userStatusSpan = document.querySelector(".user-status span");
const btnLogout = document.querySelector(".user-status button");

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        
        if (userDoc.exists() && userDoc.data().tipo === "admin") {
            if (adminAction) adminAction.style.display = "block";
            if (userStatusSpan) userStatusSpan.innerHTML = '<i class="fas fa-user-shield"></i> Administrador';
        } else {
            if (adminAction) adminAction.style.display = "none";
            if (userStatusSpan) userStatusSpan.innerHTML = '<i class="fas fa-user"></i> Eleitor';
        }
    } else {
        window.location.href = "login.html";
    }
});

if (btnLogout) {
    btnLogout.addEventListener("click", () => {
        signOut(auth).then(() => {
            window.location.href = "login.html";
        });
    });
}