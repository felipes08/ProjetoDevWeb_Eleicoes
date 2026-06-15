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
export const auth = getAuth(app);
export const db = getFirestore(app);

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


const modalProposta = document.getElementById("modal-proposta");
const btnOpenModal = document.querySelector(".btn-admin-add");
const btnCloseModal = document.getElementById("btn-close-modal");
const formNovaProposta = document.getElementById("form-nova-proposta");

if (btnOpenModal) {
    btnOpenModal.addEventListener("click", (e) => {
        e.preventDefault();
        modalProposta.classList.add("active");
    });
}

if (btnCloseModal) {
    btnCloseModal.addEventListener("click", () => {
        modalProposta.classList.remove("active");
    });
}

window.addEventListener("click", (e) => {
    if (e.target === modalProposta) {
        modalProposta.classList.remove("active");
    }
});

if (formNovaProposta) {
    formNovaProposta.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const usuarioLogado = auth.currentUser;
        
        if (usuarioLogado) {
            try {
                const btnSubmit = formNovaProposta.querySelector("button[type='submit']");
                btnSubmit.textContent = "Salvando...";

                await addDoc(collection(db, "propostas"), {
                    titulo: document.getElementById("prop-titulo").value,
                    descricao: document.getElementById("prop-desc").value,
                    cargo: document.getElementById("prop-cargo").value,
                    area: document.getElementById("prop-area").value,
                    regiao: document.getElementById("prop-regiao").value,
                    candidato: document.getElementById("prop-candidato").value,
                    partido: document.getElementById("prop-partido").value,
                    
                    autorId: usuarioLogado.uid,
                    dataCriacao: new Date().toISOString()
                });

                alert("Proposta cadastrada com sucesso!");
                formNovaProposta.reset();
                modalProposta.classList.remove("active");
                btnSubmit.textContent = "Salvar no Banco de Dados";

                carregarPropostas();
            } catch (error) {
                console.error("Erro ao salvar:", error);
                alert("Ocorreu um erro ao salvar a proposta.");
            }
        }
    });
}