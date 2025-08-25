let moleInterval; // interval show mole
let timerId;      // interval timer
let timeLeft;     // waktu tersisa
let score;        // skor
let gameOver;     // status game
let storyData;    // data dari json

// Story: load dan render penuh
$(document).ready(function () {
// Pastikan elemen game & modal hidden (backup selain inline style)
$("#modal, #title, .status-container, #game, #endModal").hide();

// Load JSON
fetch("json/data.json")
    .then(res => res.json())
    .then(data => {
        storyData = data.books[0]; // ambil buku pertama
        // Title story
        $("#storyTitle").text(storyData.title);
        // Gabungkan semua paragraf jadi <p>…</p> agar panjang dan scroll
        const htmlStory = storyData.story.map(p => `<p>${p}</p>`).join("");
        $("#storyText").html(htmlStory);
    })
    .catch(err => {
        console.error("Gagal load JSON:", err);
        $("#storyTitle").text("Petualangan Luma (offline)");
        $("#storyText").html("<p>Tidak bisa memuat cerita. Coba jalankan lewat server lokal.</p>");
    });

    // Tombol di bawah cerita → buka modal instruksi
    $("#startStoryBtn").on("click", function () {
        $("#modal").fadeIn();
    });

    // Mulai game dari modal
    $("#start-btn").on("click", function () {
        $("#modal").fadeOut(() => {
        $("#title, .status-container, #game").fadeIn();
        startGame();
        });
    });

    // Restart game dari end modal
    $("#restart-btn").on("click", function () {
        $("#endModal").hide();        // tutup modal ending
        $("#game").hide();            // sembunyikan game area
        $("#story-container").show(); // tampilkan kembali bacaan
        window.scrollTo(0, 0);        // scroll ke atas biar balik ke awal bacaan  
    });

    // Klik mole
    $(document).on("click", ".mole", function () {
        if (gameOver) return;
        score++;
        $("#score").text(score);
        $(this).hide();
    });
    });

    // Game Logic
    function showMole() {
    $(".mole").hide(); // hide semua
    const total = $(".mole").length;
    if (total === 0) return;
    let randomIndex = Math.floor(Math.random() * total); // pilih random
    $(".mole").eq(randomIndex).fadeIn(200); // show mole
    }

    function startGame() {
    // Guard kalau storyData belum loaded
    const cfg = (storyData && storyData.gameConfig) ? storyData.gameConfig : { timeLimit: 35, targetScore: 15, moleInterval: 2000 };

    // Reset
    clearInterval(timerId);
    clearInterval(moleInterval);

    score = 0;
    timeLeft = cfg.timeLimit;
    gameOver = false;

    $("#score").text(score);
    $("#timer").text(timeLeft);
    $(".mole").hide();
    $("#endModal").hide();

    // Munculkan mole berkala
    moleInterval = setInterval(showMole, cfg.moleInterval);

    // Timer mundur
    timerId = setInterval(function () {
        timeLeft--;
        $("#timer").text(timeLeft);

        if (timeLeft <= 0) {
        clearInterval(timerId);
        clearInterval(moleInterval);
        $(".mole").hide();
        gameOver = true;

        // Tentukan ending
        const target = cfg.targetScore;
        let endingText = "";
        let endingTitle = "";

        if (score >= target) {
            endingTitle = "Ending Bahagia";
            endingText  = storyData ? storyData.ending.perfect : "Kamu menang!";
        } else if (score >= Math.ceil(target / 2)) {
            endingTitle = "Ending Sedang";
            endingText  = storyData ? storyData.ending.medium : "Lumayan, tapi belum maksimal.";
        } else {
            endingTitle = "Ending Sedih";
            endingText  = storyData ? storyData.ending.bad : "Sayang sekali, banyak yang lolos.";
        }

        // Tampilkan end modal (pakai <p><span id="finalScore"></span></p> yang sudah ada)
        $("#endModal h2").text(endingTitle);
        $("#endModal .modal-content p").html(`${endingText} <br>Skor: <span id="finalScore">${score}</span>`);
        $(".status-container").hide();   // sembunyikan timer & skor setelah game over
        $("#game").hide();               // sembunyikan area game juga
        $("#endModal").fadeIn();
        }
    }, 1000);
    }
