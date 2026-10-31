function getStoredSongs() {
    return JSON.parse(localStorage.getItem('published_songs_power_sevko')) || [];
}

function saveStoredSongs(songs) {
    localStorage.setItem('published_songs_power_sevko', JSON.stringify(songs));
}

function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function renderPublicSongs() {
    const container = document.getElementById('musicContainer');
    if (!container) return;
    
    let songs = getStoredSongs();
    container.innerHTML = '';
    
    if(songs.length === 0) {
        container.innerHTML = '<p style="color:#777;">Henüz paylaşılan içerik yok. /admin sayfasına girip şifre (2015) ile ilk içeriği ekleyebilirsin!</p>';
        return;
    }

    songs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'music-card';
        card.innerHTML = `
            <span class="tag">Power Şevko ${song.quality || ''}</span>
            <img src="${song.thumbnail}" alt="Kapak Resmi" style="width:100%; height:160px; object-fit:cover; border-radius:6px;">
            <h3>${song.title}</h3>
            <p style="color:#aaa;">${song.artist}</p>
            <a href="https://www.youtube.com/watch?v=${song.videoId}" target="_blank" style="color: #ff4444; font-size: 13px; text-decoration: none;">▶ YouTube'da Aç / Dinle</a>
        `;
        container.appendChild(card);
    });
}

function simulateDownload(type) {
    const url = document.getElementById('youtubeUrl').value.trim();
    if (!extractYouTubeId(url)) {
        alert("Lütfen önce geçerli bir YouTube linki girin!");
        return;
    }
    if (type === '4k') {
        alert("📥 Video görseliyle birlikte 4K kalitesinde başarıyla indirildi!");
    } else {
        alert("📥 Video başarıyla indirildi!");
    }
}

function publishSong() {
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
        alert("Yayınlama anahtarı kapalı olduğu için içerik paylaşılamadı!");
        return;
    }

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    let songs = getStoredSongs();
    const newSong = {
        title: title,
        artist: artist,
        videoId: videoId,
        thumbnail: thumbnailUrl,
        quality: document.getElementById('youtubeUrl').value.includes('4k') ? '4K' : 'HD'
    };

    songs.unshift(newSong);
    saveStoredSongs(songs);
    renderPublicSongs();

    document.getElementById('songTitle').value = '';
    document.getElementById('songArtist').value = '';
    document.getElementById('youtubeUrl').value = '';

    alert("✅ İçerik indirildi ve ortak akışta başarıyla yayınlandı!");
}
