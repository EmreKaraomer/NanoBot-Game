// === Ses Fonksiyonları ===
function playClickSound() {
    const audio = document.getElementById("clickSound");
    if (audio) audio.play();
  }
  
  function playSuccessSound() {
    const audio = document.getElementById("successSound");
    if (audio) audio.play();
  }
  
  function playFailSound() {
    const audio = document.getElementById("failSound");
    if (audio) audio.play();
  }
  
  // === Genel Tanımlar ===
  const gridCols = 16;
  const gridRows = 9;
  const cellSize = 60;
  const grid = Array.from({ length: gridRows }, () => Array(gridCols).fill(null));
  
  let score = 0;
  let timeLeft = 15;
  let timerInterval = null;
  let selectedCellType = null;
  let simulationRunning = false;
  let moverCount = 0;
  const maxMovers = 3;
  let empUses = 2;
  let simulationInterval = null;
  let currentLevel = 1;
  const maxLevel = 20;
  
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  
  // === Oyun Başlat ===
  function startGame() {
    playClickSound();
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("scoreDisplay").style.display = "block";
    document.getElementById("scoreDisplay").textContent = "Skor: " + score;
    const body = document.getElementById("bodyRoot");
    body.classList.remove("menu-bg");
    body.classList.add("game-bg");
  
    canvas.style.display = "block";
    document.getElementById("controls").style.display = "block";
    document.getElementById("cellPanel").style.display = "block";
    document.getElementById("levelDisplay").style.display = "block";
  
    canvas.width = gridCols * cellSize;
    canvas.height = gridRows * cellSize;
  
    loadLevel(currentLevel);
  }
  
  // === Seviye Yükle ===
  function loadLevel(level) {
    moverCount = 0;
    empUses = Math.max(1, 2 - Math.floor(level / 5));
    simulationRunning = false;
    clearInterval(simulationInterval);
    clearInterval(timerInterval);
    document.getElementById("timerDisplay").style.display = "none";
    document.getElementById("levelDisplay").textContent = "Seviye: " + level;
  
    for (let y = 0; y < gridRows; y++) {
      for (let x = 0; x < gridCols; x++) {
        grid[y][x] = null;
      }
    }
  
    if (level === 1) {
      grid[4][5] = "firewall";
      grid[2][7] = "firewall";
    } else if (level === 2) {
      grid[1][6] = "firewall";
      grid[4][8] = "firewall";
      grid[6][10] = "firewall";
    } else {
      const firewallCount = Math.min(3 + level, 12);
      if (level >= 4) {
        const firewallXCount = Math.min(1 + Math.floor(level / 4), 4);
        for (let i = 0; i < firewallXCount; i++) {
          const rx = Math.floor(Math.random() * (gridCols - 3)) + 3;
          const ry = Math.floor(Math.random() * gridRows);
          if (!grid[ry][rx]) {
            grid[ry][rx] = "firewallX";
          } else {
            i--;
          }
        }
      }
      for (let i = 0; i < firewallCount; i++) {
        const rx = Math.floor(Math.random() * (gridCols - 3)) + 3;
        const ry = Math.floor(Math.random() * gridRows);
        if (!grid[ry][rx]) {
          grid[ry][rx] = "firewall";
        } else {
          i--;
        }
      }
      if (level === 5 || level === 10) {
        grid[3][4] = "obstacle";
        grid[5][8] = "obstacle";
      }
    }
  
    drawGrid();
  }
  
  // === Hücre Seç ===
  function selectCellType(type) {
    selectedCellType = type;
    playClickSound();
  }
  
  // === Hücre Yerleştir ===
  canvas.addEventListener("click", function (e) {
    if (!selectedCellType) return;
  
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
  
    if (x >= 0 && x < gridCols && y >= 0 && y < gridRows && !grid[y][x]) {
      if (selectedCellType === "mover") {
        if (x > 2) {
          alert("Hareket hücresi sadece ilk 3 sütuna yerleştirilebilir.");
          return;
        }
        if (moverCount < maxMovers) {
          grid[y][x] = "mover";
          moverCount++;
        } else {
          alert("En fazla 3 hareket hücresi yerleştirebilirsiniz.");
        }
      } else if (selectedCellType === "emp") {
        if (empUses > 0) {
          grid[y][x] = "emp";
          empUses--;
        } else {
          alert("EMP kullanım hakkınız bitti.");
        }
      }
      drawGrid();
    }
  });
  
  // === Grid Çiz ===
  function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < gridRows; y++) {
      for (let x = 0; x < gridCols; x++) {
        if (grid[y][x]) {
          switch (grid[y][x]) {
            case "mover": ctx.fillStyle = "#00ff00"; break;
            case "firewall": ctx.fillStyle = "#ff0000"; break;
            case "emp": ctx.fillStyle = "#00ffff"; break;
            case "obstacle": ctx.fillStyle = "#555555"; break;
            case "firewallX": ctx.fillStyle = "#ff8800"; break;
          }
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
        ctx.strokeStyle = "#444";
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }
  
  // === Simülasyonu Başlat ===
  function startSimulation() {
    if (simulationRunning) return;
    simulationRunning = true;
  
    document.getElementById("timerDisplay").style.display = "block";
    timeLeft = 15;
    document.getElementById("timerDisplay").textContent = "Süre: " + timeLeft;
  
    timerInterval = setInterval(() => {
      timeLeft--;
      document.getElementById("timerDisplay").textContent = "Süre: " + timeLeft;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        clearInterval(simulationInterval);
        simulationRunning = false;
        playFailSound();
        alert("Süre doldu! Bölüm başa sarıldı.");
        resetGrid();
      }
    }, 1000);
  
    simulationInterval = setInterval(() => {
      const newGrid = Array.from({ length: gridRows }, () => Array(gridCols).fill(null));
  
      for (let y = 0; y < gridRows; y++) {
        for (let x = gridCols - 1; x >= 0; x--) {
          const cell = grid[y][x];
  
          if (cell === "emp") {
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < gridCols && ny >= 0 && ny < gridRows && !(dx === 0 && dy === 0)) {
                  if (grid[ny][nx] !== "obstacle" && grid[ny][nx] !== "firewallX") {
                    newGrid[ny][nx] = null;
                  }
                }
              }
            }
            newGrid[y][x] = null;
          } else if (cell === "mover") {
            const nextX = x + 1;
            if (nextX < gridCols && !grid[y][nextX]) {
              newGrid[y][nextX] = "mover";
            } else {
              newGrid[y][x] = "mover";
            }
          } else if (cell) {
            newGrid[y][x] = cell;
          }
        }
      }
  
      for (let y = 0; y < gridRows; y++) {
        for (let x = 0; x < gridCols; x++) {
          grid[y][x] = newGrid[y][x];
        }
      }
  
      drawGrid();
  
      if (checkLevelComplete()) {
        clearInterval(simulationInterval);
        clearInterval(timerInterval);
        simulationRunning = false;
        playSuccessSound();
        calculateScore();
        nextLevel();
      }
    }, 400);
  }
  
  // === Skor Hesapla ===
  function calculateScore() {
    let bonus = timeLeft * 2;
    let empBonus = empUses * 10;
    let levelBonus = 50;
    let total = bonus + empBonus + levelBonus;
    document.getElementById("empDisplay").textContent = "EMP: " + empUses;

    score += total;
  
    alert(`Seviye tamamlandı!\n+${levelBonus} puan\n+${empBonus} (EMP bonusu)\n+${bonus} (Zaman bonusu)\n= ${total} puan`);
  
    document.getElementById("scoreDisplay").textContent = "Skor: " + score;
  }
  
  // === Seviye Tamamlandı Mı? ===
  function checkLevelComplete() {
    let completeCount = 0;
    for (let y = 0; y < gridRows; y++) {
      if (grid[y][gridCols - 1] === "mover") {
        completeCount++;
      }
    }
    return completeCount === maxMovers;
  }
  
  // === Sonraki Bölüm ===
  function nextLevel() {
    currentLevel++;
    if (currentLevel > maxLevel) {
      alert("Tüm bölümleri tamamladınız! Final skorunuz: " + score);
      return;
    }
    loadLevel(currentLevel);
  }
  
  // === Reset ===
  function resetGrid() {
    clearInterval(timerInterval);
    document.getElementById("timerDisplay").style.display = "none";
    loadLevel(currentLevel);
  }
  