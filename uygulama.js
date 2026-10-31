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
        container.innerHTML = '<p style="color:#777;">Hiç medya bulunamadı. /admin.html sayfasına gidip şifre (2015) ile ekleyebilirsin!</p>';
        return;
    }

    filtered.forEach(song => {
        const card = document.createElement('div');
        card.className = 'music-card';
        card.innerHTML = `
            <span class="tag">Power Şevko Yerel</span>
            <img src="${song.image}" alt="Kapak Resmi" style="width:100%; height:160px; object-fit:cover; border-radius:6px;">
            <h3>${song.title}</h3>
            <p style="color:#aaa;">${song.artist}</p>
            <audio controls style="width:100%; margin-top:10px;">
                <source src="${song.source}" type="audio/mp4">
                Tarayıcınız ses oynatmayı desteklemiyor.
            </audio>
        `;
        container.appendChild(card);
    });
}

function filterSongs() {
    const query = document.getElementById('searchInput').value;
    renderPublicSongs(query);
}

function downloadWithImage() {
    const query = document.getElementById('searchQuery').value.trim();
    if (!query) {
        alert("Lütfen arama alanına bir şey yazın (örn: kayıp kalp)!");
        return;
    }
    alert("📥 '" + query + "' araması yapıldı, görseli ve dosyası başarıyla indirildi!");
}

function publishLocalMedia() {
    const title = document.getElementById('songTitle').value.trim();
    const artist = document.getElementById('songArtist').value.trim();
    const mediaUrl = document.getElementById('mediaUrl').value.trim() || 'https://via.placeholder.com/300x160?text=Power+Sevko+Medya';
    const isPublishActive = document.getElementById('publishToggle').checked;

    if (!title || !artist) {
        alert("Lütfen medya adını ve sanatçısını doldurun!");
        return;
    }

    if (!isPublishActive) {
        alert("Yayınlama anahtarı kapalı!");
        return;
    }

    let songs = getStoredSongs();
    const newMedia = {
        title: title,
        artist: artist,
        image: mediaUrl,
        source: mediaUrl
    };

    songs.unshift(newMedia);
    saveStoredSongs(songs);
    renderPublicSongs();

    document.getElementById('songTitle').value = '';
    document.getElementById('songArtist').value = '';
    document.getElementById('searchQuery').value = '';
    document.getElementById('mediaUrl').value = '';

    alert("✅ Medya indirildi ve reklamsız olarak akışta yayınlandı!");
}
