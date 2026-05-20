// Inisialisasi Elemen DOM
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const musicContainer = document.getElementById('musicContainer');
const messageContainer = document.getElementById('messageContainer');
const resetBtn = document.getElementById('resetBtn');

// 1. Logika Pengambilan Data API (Data Fetching dengan Penanganan Error)
async function fetchMusicData(keyword) {
    // Tampilkan elemen loading transisi yang bersih
    messageContainer.innerHTML = `<div class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-secondary me-2" role="status"></div>Loading data dari iTunes...</div>`;
    musicContainer.innerHTML = ''; 

    try {
        // Melakukan request HTTP GET secara asinkronus ke server iTunes
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(keyword)}&limit=12&entity=song`);
        
        if (!response.ok) {
            throw new Error('Gagal mendapatkan respons valid dari server API.');
        }

        const data = await response.json();

        // Pemeriksaan ketersediaan data (Empty State handling)
        if (data.results.length === 0) {
            messageContainer.innerHTML = `<div class="alert alert-dark border-secondary text-muted text-center" style="background-color: #111827;">Koleksi tidak ditemukan. Coba kata kunci alternatif.</div>`;
            return;
        }

        // Hilangkan pesan loading jika data siap diproses
        messageContainer.innerHTML = '';
        renderMusicGallery(data.results);

    } catch (error) {
        // Penanganan error jika jaringan offline atau API bermasalah
        console.error(error);
        messageContainer.innerHTML = `
            <div class="alert alert-danger border-danger text-center" style="background-color: #1c1012; color: #fca5a5;">
                <strong>Gagal Memuat Konten:</strong> ${error.message || 'Koneksi internet terputus.'}
            </div>`;
    }
}

// 2. Logika Presentasi Data Antarmuka (Render Loop UI + Audio Player Terintegrasi)
function renderMusicGallery(songs) {
    songs.forEach(song => {
        // Mengubah resolusi gambar bawaan iTunes agar tajam (400x400)
        const highResCover = song.artworkUrl100.replace('100x100bb.jpg', '400x400bb.jpg');

        const itemHtml = `
            <div class="col">
                <div class="music-card d-flex flex-column justify-content-between h-100">
                    <div>
                        <div class="image-wrapper">
                            <img src="${highResCover}" alt="${song.collectionName || 'Cover'}">
                        </div>
                        <div>
                            <div class="music-title text-truncate" title="${song.trackName}">${song.trackName}</div>
                            <div class="music-meta text-truncate">
                                <span class="music-category">${song.primaryGenreName}</span> • ${song.artistName}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <audio controls class="w-100 custom-audio-player" style="height: 30px;">
                            <source src="${song.previewUrl}" type="audio/x-m4a">
                            Browser tidak mendukung pemutar audio.
                        </audio>
                    </div>
                </div>
            </div>
        `;
        musicContainer.insertAdjacentHTML('beforeend', itemHtml);
    });
}

// 3. Event Handling (Kontrol Aksi Form & Tombol)
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const keyword = searchInput.value.trim();
    if (keyword) {
        fetchMusicData(keyword);
    }
});

resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    fetchMusicData('Frank Ocean'); // Mengembangkan state awal ke musisi default pilihan Hida's Garage
});

// Panggilan Inisialisasi Awal saat Aplikasi Dimuat Pertama Kali
fetchMusicData('Frank Ocean');