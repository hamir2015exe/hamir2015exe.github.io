let currentAudio = document.getElementById('globalAudioPlayer');
let currentPlayBtn = null;
let currentSongId = null;
let allSongs = [];

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
            console.error('songs.json okunamadı:', error);
            return [];
        }
    }
}

async function saveSongs(songs) {
    localStorage.setItem('music_songs_data', JSON.stringify(songs));
}

async function loadIndexSongs(categoryFilter = 'Tümü') {
    const songGrid = document.getElementById('songGrid');
    if (!songGrid) return;

    allSongs = await getSongs();
    let approvedSongs = allSongs.filter(s => s.approved);

    if (categoryFilter !== 'Tümü') {
        approvedSongs = approvedSongs.filter(s => s.category === categoryFilter);
    }

    songGrid.innerHTML = '';

    if (approvedSongs.length === 0) {
        songGrid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center;">Bu kategoride yayınlanmış şarkı bulunamadı.</p>';
        return;
    }

    approvedSongs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
            <div class="song-cover-container">
                <img src="${song.cover}" alt="${song.title}" class="song-cover" onerror="this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300'">
                <span class="category-tag">${song.category || 'Genel'}</span>
            </div>
            <div class="song-info">
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
            </div>
            <button class="play-btn" onclick="playSong('${song.url}', ${song.id}, this)">
                ▶ Oynat
            </button>
        `;
        songGrid.appendChild(card);
    });
}

function filterCategory(category, element) {
    document.querySelectorAll('.filter-chip').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    loadIndexSongs(category);
}

function playSong(url, songId, btnElement) {
    if (!currentAudio) {
        currentAudio = document.getElementById('globalAudioPlayer');
    }

    if (currentSongId === songId && !currentAudio.paused) {
        currentAudio.pause();
        btnElement.innerHTML = '▶ Oynat';
        currentPlayBtn = null;
        currentSongId = null;
        return;
    }

    if (currentPlayBtn) {
        currentPlayBtn.innerHTML = '▶ Oynat';
    }

    currentAudio.src = url;
    currentSongId = songId;
    currentPlayBtn = btnElement;

    currentAudio.play().then(() => {
        btnElement.innerHTML = '⏸ Durdur';
    }).catch(err => {
        alert('Şarkı ses dosyası oynatılamadı! Lütfen linkin doğrudan çalışan bir .mp3 bağlantısı olduğunu kontrol edin.');
        btnElement.innerHTML = '▶ Oynat';
        currentSongId = null;
        currentPlayBtn = null;
    });

    currentAudio.onended = () => {
        btnElement.innerHTML = '▶ Oynat';
        currentSongId = null;
        currentPlayBtn = null;
    };
}

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
        const category = document.getElementById('songCategory').value;
        const url = document.getElementById('songUrl').value;
        const cover = document.getElementById('songCover').value;
        const isApproved = document.getElementById('autoPublishToggle').checked;

        const songs = await getSongs();
        const newSong = {
            id: Date.now(),
            title,
            artist,
            category,
            url,
            cover,
            approved: isApproved
        };

        songs.push(newSong);
        await saveSongs(songs);

        addSongForm.reset();
        loadAdminSongs();
        alert('İçerik başarıyla kaydedildi!');
    });
}

async function loadAdminSongs() {
    const tableBody = document.getElementById('adminSongTableBody');
    if (!tableBody) return;

    const songs = await getSongs();
    tableBody.innerHTML = '';

    if (songs.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Kayıt bulunamadı.</td></tr>';
        return;
    }

    songs.forEach(song => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${song.cover}" width="40" height="40" style="object-fit:cover; border-radius:6px;" onerror="this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300'"></td>
            <td><strong>${song.title}</strong><br><span style="color:var(--text-muted); font-size:0.8rem;">${song.artist}</span></td>
            <td><span style="background:rgba(255,255,255,0.1); padding:4px 8px; border-radius:10px; font-size:0.8rem;">${song.category || 'Genel'}</span></td>
            <td>
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; background: ${song.approved ? 'rgba(102, 252, 241, 0.2); color: #66fcf1;' : 'rgba(255, 77, 77, 0.2); color: #ff4d4d;'}">
                    ${song.approved ? 'Yayında' : 'Onay Bekliyor'}
                </span>
            </td>
            <td>
                <button class="btn" style="padding: 4px 8px; font-size: 0.8rem; width: auto; margin-right:4px;" onclick="toggleApproval(${song.id})">
                    ${song.approved ? 'Kaldır' : 'Yayınla'}
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
    if (confirm('Silmek istediğinize emin misiniz?')) {
        let songs = await getSongs();
        songs = songs.filter(s => s.id !== id);
        await saveSongs(songs);
        loadAdminSongs();
    }
}
