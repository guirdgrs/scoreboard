// ---------- CONFIGURAÇÃO INICIAL ----------
const defaultAvatars = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
];

// Carrega players do localStorage
let players = loadPlayersFromStorage();
let editingIndex = null;
let selectedAvatar = defaultAvatars[0];

// ---------- ELEMENTOS DO DOM ----------
const playersList = document.getElementById('playersList');
const playerForm = document.getElementById('playerForm');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const avatarGrid = document.getElementById('avatarGrid');

// ---------- FUNÇÕES DE STORAGE ----------
function loadPlayersFromStorage() {
    try {
        const saved = localStorage.getItem('scoreboardPlayers');
        console.log('Dados carregados do localStorage:', saved);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Erro ao carregar players:', error);
        return [];
    }
}

function savePlayersToStorage() {
    try {
        localStorage.setItem('scoreboardPlayers', JSON.stringify(players));
        console.log('Players salvos:', players);
    } catch (error) {
        console.error('Erro ao salvar players:', error);
        Swal.fire('Erro!', 'Não foi possível salvar os players.', 'error');
    }
}

// ---------- INICIALIZAÇÃO ----------
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard carregado. Players:', players);
    renderPlayersList();
    // renderAvatarOptions();
    setupEventListeners();
});

// ---------- RENDERIZAR LISTA DE PLAYERS ----------
function renderPlayersList() {
    console.log('Renderizando lista de players:', players);
    
    if (players.length === 0) {
        playersList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-users text-4xl mb-3 opacity-50"></i>
                <p class="text-lg">Nenhum player cadastrado</p>
                <p class="text-sm">Adicione o primeiro player usando o formulário ao lado</p>
            </div>
        `;
        return;
    }

    playersList.innerHTML = players.map((player, index) => `
        <div class="player-card bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <img src="${player.avatar}" 
                         alt="${player.name}"
                         class="w-16 h-16 rounded-full border-4 border-white shadow-md"
                         onerror="this.src='${defaultAvatars[0]}'">
                    <div>
                        <h3 class="font-bold text-lg text-gray-800">${player.name}</h3>
                        <p class="text-gray-600">
                            <i class="fas fa-coins text-yellow-500 mr-1"></i>
                            Score: <span class="font-semibold">R$ ${player.score.toLocaleString()}</span>
                        </p>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="editPlayer(${index})" 
                            class="btn-hover px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold">
                        <i class="fas fa-edit mr-1"></i>
                        Editar
                    </button>
                    <button onclick="deletePlayer(${index})" 
                            class="btn-hover px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold">
                        <i class="fas fa-trash mr-1"></i>
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ---------- RENDERIZAR OPÇÕES DE AVATAR ----------
// function renderAvatarOptions() {
//     avatarGrid.innerHTML = defaultAvatars.map((avatar, index) => `
//         <div class="avatar-option rounded-lg border-2 border-gray-300 p-1 ${index === 0 ? 'avatar-selected' : ''}"
//              onclick="selectAvatar('${avatar}', this)">
//             <img src="${avatar}" 
//                  alt="Avatar ${index + 1}"
//                  class="w-full h-16 object-cover rounded-md">
//         </div>
//     `).join('');
// }

// ---------- SELECIONAR AVATAR ----------
function selectAvatar(avatarUrl, element) {
    selectedAvatar = avatarUrl;
    
    // Remove seleção de todos
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.remove('avatar-selected');
    });
    
    // Adiciona seleção ao clicado
    element.classList.add('avatar-selected');
    
    // Limpa URL customizada quando seleciona um avatar padrão
    document.getElementById('customAvatarUrl').value = '';
}

// ---------- CONFIGURAR EVENT LISTENERS ----------
function setupEventListeners() {
    // Form submission
    playerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        savePlayer();
    });

    // Cancel edit
    cancelEditBtn.addEventListener('click', cancelEdit);

    // Reset all scores
    // document.getElementById('resetAllBtn').addEventListener('click', resetAllScores);

    // Clear all players
    // document.getElementById('clearAllBtn').addEventListener('click', clearAllPlayers);

    // Custom avatar URL change
    document.getElementById('customAvatarUrl').addEventListener('input', function(e) {
        if (e.target.value) {
            selectedAvatar = e.target.value;
            // Desmarca avatares padrão quando usa URL customizada
            document.querySelectorAll('.avatar-option').forEach(option => {
                option.classList.remove('avatar-selected');
            });
        }
    });
}

// ---------- SALVAR PLAYER ----------
function savePlayer() {
    const nameInput = document.getElementById('playerName');
    const customAvatarInput = document.getElementById('customAvatarUrl');
    
    const name = nameInput.value.trim();
    const customAvatarUrl = customAvatarInput.value.trim();

    if (!name) {
        Swal.fire('Erro!', 'Por favor, digite um nome para o player.', 'error');
        return;
    }

    // Verifica se já existe um player com esse nome (exceto quando está editando)
    const existingPlayerIndex = players.findIndex((player, index) => 
        player.name.toLowerCase() === name.toLowerCase() && index !== editingIndex
    );

    if (existingPlayerIndex !== -1) {
        Swal.fire('Erro!', `Já existe um player com o nome "${name}".`, 'error');
        return;
    }

    // Usa avatar customizado se fornecido, senão usa o selecionado
    const avatar = customAvatarUrl || selectedAvatar;

    if (editingIndex !== null) {
        // Editar player existente
        players[editingIndex] = { 
            name, 
            score: players[editingIndex].score, // Mantém o score atual
            avatar 
        };
        Swal.fire('Sucesso!', `Player "${name}" atualizado com sucesso!`, 'success');
    } else {
        // Adicionar novo player - score sempre começa em 0
        const newPlayer = { name, score: 0, avatar };
        players.push(newPlayer);
        Swal.fire('Sucesso!', `Player "${name}" adicionado com sucesso!`, 'success');
    }

    savePlayersToStorage();
    renderPlayersList();
    resetForm();
}

// ---------- EDITAR PLAYER ----------
function editPlayer(index) {
    const player = players[index];
    editingIndex = index;

    // Preencher formulário
    document.getElementById('playerName').value = player.name;
    document.getElementById('customAvatarUrl').value = '';

    // Selecionar avatar
    selectedAvatar = player.avatar;
    
    // Verifica se o avatar está na lista padrão
    const isDefaultAvatar = defaultAvatars.includes(player.avatar);
    if (isDefaultAvatar) {
        // Seleciona o avatar padrão correspondente
        document.querySelectorAll('.avatar-option').forEach((option, i) => {
            if (defaultAvatars[i] === player.avatar) {
                option.classList.add('avatar-selected');
            } else {
                option.classList.remove('avatar-selected');
            }
        });
    } else {
        // É um avatar customizado, limpa seleção dos padrões
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.classList.remove('avatar-selected');
        });
        document.getElementById('customAvatarUrl').value = player.avatar;
    }

    // Atualizar UI para modo edição
    formTitle.innerHTML = '<i class="fas fa-edit mr-2 text-[#658cc5]"></i>Editar Player';
    submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Salvar Alterações';
    cancelEditBtn.classList.remove('hidden');

    // Rolar para o formulário
    document.querySelector('.lg\\:col-span-1').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// ---------- CANCELAR EDIÇÃO ----------
function cancelEdit() {
    editingIndex = null;
    resetForm();
}

// ---------- RESETAR FORMULÁRIO ----------
function resetForm() {
    playerForm.reset();
    document.getElementById('customAvatarUrl').value = '';
    editingIndex = null;
    
    // Resetar UI
    formTitle.innerHTML = '<i class="fas fa-plus-circle mr-2 text-[#658cc5]"></i>Adicionar Novo Player';
    submitBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>Adicionar Player';
    cancelEditBtn.classList.add('hidden');
    
    // Resetar seleção de avatar
    selectedAvatar = defaultAvatars[0];
    renderAvatarOptions();
}

// ---------- EXCLUIR PLAYER ----------
function deletePlayer(index) {
    const playerName = players[index].name;
    
    Swal.fire({
        title: 'Tem certeza?',
        html: `Você está prestes a excluir o player <strong>"${playerName}"</strong>.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            players.splice(index, 1);
            savePlayersToStorage();
            renderPlayersList();
            
            Swal.fire(
                'Excluído!',
                `Player "${playerName}" foi excluído com sucesso.`,
                'success'
            );
        }
    });
}

// ---------- RESETAR TODOS OS SCORES ----------
function resetAllScores() {
    if (players.length === 0) {
        Swal.fire('Info!', 'Não há players para resetar.', 'info');
        return;
    }

    Swal.fire({
        title: 'Resetar Scores?',
        html: 'Todos os players terão seus scores resetados para 0.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#f59e0b',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sim, resetar!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            players.forEach(player => {
                player.score = 0;
            });
            savePlayersToStorage();
            renderPlayersList();
            
            Swal.fire(
                'Scores Resetados!',
                'Todos os players agora têm score de 0.',
                'success'
            );
        }
    });
}

// ---------- LIMPAR TODOS OS PLAYERS ----------
function clearAllPlayers() {
    if (players.length === 0) {
        Swal.fire('Info!', 'Não há players para limpar.', 'info');
        return;
    }

    Swal.fire({
        title: 'Limpar Tudo?',
        html: `Você está prestes a excluir <strong>todos os ${players.length} players</strong>. Esta ação não pode ser desfeita!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, limpar tudo!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            players = [];
            savePlayersToStorage();
            renderPlayersList();
            resetForm();
            
            Swal.fire(
                'Limpo!',
                'Todos os players foram removidos.',
                'success'
            );
        }
    });
}

// ---------- EXPORTAR FUNÇÕES PARA O ESCOPO GLOBAL ----------
window.editPlayer = editPlayer;
window.deletePlayer = deletePlayer;
window.selectAvatar = selectAvatar;