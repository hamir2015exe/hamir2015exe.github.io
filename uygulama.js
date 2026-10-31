function getStoredSongs() {
    return JSON.parse(localStorage.getItem('published_media_power_sevko')) || [];
}

function saveStoredSongs(songs) {
    localStorage.setItem('published_media_power_sevko', JSON.stringify(songs));
}

function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function renderPublicSongs(filterText = '') {
    const container = document.getElementById('musicContainer');
    if (!container) return;
    
    let songs = getStoredSongs();
    container.innerHTML = '';
    
    let filtered = songs.filter(s => s.title.toLowerCase().includes(filterText.toLowerCase()) || s.artist.toLowerCase().includes(filterText.toLowerCase()));

    if(filtered.length === 0) {
        container.innerHTML = '<p style="color:#777;">Henüz eklenen medya yok. /admin.html sayfasına gidip şifre (2015) ile ekleyebilirsin!</p>';
        return;
    }

    filtered.forEach((song, index) => {
        const card = document.createElement('div');
        card.className = 'music-card';
        card.innerHTML = `
            <span class="tag">Power Şevko Reklamsız</span>
            <img src="${song.thumbnail}" alt="Kapak" style="width:100%; height:160px; object-fit:cover; border-radius:6px;">
            <h3>${song.title}</h3>
            <p style="color:#aaa;">${song.artist}</p>
            
            <!-- Gizli veya doğrudan oynatma alanı -->
            <div id="player-${index}" style="margin-top:10px;">
                <button onclick="playMedia(${index})" style="width:100%; background:#8b0000; padding:8px; border-radius:5px; color:white; font-weight:bold; cursor:pointer;">▶ Dinle / Oynat</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function playMedia(index) {
    let songs = getStoredSongs();
    const song = songs[index];
    const playerContainer = document.getElementById(`player-${index}`);
    
    // Reklamsız ve doğrudan oynatıcı katmanı
    playerContainer.innerHTML = `
        <iframe width="100%" height="160" src="https://www.youtube-nocookie.com/embed/${song.videoId}?autoplay=1&rel=0&modestbranding=1" title="${song.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius:6px;"></iframe>
    `;
}

function filterSongs() {
    const query = document.getElementById('searchInput').value;
    renderPublicSongs(query);
}

function publishRealMedia() {
    const title = document.getElementById('songTitle').value.trim();
    const artist = document.getElementById('songArtist').value.trim();
    const url = document.getElementById('youtubeUrl').value.trim();
    const isPublishActive = document.getElementById('publishToggle').checked;
    
    const videoId = extractYouTubeId(url);

    if (!title || !artist || !videoId) {
        alert("Lütfen tüm alanları doldurun ve geçerli bir YouTube linki girin!");
        return;
    }

    if (!isPublishActive) {
        alert("Yayınlama anahtarı kapalı!");
        return;
    }

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    let songs = getStoredSongs();
    const newMedia = {
        title: title,
        artist: artist,
        videoId: videoId,
        thumbnail: thumbnailUrl
    };

    songs.unshift(newMedia);
    saveStoredSongs(songs);
    renderPublicSongs();

    document.getElementById('songTitle').value = '';
    document.getElementById('songArtist').value = '';
    document.getElementById('youtubeUrl').value = '';

    alert("✅ Medya başarıyla eklendi, artık oynatılabilir!");
}
