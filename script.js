function flashRed() {
    document.body.classList.add('red-flash');
    setTimeout(() => {
        document.body.classList.remove('red-flash');
    }, 1000);
}

function rainbowBackground() {
    const colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
    let i = 0;
    setInterval(() => {
        document.body.style.backgroundColor = colors[i];
        i = (i + 1) % colors.length;
    }, 200);
}

document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const door1 = document.getElementById('door1');
    const door2 = document.getElementById('door2');
    const winResult = document.getElementById('win-result');
    const loseResult = document.getElementById('lose-result');
    const resetButton = document.getElementById('reset-button');
    
    // Game state
    let gameActive = true;
    let partyDoor = null;
    let audioEnabled = false;
    
    // Pre-load audio files to improve playback chances
    const audioFiles = {
        'win': 'https://assets.mixkit.co/active_storage/sfx/4417/4417-preview.mp3',
        'door_creak': 'https://assets.mixkit.co/active_storage/sfx/2/2-preview.mp3',
        'bear_growl': 'https://assets.mixkit.co/active_storage/sfx/1318/1318-preview.mp3',
        'bear_attack': 'https://assets.mixkit.co/active_storage/sfx/675/675-preview.mp3',
        'bear_laugh': 'https://assets.mixkit.co/active_storage/sfx/414/414-preview.mp3',
        'reset': 'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3'
    };
    
    // Try to enable audio with user interaction
    document.addEventListener('click', function enableAudio() {
        // Create a silent audio context
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContext.resume().then(() => {
            audioEnabled = true;
            document.removeEventListener('click', enableAudio);
        }).catch(e => {
            console.log('Could not enable audio context:', e);
        });
    }, { once: true });
    
    // Initialize the game
    initGame();
    
    // Event listeners
    door1.addEventListener('click', () => handleDoorClick(door1, 1));
    door2.addEventListener('click', () => handleDoorClick(door2, 2));
    resetButton.addEventListener('click', resetGame);
    
    // Function to initialize the game
    function initGame() {
        // Randomly decide which door has the party
        partyDoor = Math.random() < 0.5 ? 1 : 2;
        
        // Reset game state
        gameActive = true;
        
        // Hide results and reset button
        winResult.classList.add('hidden');
        loseResult.classList.add('hidden');
        resetButton.classList.add('hidden');
        
        // Reset doors
        resetDoors();
    }
    
    // Function to handle door clicks
    function handleDoorClick(doorElement, doorNumber) {
        // Only proceed if the game is active
        if (!gameActive) return;
        
        // Play door creaking sound
        playSound('door_creak');
        
        // Open the door
        doorElement.classList.add('open');
        
        // Show the appropriate content behind the door
        if (doorNumber === partyDoor) {
            // Show party
            doorElement.querySelector('.door-back.party').classList.remove('hidden');
            doorElement.querySelector('.door-back.bears').classList.add('hidden');
            
            // Show win message
            setTimeout(() => {
                winResult.classList.remove('hidden');
                resetButton.classList.remove('hidden');
                playSound('win');
                
                // Trigger confetti
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                
                // Change background to party theme
                //document.body.style.backgroundImage = "url('https://images.unsplash.com/photo-1548611635-c6b0a3c33984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHBhcnR5fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60')";
                //document.body.style.backgroundSize = "cover";
                rainbowBackground();
            }, 800);
        } else {
            // Show bears
            doorElement.querySelector('.door-back.bears').classList.remove('hidden');
            doorElement.querySelector('.door-back.party').classList.add('hidden');
            
            // Play initial bear growl
            setTimeout(() => {
                playSound('bear_growl');
            }, 300);
            
            // Play bear attack sound after a short delay
            setTimeout(() => {
                flashRed();
                playSound('bear_attack');
            }, 1000);
            
            // Show lose message
            setTimeout(() => {
                loseResult.classList.remove('hidden');
                resetButton.classList.remove('hidden');
                playSound('bear_laugh');
            }, 1500);
        }
        
        // Open the other door to show what was behind it
        const otherDoorElement = doorNumber === 1 ? door2 : door1;
        const otherDoorNumber = doorNumber === 1 ? 2 : 1;
        
        setTimeout(() => {
            otherDoorElement.classList.add('open');
            
            if (otherDoorNumber === partyDoor) {
                otherDoorElement.querySelector('.door-back.party').classList.remove('hidden');
                otherDoorElement.querySelector('.door-back.bears').classList.add('hidden');
            } else {
                otherDoorElement.querySelector('.door-back.bears').classList.remove('hidden');
                otherDoorElement.querySelector('.door-back.party').classList.add('hidden');
            }
        }, 1200);
        
        // Game is now inactive until reset
        gameActive = false;
    }
    
    // Function to reset doors
    function resetDoors() {
        // Reset door 1
        door1.classList.remove('open');
        door1.querySelector('.door-back.party').classList.add('hidden');
        door1.querySelector('.door-back.bears').classList.add('hidden');
        
        // Reset door 2
        door2.classList.remove('open');
        door2.querySelector('.door-back.party').classList.add('hidden');
        door2.querySelector('.door-back.bears').classList.add('hidden');
    }
    
    // Function to reset the game
    function resetGame() {
        initGame();
        playSound('reset');
    }
    
    // Function to play sound effects
    function playSound(type) {
        // Skip if audio is not enabled or supported
        if (!audioEnabled && type !== 'door_creak') {
            return; // Still try to play the door creak as it's the first sound
        }
        
        // Create audio element
        const audio = new Audio();
        
        // Set source based on type
        if (audioFiles[type]) {
            audio.src = audioFiles[type];
            
            // Set appropriate volume
            switch(type) {
                case 'win':
                    audio.volume = 0.7;
                    break;
                case 'door_creak':
                    audio.volume = 0.5;
                    break;
                case 'bear_growl':
                    audio.volume = 0.8;
                    break;
                case 'bear_attack':
                    audio.volume = 1.0;
                    break;
                case 'bear_laugh':
                    audio.volume = 0.9;
                    break;
                case 'reset':
                    audio.volume = 0.6;
                    break;
            }
            
            // Play the sound with better error handling
            audio.play().then(() => {
                // Sound played successfully
                if (!audioEnabled) {
                    audioEnabled = true; // Mark audio as enabled if it works
                }
            }).catch(e => {
                console.log(`Audio play failed for ${type}:`, e);
                // This can happen due to browser autoplay policies
                // We'll just continue without sound in this case
            });
        }
    }
});
