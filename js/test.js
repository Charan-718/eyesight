document.addEventListener('DOMContentLoaded', () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&+='.split('');
  const fontSizes = [33, 29, 26, 23, 20, 17, 14, 12, 9, 7]; // decreasing sizes
  // const powerLevels = [-6, -5, -4, -3, -2, -1, 0, 1.5, 2, 3]; // corresponding estimated powers
  const powerLevels = [3, 2, 1.5, 1, 0.5, 0, -1, -2, -3, -6];

  let testLetters = [];
  let currentIndex = 0;

  const modal = document.getElementById('testModal');
  const testLetter = document.getElementById('testLetter');
  const resultDiv = document.getElementById('result');

  document.getElementById('takeTestBtn').addEventListener('click', () => {
    currentIndex = 0;
    resultDiv.textContent = '';
    testLetters = generateRandomLetters(10);
    showModal();
  });

  document.getElementById('closeModal').addEventListener('click', closeModal);

  document.getElementById('submitAnswer').addEventListener('click', () => {
    const input = document.getElementById('userAnswer').value.toUpperCase();
    const correctLetter = testLetters[currentIndex];
  
    // If input is empty or wrong, treat it as a wrong answer
    if (input === correctLetter) {
      currentIndex++;
      if (currentIndex >= testLetters.length) {
        showResult("✅ You seem to have normal vision.\nEstimated Eye Power: 0.00", 0);
        closeModal();
      } else {
        showNextLetter();
      }
    } else {
      const estimatedPower = powerLevels[currentIndex];
      const sight =
        estimatedPower <= -4 ? 'Severe Myopia' :
        estimatedPower < 0 ? 'Myopia' :
        estimatedPower <= 2 ? 'Mild Hypermetropia' : 'Hypermetropia';
  
      const message = `Detected: ${sight}.\nEstimated Eye Power: ${estimatedPower.toFixed(2)} D`;
      showResult(message, estimatedPower);
      closeModal();
    }
  });

  document.getElementById('userAnswer').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission if in form
      document.getElementById('submitAnswer').click(); // Trigger submit logic
    }
  });

  function showModal() {
    modal.style.display = 'block';
    showNextLetter();
  }

  function closeModal() {
    modal.style.display = 'none';
    document.getElementById('userAnswer').value = '';
  }

  function showNextLetter() {
    const letter = testLetters[currentIndex];
    testLetter.textContent = letter;
    testLetter.style.fontSize = `${fontSizes[currentIndex]}px`;
    document.getElementById('userAnswer').value = '';
  }

  function showResult(msg, power = null) {
    resultDiv.textContent = msg;

    if (power !== null) {
      localStorage.setItem('eyePower', power.toFixed(2));

      // Update the Apply Sight input directly
      const eyePowerInput = document.getElementById('eyePower');
      if (eyePowerInput) eyePowerInput.value = power.toFixed(2);

      if (window.eyeSight) {
        window.eyeSight(true); // 🔁 Test-triggered zoom
      }
    }
  }

  function generateRandomLetters(count) {
    const letters = [];
    while (letters.length < count) {
      const rand = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!letters.includes(rand)) letters.push(rand);
    }
    return letters;
  }
});
