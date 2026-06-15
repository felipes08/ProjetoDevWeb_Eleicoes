import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc, getDocs, setDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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


let isUserAdmin = false;


const urlAtual = window.location.pathname;
const abaAtual = urlAtual.includes("caderninho") ? "caderninho" : "inicio";


const adminAction = document.querySelector(".admin-action");
const userStatusSpan = document.querySelector(".user-status span");
const btnLogout = document.querySelector(".user-status button");
const proposalsGrid = document.querySelector(".proposals-grid");
const counterBadge = document.querySelector(".counter-badge");


onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        
        if (userDoc.exists() && userDoc.data().tipo === "admin") {
            isUserAdmin = true;
            if (adminAction) adminAction.style.display = "block";
            if (userStatusSpan) userStatusSpan.innerHTML = '<i class="fas fa-user-shield"></i> Administrador';
        } else {
            isUserAdmin = false;
            if (adminAction) adminAction.style.display = "none";
            if (userStatusSpan) userStatusSpan.innerHTML = '<i class="fas fa-user"></i> Eleitor';
        }

        
        carregarPropostas();

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


async function carregarPropostas() {
    if (!proposalsGrid) return;

    const usuarioLogado = auth.currentUser;
    if (!usuarioLogado) return;

    try {
        proposalsGrid.innerHTML = "<p style='grid-column: 1 / -1; text-align: center; color: var(--text-muted);'>Carregando diretrizes...</p>";

        const querySnapshot = await getDocs(collection(db, "propostas"));
        
        const qFav = query(collection(db, "favoritos"), where("usuarioId", "==", usuarioLogado.uid));
        const favSnapshot = await getDocs(qFav);
        
        const listaFavoritados = new Set();
        favSnapshot.forEach(docFav => {
            listaFavoritados.add(docFav.data().propostaId);
        });

        let html = "";
        let count = 0;

        querySnapshot.forEach((docSnap) => {
            const proposta = docSnap.data();
            const id = docSnap.id;
            const jaE_Favorito = listaFavoritados.has(id);

            
            if (abaAtual === "caderninho" && !jaE_Favorito) {
                return; 
            }

            count++;

            const cargoSeguro = proposta.cargo || "Sem cargo";
            const areaSegura = proposta.area || "Sem área";
            const cargoFormatado = cargoSeguro.replace('-', ' ').toUpperCase();
            const areaFormatada = areaSegura.replace('-', ' ').toUpperCase();

            
            const botaoHtml = jaE_Favorito
                ? `<button class="btn-favorite favoritado" data-id="${id}" style="background-color: #fef9c3; border-color: #eab308; color: #ca8a04;">
                    <i class="fas fa-star" style="color: #eab308;"></i> Salvo no Caderninho
                   </button>`
                : `<button class="btn-favorite" data-id="${id}">
                    <i class="far fa-star"></i> Favoritar Diretriz
                   </button>`;

            const botaoExcluirHtml = isUserAdmin 
                ? `<button class="btn-delete" data-id="${id}" style="margin-top: 0.5rem; background-color: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 0.6rem 1rem; border-radius: 8px; cursor: pointer; width: 100%; font-weight: 600; font-size: 0.9rem; transition: background-color 0.2s;"><i class="fas fa-trash"></i> Excluir Diretriz</button>`
                : '';

            html += `
                <article class="proposal-card" 
                         data-id="${id}" 
                         data-cargo="${cargoSeguro.toLowerCase()}" 
                         data-area="${areaSegura.toLowerCase()}" 
                         data-regiao="${(proposta.regiao || "").toLowerCase()}">
                    
                    <div class="card-tags">
                        <span class="tag">${cargoFormatado}</span>
                        <span class="tag tag-blue">${areaFormatada}</span>
                    </div>
                    
                    <h4 class="card-title">${proposta.titulo}</h4>
                    <p class="card-desc">${proposta.descricao}</p>
                    
                    <div class="card-author">
                        <div class="author-avatar">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div class="author-info">
                            <strong>${proposta.candidato || "Candidato não informado"}</strong>
                            <span>${proposta.partido || "Partido não informado"}</span>
                        </div>
                    </div>

                    ${botaoHtml}
                    ${botaoExcluirHtml}
                </article>
            `;
        });

        if (count === 0) {
            if (abaAtual === "caderninho") {
                proposalsGrid.innerHTML = "<p style='grid-column: 1 / -1; text-align: center; color: var(--text-muted);'>Seu caderninho está vazio. Vá para Início e salve suas diretrizes!</p>";
            } else {
                proposalsGrid.innerHTML = "<p style='grid-column: 1 / -1; text-align: center; color: var(--text-muted);'>Nenhuma proposta cadastrada ainda. Clique em Nova Proposta para começar.</p>";
            }
        } else {
            proposalsGrid.innerHTML = html;
        }

        if (counterBadge) {
            counterBadge.textContent = abaAtual === "caderninho" 
                ? `${count} Salva${count !== 1 ? 's' : ''}` 
                : `${count} Cadastrada${count !== 1 ? 's' : ''}`;
        }

    } catch (error) {
        console.error("Erro ao buscar propostas:", error);
        proposalsGrid.innerHTML = "<p style='grid-column: 1 / -1; text-align: center; color: #ef4444;'>Erro ao carregar do banco. Verifique o console F12.</p>";
    }
}

if (proposalsGrid) {
    proposalsGrid.addEventListener("click", async (e) => {
        const usuarioLogado = auth.currentUser;
        if (!usuarioLogado) return;

        const btnFav = e.target.closest(".btn-favorite");
        if (btnFav) {
            const propostaId = btnFav.getAttribute("data-id");
            const favoritoId = `${usuarioLogado.uid}_${propostaId}`;
            const docRef = doc(db, "favoritos", favoritoId);

            try {
                if (btnFav.classList.contains("favoritado")) {
                    await deleteDoc(docRef);
                    if (abaAtual === "caderninho") {
                        carregarPropostas(); 
                    } else {
                        btnFav.classList.remove("favoritado");
                        btnFav.innerHTML = '<i class="far fa-star"></i> Favoritar Diretriz';
                        btnFav.style.backgroundColor = "transparent";
                        btnFav.style.borderColor = "var(--border-light)";
                        btnFav.style.color = "var(--text-main)";
                    }
                } else {
                    await setDoc(docRef, {
                        usuarioId: usuarioLogado.uid,
                        propostaId: propostaId,
                        dataAdicao: new Date().toISOString()
                    });
                    btnFav.classList.add("favoritado");
                    btnFav.innerHTML = '<i class="fas fa-star" style="color: #eab308;"></i> Salvo no Caderninho';
                    btnFav.style.backgroundColor = "#fef9c3";
                    btnFav.style.borderColor = "#eab308";
                    btnFav.style.color = "#ca8a04";
                }
            } catch (error) {
                console.error("Erro ao favoritar:", error);
            }
        }

        const btnDel = e.target.closest(".btn-delete");
        if (btnDel) {
            const propostaId = btnDel.getAttribute("data-id");
            const confirmacao = confirm("Deseja excluir esta diretriz permanentemente do banco de dados?");
            
            if (confirmacao) {
                try {
                    const textoOriginal = btnDel.innerHTML;
                    btnDel.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Excluindo...';
                    
                    await deleteDoc(doc(db, "propostas", propostaId));
                    carregarPropostas(); 
                } catch (error) {
                    console.error("Erro ao excluir:", error);
                    alert("Erro ao tentar excluir a proposta.");
                    btnDel.innerHTML = textoOriginal;
                }
            }
        }
    });
}

const searchInput = document.getElementById("search-input");
const filterCargo = document.getElementById("filter-cargo");
const filterArea = document.getElementById("filter-area");
const filterRegiao = document.getElementById("filter-regiao");

function removerAcentos(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function aplicarFiltros() {
    const termoBuscaOriginal = searchInput ? searchInput.value.toLowerCase() : "";
    const termoBusca = removerAcentos(termoBuscaOriginal);

    const cargoSelecionado = filterCargo ? filterCargo.value.toLowerCase() : "";
    const areaSelecionada = filterArea ? filterArea.value.toLowerCase() : "";
    const regiaoSelecionada = filterRegiao ? filterRegiao.value.toLowerCase() : "";

    const cards = document.querySelectorAll(".proposal-card");
    let countVisiveis = 0;

    cards.forEach(card => {
        const textoDoCartao = card.textContent.toLowerCase();
        const textoLimpo = removerAcentos(textoDoCartao);
        
        const cardCargo = card.getAttribute("data-cargo") || "";
        const cardArea = card.getAttribute("data-area") || "";
        const cardRegiao = card.getAttribute("data-regiao") || "";

        const matchTexto = termoBusca === "" || textoLimpo.includes(termoBusca);
        const matchCargo = cargoSelecionado === "" || cardCargo === cargoSelecionado;
        const matchArea = areaSelecionada === "" || cardArea === areaSelecionada;
        const matchRegiao = regiaoSelecionada === "" || cardRegiao === regiaoSelecionada;

        if (matchTexto && matchCargo && matchArea && matchRegiao) {
            card.style.display = "flex";
            countVisiveis++;
        } else {
            card.style.display = "none";
        }
    });

    if (counterBadge) {
        counterBadge.textContent = abaAtual === "caderninho"
            ? `${countVisiveis} Salva${countVisiveis !== 1 ? 's' : ''}`
            : `${countVisiveis} Encontrada${countVisiveis !== 1 ? 's' : ''}`;
    }
}

if (searchInput) searchInput.addEventListener("input", aplicarFiltros);
if (filterCargo) filterCargo.addEventListener("change", aplicarFiltros);
if (filterArea) filterArea.addEventListener("change", aplicarFiltros);
if (filterRegiao) filterRegiao.addEventListener("change", aplicarFiltros);