// Ortak Veri Yönetimi ve Müzik Çalar Mantığı

let currentAudio = null;
let currentPlayBtn = null;

// Verileri localStorage ve songs.json üzerinden yönetme
async function getSongs() {
    let storedSongs = localStorage.getItem('music_songs_data');
    if (storedSongs) {
        return JSON.parse(storedSongs);
    } else {
        try {
            let response = await fetch('songs.json');
            let data = await response.json();
            localStorage.setItem('music_songs_data', JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('songs.json yüklenemedi:', error);
            return [];
        }
    }
}

async function saveSongs(songs) {
    localStorage.setItem('music_songs_data', JSON.stringify(songs));
}

// --- Index.html Mantığı ---
async function loadIndexSongs() {
    const songGrid = document.getElementById('songGrid');
    if (!songGrid) return;

    const songs = await getSongs();
    const approvedSongs = songs.filter(s => s.approved);

    songGrid.innerHTML = '';

    if (approvedSongs.length === 0) {
        songGrid.innerHTML = '<p style="color: var(--text-muted);">Henüz onaylanmış şarkı bulunmuyor.</p>';
        return;
    }

    approvedSongs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
            <img src="${song.cover}" alt="${song.title}" class="song-cover" onerror="this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300'">
            <div class="song-info">
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
            </div>
            <button class="play-btn" onclick="togglePlay('${song.url}', this)">
                ▶ Oynat
            </button>
        `;
        songGrid.appendChild(card);
    });
}

// Aynı Anda Tek Şarkı Kuralı (Kritik)
function togglePlay(url, btnElement) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        if (currentPlayBtn) {
            currentPlayBtn.innerHTML = '▶ Oynat';
            currentPlayBtn.style.backgroundColor = 'var(--accent-color)';
        }
        if (currentAudio.src === url || currentAudio.src === window.location.origin + url) {
            currentAudio = null;
            currentPlayBtn = null;
            return;
        }
    }

    currentAudio = new Audio(url);
    currentPlayBtn = btnElement;

    currentAudio.play().then(() => {
        btnElement.innerHTML = '⏸ Durdur';
        btnElement.style.backgroundColor = '#e91429';
    }).catch(err => {
        alert('Şarkı çalınamadı! Geçerli bir ses dosyası veya doğrudan URL olduğundan emin olun.');
        console.error(err);
        currentAudio = null;
        currentPlayBtn = null;
    });

    currentAudio.onended = () => {
        btnElement.innerHTML = '▶ Oynat';
        btnElement.style.backgroundColor = 'var(--accent-color)';
        currentAudio = null;
        currentPlayBtn = null;
    };
}

// --- Admin.html Mantığı ---
function initAdmin() {
    const loginForm = document.getElementById('loginForm');
    const loginOverlay = document.getElementById('loginOverlay');
    const adminPanel = document.getElementById('adminPanel');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginError = document.getElementById('loginError');

    if (sessionStorage.getItem('admin_logged_in') === 'true') {
        loginOverlay.style.display = 'none';
        adminPanel.style.display = 'block';
        loadAdminSongs();
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = document.getElementById('adminPassword').value;
        if (pass === 'hamit2015') {
            sessionStorage.setItem('admin_logged_in', 'true');
            loginOverlay.style.display = 'none';
            adminPanel.style.display = 'block';
            loadAdminSongs();
        } else {
            loginError.style.display = 'block';
        }
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('admin_logged_in');
        window.location.reload();
    });

    const addSongForm = document.getElementById('addSongForm');
    addSongForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('songTitle').value;
        const artist = document.getElementById('songArtist').value;
        const url = document.getElementById('songUrl').value;
        const cover = document.getElementById('songCover').value;
        const isApproved = document.getElementById('autoPublishToggle').checked;

        const songs = await getSongs();
        const newSong = {
            id: Date.now(),
            title,
            artist,
            url,
            cover,
            approved: isApproved
        };

        songs.push(newSong);
        await saveSongs(songs);

        addSongForm.reset();
        loadAdminSongs();
        alert(isApproved ? 'Şarkı başarıyla eklendi ve yayına alındı!' : 'Şarkı eklendi (Onay bekliyor).');
    });
}

async function loadAdminSongs() {
    const tableBody = document.getElementById('adminSongTableBody');
    if (!tableBody) return;

    const songs = await getSongs();
    tableBody.innerHTML = '';

    if (songs.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Sistemde kayıtlı şarkı yok.</td></tr>';
        return;
    }

    songs.forEach(song => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${song.cover}" width="40" height="40" style="object-fit:cover; border-radius:4px;" onerror="this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300'"></td>
            <td><strong>${song.title}</strong><br><span style="color:var(--text-muted); font-size:0.85rem;">${song.artist}</span></td>
            <td>
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; background: ${song.approved ? 'rgba(29, 185, 84, 0.2); color: #1db954;' : 'rgba(233, 20, 41, 0.2); color: #e91429;'}">
                    ${song.approved ? 'Onaylı / Yayında' : 'Onay Bekliyor'}
                </span>
            </td>
            <td>
                <button class="btn" style="padding: 6px 12px; font-size: 0.85rem; margin-right: 5px; width: auto;" onclick="toggleApproval(${song.id})">
                    ${song.approved ? 'Yayından Kaldır' : 'Onayla'}
                </button>
                <button class="btn-danger" onclick="deleteSong(${song.id})">Sil</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

async function toggleApproval(id) {
    const songs = await getSongs();
    const song = songs.find(s => s.id === id);
    if (song) {
        song.approved = !song.approved;
        await saveSongs(songs);
        loadAdminSongs();
    }
}

async function deleteSong(id) {
    if (confirm('Bu şarkıyı silmek istediğinize emin misiniz?')) {
        let songs = await getSongs();
        songs = songs.filter(s => s.id !== id);
        await saveSongs(songs);
        loadAdminSongs();
    }
}
