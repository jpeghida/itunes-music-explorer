// Inisialisasi Elemen DOM
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const musicContainer = document.getElementById('musicContainer');
const messageContainer = document.getElementById('messageContainer');
const resetBtn = document.getElementById('resetBtn');

// 1. Logika Request Menggunakan JSONP (Solusi Ampuh Bypass CORS GitHub Pages)
function fetchMusicData(keyword) {
    messageContainer.innerHTML = `<div class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-secondary me-2" role="status"></div>Loading data dari iTunes...</div>`;
    musicContainer.innerHTML = ''; 

    // Hapus script lama jika ada biar gak numpuk di memori
    const oldScript = document.getElementById('itunes-jsonp');
    if (oldScript) {
        oldScript.remove();
    }

    // Membuat elemen script baru untuk memanggil API iTunes via JSONP
    const script = document.createElement('script');
    script.id = 'itunes-jsonp';
    
    // Menambahkan parameter &callback=handleiTunesResponse agar membypass CORS
    script.src = `https://itunes.apple.com/search?term=${encodeURIComponent(keyword)}&limit=12&entity=song&callback=handleiTunesResponse`;
    
    // Penanganan error jika script gagal dimuat (misal: kuota habis/rto)
    script.onerror = function() {
        messageContainer.innerHTML = `
            <div class="alert alert-danger border-danger text-center" style="background-color: #1c1012; color: #fca5a5;">
                <strong>Gagal Memuat Konten:</strong> Koneksi ke API iTunes terputus.
            </div>`;
    };

    // Menyuntikkan script ke dokumen untuk mengeksekusi request
    document.body.appendChild(script);
}

// 2. Fungsi Callback Global (Wajib ada untuk menerima data JSONP)
window.handleiTunesResponse = function(data) {
    // Jalankan pengecekan jika data kosong
    if (!data || !data.results || data.results.length === 0) {
        messageContainer.innerHTML = `<div class="alert alert-dark border-secondary text-muted text-center" style="background-color: #111827;">Koleksi tidak ditemukan. Coba kata kunci alternatif.</div>`;
        return;
    }

    messageContainer.innerHTML = '';
    renderMusicGallery(data.results);
};

// 3. Logika Presentasi Data Antarmuka (Render Loop UI)
function renderMusicGallery(songs) {
    songs.forEach(song => {
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

// 4. Event Handling (Kontrol Aksi Form & Tombol)
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const keyword = searchInput.value.trim();
    if (keyword) {
        fetchMusicData(keyword);
    }
});

resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    fetchMusicData('Frank Ocean');
});

// Panggilan Inisialisasi Awal saat Aplikasi Dimuat Pertama Kali
fetchMusicData('Frank Ocean');
