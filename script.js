// ---------- CONFIG ----------
// Carrega players do localStorage
function loadPlayersFromStorage() {
    try {
        const saved = localStorage.getItem('scoreboardPlayers');
        console.log('Scoreboard - Dados carregados:', saved);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Erro ao carregar players no scoreboard:', error);
        return [];
    }
}

let players = loadPlayersFromStorage();
let selected = null;
let betPool = 0;      
let betPlayers = [];

const grid = document.getElementById("playersGrid");
const bankValue = document.getElementById("bankValue");

// ---------- SALVAR PLAYERS NO LOCALSTORAGE ----------
function savePlayersToStorage() {
    try {
        localStorage.setItem('scoreboardPlayers', JSON.stringify(players));
        console.log('Scoreboard - Players salvos:', players);
    } catch (error) {
        console.error('Erro ao salvar players do scoreboard:', error);
    }
}

// ---------- CRIAR CARDS ----------
function renderPlayers() {
    console.log('Scoreboard - Renderizando players:', players);
    grid.innerHTML = '';
    
    if (players.length === 0) {
        grid.innerHTML = `
            <div class="col-span-5 text-center py-8 text-gray-500">
                <i class="fas fa-users text-4xl mb-3 opacity-50"></i>
                <p class="text-lg">Nenhum player cadastrado</p>
                <p class="text-sm">
                    <a href="dashboard.html" class="text-[#658cc5] hover:underline font-semibold">
                        Clique aqui para adicionar players
                    </a>
                </p>
            </div>
        `;
        return;
    }

    players.forEach((p, i) => {
        const card = document.createElement("div");
        card.className =
            "playerCard player-hover bg-[#cab7d9] p-4 rounded-xl shadow text-center cursor-pointer";
        card.dataset.index = i;

        card.innerHTML = `
            <img src="${p.avatar}" 
                 class="w-20 h-20 rounded-full mx-auto mb-2 border-4 border-white shadow-md"
                 onerror="this.src='https://media.discordapp.net/attachments/1253765474198491147/1441981572906614894/ygona-1.jpg?ex=6923c57d&is=692273fd&hm=dabb1f97e50a32b17b5cef391ee9161b3fe029f35cfa3786b8215d17fea5c692&=&format=webp&width=648&height=648'">
            <h3 class="font-bold text-lg">${p.name}</h3>
            <p id="score-${i}" class="mt-2 font-bold text-xl">R$ ${p.score.toLocaleString()}</p>
        `;

        grid.appendChild(card);
    });

    setupPlayerEvents();
    updateBetPlayersList();
}

// ---------- CONFIGURAR EVENTOS DOS PLAYERS ----------
function setupPlayerEvents() {
    // Seleção normal de players (clique simples)
    document.querySelectorAll(".playerCard").forEach(card => {
        card.addEventListener("click", e => {
            e.stopPropagation();
            clearSelection();
            selected = Number(card.dataset.index);
            card.classList.add("selected");

            // Swal.fire({
            //     title: `${players[selected].name} selecionado`,
            //     text: 'Duplo-clique para adicionar/remover da aposta',
            //     icon: 'info',
            //     timer: 2000,
            //     showConfirmButton: false
            // });
        });

        // Duplo clique para adicionar/remover da aposta
        card.addEventListener("dblclick", e => {
            e.stopPropagation();
            const index = Number(card.dataset.index);
            
            if (betPlayers.includes(index)) {
                // Remove da aposta
                betPlayers = betPlayers.filter(i => i !== index);
                card.classList.remove("bet-selected");
                Swal.fire(`${players[index].name} removido da aposta!`, '', 'info');
            } else {
                // Adiciona à aposta
                betPlayers.push(index);
                card.classList.add("bet-selected");
                Swal.fire(`${players[index].name} adicionado da aposta!`, '', 'success');
            }
            
            updateBetPlayersList();
        });
    });
}

// ---------- ATUALIZAR LISTA DE PLAYERS NA APOSTA ----------
function updateBetPlayersList() {
    const betPlayersList = document.getElementById("betPlayersList");
    if (!betPlayersList) return;
    
    if (betPlayers.length === 0) {
        betPlayersList.innerHTML = '<p class="text-gray-500 text-sm">Nenhum player selecionado para aposta</p>';
        return;
    }

    betPlayersList.innerHTML = betPlayers.map(index => 
        `<span class="inline-flex items-center gap-2 bg-red-200 text-red-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
            <span class="w-2 h-2 bg-red-500 rounded-full"></span>
            ${players[index].name}
        </span>`
    ).join('');
}

// ---------- ANIMAÇÃO DE SCORE ----------
function animateScore(element) {
    element.classList.add('score-change');
    setTimeout(() => {
        element.classList.remove('score-change');
    }, 300);
}

// ---------- SELEÇÃO ----------
const bank = document.getElementById("bank");

// Remove seleção global
function clearSelection() {
    document.querySelectorAll(".selected").forEach(el => el.classList.remove("selected"));
    selected = null;
}

// Evento de clique global apenas para limpar seleção normal
document.addEventListener("click", (e) => {
    if (!e.target.closest('.playerCard') && !e.target.closest('#bank')) {
        clearSelection();
    }
});

if (bank) {
    bank.addEventListener("click", e => {
        e.stopPropagation();
        clearSelection();
        selected = "bank";
        bank.classList.add("selected");
    });
}

// ---------- LIMPAR SELEÇÃO DE APOSTA ----------
document.getElementById("btnClearBetPlayers").addEventListener("click", () => {
    betPlayers = [];
    document.querySelectorAll('.playerCard').forEach(card => {
        card.classList.remove("bet-selected");
    });
    updateBetPlayersList();
    Swal.fire("Seleção de aposta limpa!", '', 'info');
});

// ---------- ADICIONAR / REMOVER ----------
document.querySelectorAll(".btn-add").forEach(btn => {
    btn.addEventListener("click", () => {
        if (selected === null) {
            Swal.fire("Selecione um player ou o cofrinho primeiro!");
            return;
        }

        const value = Number(btn.dataset.value);

        if (selected === "bank") {
            betPool += value;
            bankValue.textContent = `R$ ${betPool.toLocaleString()}`;
            animateScore(bankValue);
        } else {
            players[selected].score += value;
            const scoreElement = document.getElementById(`score-${selected}`);
            scoreElement.textContent = `R$ ${players[selected].score.toLocaleString()}`;
            animateScore(scoreElement);
            savePlayersToStorage();
        }

        Swal.fire({
            title: `+R$ ${value.toLocaleString()} adicionado!`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    });
});

document.querySelectorAll(".btn-sub").forEach(btn => {
    btn.addEventListener("click", () => {
        if (selected === null) {
            Swal.fire("Selecione um player ou o cofrinho primeiro!");
            return;
        }

        const value = Number(btn.dataset.value);

        if (selected === "bank") {
            betPool = Math.max(0, betPool - value);
            bankValue.textContent = `R$ ${betPool.toLocaleString()}`;
            animateScore(bankValue);
        } else {
            players[selected].score -= value;
            const scoreElement = document.getElementById(`score-${selected}`);
            scoreElement.textContent = `R$ ${players[selected].score.toLocaleString()}`;
            animateScore(scoreElement);
            savePlayersToStorage();
        }

        Swal.fire({
            title: `-R$ ${value.toLocaleString()} removido!`,
            icon: 'info',
            timer: 1500,
            showConfirmButton: false
        });
    });
});

// ---------- DESCONTAR DOS PLAYERS ----------
document.getElementById("btnDescontar").addEventListener("click", () => {
    const betValue = Number(document.getElementById("betInput").value);

    if (!betValue || betValue <= 0) {
        Swal.fire("Digite um valor válido para a aposta!");
        return;
    }

    if (betPlayers.length === 0) {
        Swal.fire("Selecione pelo menos um player para a aposta! (Duplo-clique nos players)");
        return;
    }

    // Verificar se todos os players selecionados têm saldo suficiente
    const insufficientBalancePlayers = betPlayers.filter(index => 
        players[index].score < betValue
    );

    if (insufficientBalancePlayers.length > 0) {
        const names = insufficientBalancePlayers.map(index => players[index].name).join(', ');
        Swal.fire(`Os seguintes players não têm saldo suficiente: ${names}`);
        return;
    }

    // Descontar de todos os players selecionados
    betPlayers.forEach(index => {
        players[index].score -= betValue;
        const scoreElement = document.getElementById(`score-${index}`);
        scoreElement.textContent = `R$ ${players[index].score.toLocaleString()}`;
        animateScore(scoreElement);
    });

    const totalBet = betValue * betPlayers.length;
    betPool += totalBet;
    bankValue.textContent = `R$ ${betPool.toLocaleString()}`;

    // Atualiza total
    document.getElementById("betTotal").value = totalBet.toLocaleString();

    savePlayersToStorage();

    Swal.fire({
        title: 'Aposta realizada!',
        html: `<strong>${betPlayers.length} players</strong> apostaram <strong>R$ ${betValue.toLocaleString()}</strong> cada<br>
              <strong>Total: R$ ${totalBet.toLocaleString()}</strong>`,
        icon: 'success',
        confirmButtonText: 'Ótimo!'
    });
});

// ---------- PREMIAR ----------
document.getElementById("btnPremio").addEventListener("click", () => {
    if (betPool === 0) {
        Swal.fire("Não há aposta para distribuir!");
        return;
    }

    const playerNames = players.map(p => p.name);

    Swal.fire({
        title: "Escolha o vencedor",
        input: "select",
        inputOptions: playerNames.reduce((acc, name, i) => {
            acc[i] = name;
            return acc;
        }, {}),
        inputPlaceholder: "Selecione um vencedor",
        confirmButtonText: "Dar Prêmio",
        cancelButtonText: "Cancelar",
        showCancelButton: true
    }).then(res => {
        if (!res.isConfirmed) return;

        const winner = Number(res.value);
        const prize = betPool;

        // dar prêmio
        players[winner].score += prize;
        const scoreElement = document.getElementById(`score-${winner}`);
        scoreElement.textContent = `R$ ${players[winner].score.toLocaleString()}`;
        animateScore(scoreElement);

        // resetar tudo
        betPool = 0;
        betPlayers = [];
        bankValue.textContent = "R$ 0";
        document.getElementById("betTotal").value = "0";
        
        // Limpar seleção visual
        document.querySelectorAll('.playerCard').forEach(card => {
            card.classList.remove("bet-selected");
        });
        updateBetPlayersList();

        savePlayersToStorage();

        Swal.fire({
            title: "Prêmio Entregue!",
            html: `<div class="text-center">
                     <strong>${players[winner].name}</strong> ganhou<br>
                     <strong class="text-2xl text-green-600">R$ ${prize.toLocaleString()}</strong>
                   </div>`,
            icon: 'success',
            confirmButtonText: 'Fantástico!'
        });
    });
});

// ---------- INICIALIZAÇÃO ----------
document.addEventListener('DOMContentLoaded', function() {
    console.log('Scoreboard inicializado');
    renderPlayers();
    
    // Adiciona link para dashboard
    const container = document.querySelector('.bg-white');
    if (container) {
        const existingLink = container.querySelector('a[href="dashboard.html"]');
        if (!existingLink) {
            const header = container.querySelector('div:first-child');
            if (header) {
                const linkHtml = `
                    <div class="text-center mt-6">
                        <br>
                        <a href="dashboard.html" 
                           class="inline-flex items-center gap-2 px-6 py-3 bg-[#658cc5] hover:bg-[#587db3] text-white rounded-xl font-bold shadow-lg transition-all duration-200 btn-hover mb-4">
                            <i class="fas fa-cog"></i>
                            Gerenciar Players
                        </a>
                    </div>
                `;
                header.insertAdjacentHTML('afterend', linkHtml);
            }
        }
    }
});

document.getElementById("btnZerarCofrinho").addEventListener("click", () => {
    if (betPool === 0) {
        Swal.fire("O cofrinho já está vazio!", '', 'info');
        return;
    }

    Swal.fire({
        title: 'Zerar Cofrinho?',
        html: `Tem certeza que deseja zerar o cofrinho?<br><strong>R$ ${betPool.toLocaleString()}</strong> serão perdidos.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#9333ea',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sim, zerar!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const valorPerdido = betPool;
            betPool = 0;
            bankValue.textContent = "R$ 0";
            
            Swal.fire(
                'Cofrinho Zerado!',
                `R$ ${valorPerdido.toLocaleString()} foram removidos do cofrinho.`,
                'success'
            );
        }
    });
});