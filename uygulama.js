function getStoredSongs() {
    return JSON.parse(localStorage.getItem('published_media_power_sevko')) || [];
}

function saveStoredSongs(songs) {
    localStorage.setItem('published_media_power_sevko', JSON.stringify(songs));
}

function renderPublicSongs(filterText = '') {
    const container = document.getElementById('musicContainer');
    if (!container) return;
    
    let songs = getStoredSongs();
    container.innerHTML = '';
    
    let filtered = songs.filter(s => s.title.toLowerCase().includes(filterText.toLowerCase()) || s.artist.toLowerCase().includes(filterText.toLowerCase()));

    if(filtered.length === 0) {
        container.innerHTML = '<p style="color:#777;">Henüz medya eklenmedi. /admin.html sayfasından ekleyebilirsin!</p>';
        return;
    }

    filtered.forEach(song => {
        const card = document.createElement('div');
        card.className = 'music-card';
        card.innerHTML = `
            <span class="tag">Power Şevko Yerel & Reklamsız</span>
            <img src="${song.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300'}" alt="Kapak" style="width:100%; height:160px; object-fit:cover; border-radius:6px;">
            <h3>${song.title}</h3>
            <p style="color:#aaa;">${song.artist}</p>
            
            <audio controls style="width:100%; margin-top:10px;">
                <source src="${song.url}" type="audio/mp4">
                <source src="${song.url}" type="audio/mpeg">
                Tarayıcınız bu medya formatını desteklemiyor.
            </audio>
        `;
        container.appendChild(card);
    });
}

function filterSongs() {
    const query = document.getElementById('searchInput').value;
    renderPublicSongs(query);
}

function publishLocalFile() {
    const title = document.getElementById('songTitle').value.trim();
    const artist = document.getElementById('songArtist').value.trim();
    const url = document.getElementById('mediaUrl').value.trim();
    const cover = document.getElementById('coverUrl').value.trim();

    if (!title || !artist || !url) {
        alert("Lütfen başlık, sanatçı ve medya dosya linkini doldurun!");
        return;
    }

    let songs = getStoredSongs();
    const newMedia = {
        title: title,
        artist: artist,
        url: url,
        cover: cover
    };

    songs.unshift(newMedia);
    saveStoredSongs(songs);
    renderPublicSongs();

    document.getElementById('songTitle').value = '';
    document.getElementById('songArtist').value = '';
    document.getElementById('mediaUrl').value = '';
    document.getElementById('coverUrl').value = '';

    alert("✅ Medya başarıyla eklendi! Artık YouTube'a girmeden doğrudan tarayıcından çalınacak.");
}
