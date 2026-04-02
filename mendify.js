// Toast Notification System
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Loading State Management
function setButtonLoading(buttonId, loading = true) {
    const button = document.getElementById(buttonId) || document.querySelector(`button[onclick*="${buttonId}"]`);
    if (button) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }
}

// NAVIGATION
function show(id){
    try {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const targetScreen = document.getElementById(id);
        if (targetScreen) {
            targetScreen.classList.add('active');
            
            // Initialize specific screens
            if(id === 'music') {
                initializeMusic();
            }
            
            // Announce screen change for accessibility
            const screenTitle = targetScreen.querySelector('h2, h3');
            if (screenTitle) {
                showToast(`Now viewing: ${screenTitle.textContent}`, 'success', 1000);
            }
        } else {
            console.error(`Screen with id "${id}" not found`);
            showToast('Screen not found', 'error');
        }
    } catch (error) {
        console.error('Navigation error:', error);
        showToast('Navigation failed', 'error');
    }
}

// LOGIN + STREAK
function startJourney(){
    const nameInput = document.getElementById('username');
    const name = nameInput.value.trim();
    
    if(name && name.length >= 2){
        setButtonLoading('startJourney', true);
        
        try {
            localStorage.setItem('name', name);
            show('home');
            updateHome();
            updateStreak();
            showToast(`Welcome to your journey, ${name}!`, 'success');
        } catch (error) {
            console.error('Login error:', error);
            showToast('Failed to save your name', 'error');
        } finally {
            setButtonLoading('startJourney', false);
        }
    } else {
        showToast('Please enter a valid name (at least 2 characters)', 'error');
        nameInput.focus();
    }
}

function updateHome(){
    try {
        const name = localStorage.getItem('name');
        const welcomeElement = document.getElementById('welcome');
        if (welcomeElement && name) {
            welcomeElement.innerText = "Welcome, " + name + "!";
        }
    } catch (error) {
        console.error('Error updating home screen:', error);
        showToast('Error loading welcome message', 'error');
    }
}

// STREAK
function updateStreak(){
    let streak = parseInt(localStorage.getItem('streak') || 0);
    const lastVisit = localStorage.getItem('lastVisit');
    const today = new Date().toDateString();

    if(lastVisit !== today){
        streak++;
        localStorage.setItem('streak', streak);
        localStorage.setItem('lastVisit', today);
    }

    document.getElementById('streak').innerText = "🔥 Streak: " + streak + " days";
}

// VENT
function clearVent(){
    const ventText = document.getElementById('ventText');
    if(ventText.value.trim()){
        ventText.value = "";
        ventText.placeholder = "✨ Released! Your thoughts are gone.";
        setTimeout(() => {
            ventText.placeholder = "Let it all out... your thoughts are safe here";
        }, 2000);
    }
}

// GRATITUDE
function saveGrat(){
    let g = JSON.parse(localStorage.getItem('grat') || "[]");
    let text = document.getElementById('gratText').value.trim();
    if(text){
        const date = new Date().toLocaleDateString();
        g.unshift({ text: text, date: date });
        localStorage.setItem('grat', JSON.stringify(g.slice(0, 10))); // Keep last 10 entries
        renderGrat();
        document.getElementById('gratText').value = "";
    }
}

function renderGrat(){
    let g = JSON.parse(localStorage.getItem('grat') || "[]");
    const list = document.getElementById('gratList');
    if(g.length === 0){
        list.innerHTML = "<p style='color: #666; font-style: italic;'>Your gratitude entries will appear here...</p>";
    } else {
        list.innerHTML = g.map(item => `<div class="grat-item"><strong>${item.date}:</strong> ${item.text}</div>`).join("");
    }
}

// AI CHAT
function sendMessage(){
    let input = document.getElementById('chat-input');
    let box = document.getElementById('chat-box');

    if(input.value.trim()){
        const userMessage = input.value.trim();
        box.innerHTML += `<div class="chat-message"><b>You:</b> ${userMessage}</div>`;

        // Simple AI responses
        const responses = [
            "I'm here for you. How are you feeling right now?",
            "That sounds challenging. Remember that your feelings are valid.",
            "Thank you for sharing that with me. You're taking an important step by reaching out.",
            "It's okay to not be okay sometimes. What would help you feel better right now?",
            "You're stronger than you know. I'm proud of you for being here.",
            "Take a deep breath. You're safe, and you're not alone in this."
        ];

        const aiResponse = responses[Math.floor(Math.random() * responses.length)];
        setTimeout(() => {
            box.innerHTML += `<div class="chat-message" style="background: rgba(102, 126, 234, 0.1);"><b>🤖 AI:</b> ${aiResponse}</div>`;
            box.scrollTop = box.scrollHeight;
        }, 1000);

        input.value = "";
        box.scrollTop = box.scrollHeight;
    }
}

// VOICE
function speak(text){
    if('speechSynthesis' in window){
        let speech = new SpeechSynthesisUtterance(text);
        speech.rate = 0.8;
        speech.pitch = 1;
        speechSynthesis.speak(speech);
    } else {
        alert('Voice synthesis is not supported in your browser.');
    }
}

// SOS
function toggleSOS(){
    let s = document.getElementById('sos');
    s.style.display = s.style.display === "flex" ? "none" : "flex";
}

// PWA Service Worker Registration
function registerSW() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW registered:', reg))
            .catch(err => console.log('SW registration failed:', err));
    }
}

// LOAD
window.onload = () => {
    registerSW();
    if(localStorage.getItem('name')){
        show('home');
        updateHome();
        updateStreak();
        renderGrat();
        renderMoodHistory();
        renderJournalEntries();
        renderGoals();
        updateStats();
        loadSettings();
    }
    // Initialize theme regardless of login status
    initializeTheme();
}

// MOOD TRACKING
let selectedMood = null;

function selectMood(emoji, label) {
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
    selectedMood = { emoji, label };
}

function saveMood() {
    if(!selectedMood) {
        alert('Please select a mood first!');
        return;
    }

    const note = document.getElementById('mood-note').value.trim();
    const entry = {
        date: new Date().toLocaleString(),
        mood: selectedMood,
        note: note
    };

    let moods = JSON.parse(localStorage.getItem('moods') || '[]');
    moods.unshift(entry);
    localStorage.setItem('moods', JSON.stringify(moods.slice(0, 30))); // Keep last 30 entries

    document.getElementById('mood-note').value = '';
    selectedMood = null;
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
    renderMoodHistory();
    updateStats();
}

function renderMoodHistory() {
    const history = document.getElementById('mood-history');
    let moods = JSON.parse(localStorage.getItem('moods') || '[]');

    if(moods.length === 0) {
        history.innerHTML = '<p style="text-align: center; color: #666; margin-top: 20px;">No mood entries yet. Start tracking your mood!</p>';
        return;
    }

    history.innerHTML = '<h4 style="margin-top: 20px;">Recent Moods</h4>' +
        moods.slice(0, 5).map(mood => `
            <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 10px; margin: 10px 0; border-left: 4px solid var(--accent);">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <span style="font-size: 24px;">${mood.mood.emoji}</span>
                    <strong>${mood.mood.label}</strong>
                    <span style="color: #666; font-size: 14px; margin-left: auto;">${mood.date}</span>
                </div>
                ${mood.note ? `<p style="margin: 5px 0; color: #555;">${mood.note}</p>` : ''}
            </div>
        `).join('');
}

// BREATHING TIMER
let breathingInterval;
let breathingTimeLeft;
let isBreathingActive = false;

function startBreathingTimer(minutes) {
    breathingTimeLeft = minutes * 60;
    isBreathingActive = true;
    updateBreathingDisplay();

    document.getElementById('stop-timer').style.display = 'block';
    document.getElementById('breathing-timer').classList.add('active');

    breathingInterval = setInterval(() => {
        breathingTimeLeft--;
        updateBreathingDisplay();

        if (breathingTimeLeft <= 0) {
            stopBreathingTimer();
            speak('Breathing session complete. Take a moment to notice how you feel.');
        }
    }, 1000);
}

function stopBreathingTimer() {
    clearInterval(breathingInterval);
    isBreathingActive = false;
    document.getElementById('stop-timer').style.display = 'none';
    document.getElementById('breathing-timer').classList.remove('active');
    document.getElementById('breathing-instruction').textContent = 'Session ended. Great job!';
}

function updateBreathingDisplay() {
    const minutes = Math.floor(breathingTimeLeft / 60);
    const seconds = breathingTimeLeft % 60;
    document.getElementById('timer-display').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Update breathing instruction based on time
    if (breathingTimeLeft > 0) {
        const phase = Math.floor((breathingTimeLeft % 8) / 2);
        const instructions = ['Breathe In...', 'Hold...', 'Breathe Out...', 'Hold...'];
        document.getElementById('breathing-instruction').textContent = instructions[phase];
    }
}

// AFFIRMATIONS
const affirmations = [
    "You are worthy of love and respect exactly as you are.",
    "You are capable of amazing things.",
    "Your feelings are valid and important.",
    "You are stronger than you know.",
    "You deserve peace and happiness.",
    "You are enough, just as you are.",
    "Your past does not define your future.",
    "You have the power to create positive change.",
    "You are deserving of good things.",
    "You are loved and appreciated.",
    "Your voice matters and deserves to be heard.",
    "You have unique gifts to offer the world.",
    "You are resilient and can overcome challenges.",
    "You deserve to prioritize your well-being.",
    "You are making progress, even on difficult days."
];

function getNewAffirmation() {
    const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    document.querySelector('#daily-affirmation p').textContent = `"${randomAffirmation}"`;
}

function speakAffirmation() {
    const affirmation = document.querySelector('#daily-affirmation p').textContent;
    speak(affirmation);
}

// PERSONAL JOURNAL
function saveJournalEntry() {
    const title = document.getElementById('journal-title').value.trim();
    const content = document.getElementById('journal-content').value.trim();

    if(!content) {
        alert('Please write something in your journal entry.');
        return;
    }

    const entry = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        title: title || 'Untitled Entry',
        content: content
    };

    let entries = JSON.parse(localStorage.getItem('journal') || '[]');
    entries.unshift(entry);
    localStorage.setItem('journal', JSON.stringify(entries.slice(0, 50))); // Keep last 50 entries

    document.getElementById('journal-title').value = '';
    document.getElementById('journal-content').value = '';
    renderJournalEntries();
    updateStats();
}

function renderJournalEntries() {
    const container = document.getElementById('journal-entries');
    let entries = JSON.parse(localStorage.getItem('journal') || '[]');

    if(entries.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; margin-top: 20px;">No journal entries yet. Start writing your thoughts!</p>';
        return;
    }

    container.innerHTML = '<h4 style="margin-top: 20px;">Recent Entries</h4>' +
        entries.slice(0, 3).map(entry => `
            <div class="journal-entry">
                <div class="journal-date">${entry.date}</div>
                <h5 style="margin: 10px 0; color: var(--accent);">${entry.title}</h5>
                <div class="journal-content">${entry.content.length > 200 ? entry.content.substring(0, 200) + '...' : entry.content}</div>
            </div>
        `).join('');
}

// GOALS
function addGoal() {
    const goalText = document.getElementById('new-goal').value.trim();
    if(!goalText) {
        alert('Please enter a goal.');
        return;
    }

    const goal = {
        id: Date.now(),
        text: goalText,
        completed: false,
        date: new Date().toLocaleDateString()
    };

    let goals = JSON.parse(localStorage.getItem('goals') || '[]');
    goals.push(goal);
    localStorage.setItem('goals', JSON.stringify(goals));

    document.getElementById('new-goal').value = '';
    renderGoals();
}

function renderGoals() {
    const container = document.getElementById('goals-list');
    let goals = JSON.parse(localStorage.getItem('goals') || '[]');

    if(goals.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; margin-top: 20px;">No goals set yet. Add your first wellness goal!</p>';
        return;
    }

    container.innerHTML = goals.map(goal => `
        <div class="goal-item ${goal.completed ? 'completed' : ''}">
            <div class="goal-checkbox" onclick="toggleGoal(${goal.id})">
                ${goal.completed ? '✓' : ''}
            </div>
            <div style="flex: 1;">
                <div style="${goal.completed ? 'text-decoration: line-through; color: #666;' : ''}">${goal.text}</div>
                <div style="font-size: 12px; color: #888; margin-top: 5px;">Added: ${goal.date}</div>
            </div>
            <button onclick="deleteGoal(${goal.id})" style="background: none; border: none; color: var(--danger); cursor: pointer; font-size: 18px;">🗑️</button>
        </div>
    `).join('');
}

function toggleGoal(id) {
    let goals = JSON.parse(localStorage.getItem('goals') || '[]');
    const goal = goals.find(g => g.id === id);
    if(goal) {
        goal.completed = !goal.completed;
        localStorage.setItem('goals', JSON.stringify(goals));
        renderGoals();
    }
}

function deleteGoal(id) {
    let goals = JSON.parse(localStorage.getItem('goals') || '[]');
    goals = goals.filter(g => g.id !== id);
    localStorage.setItem('goals', JSON.stringify(goals));
    renderGoals();
}

// STATISTICS
function updateStats() {
    const streak = parseInt(localStorage.getItem('streak') || 0);
    const moods = JSON.parse(localStorage.getItem('moods') || '[]');
    const journal = JSON.parse(localStorage.getItem('journal') || '[]');
    const gratitude = JSON.parse(localStorage.getItem('grat') || '[]');

    document.getElementById('streak-stat').textContent = streak;
    document.getElementById('mood-entries').textContent = moods.length;
    document.getElementById('journal-entries-count').textContent = journal.length;
    document.getElementById('gratitude-count').textContent = gratitude.length;

    updateMoodInsights(moods);
}

// Mood Insights helper
function updateMoodInsights(moods = JSON.parse(localStorage.getItem('moods') || '[]')) {
    const insightEl = document.getElementById('mood-insights-summary');
    if(!insightEl) return;

    if(moods.length === 0){
        insightEl.textContent = 'No mood data yet. Start tracking your mood to see trends.';
        return;
    }

    const counts = { 'Very Sad': 0, 'Sad': 0, 'Neutral': 0, 'Good': 0, 'Great': 0 };
    moods.forEach(entry => {
        const label = entry.mood?.label;
        if(label && counts[label] !== undefined){
            counts[label]++;
        }
    });

    const total = moods.length;
    const positive = counts['Good'] + counts['Great'];
    const neutral = counts['Neutral'];
    const negative = counts['Sad'] + counts['Very Sad'];

    const positivePct = Math.round((positive / total) * 100);
    const neutralPct = Math.round((neutral / total) * 100);
    const negativePct = Math.round((negative / total) * 100);

    insightEl.innerHTML = `In the last ${total} mood entries: ${positivePct}% positive, ${neutralPct}% neutral, ${negativePct}% challenging. Most common: ${getTopMood(counts)}.`;
}

function getTopMood(counts){
    return Object.keys(counts).reduce((a,b) => counts[a] >= counts[b] ? a : b);
}

// Pomodoro timer
let pomodoroInterval = null;
let pomodoroTimeLeft = 1500;
let pomodoroPhase = 'work';
let pomodoroCycles = 0;

function startPomodoro(minutes, phase){
    clearInterval(pomodoroInterval);
    pomodoroPhase = phase;
    pomodoroTimeLeft = minutes * 60;

    document.getElementById('pomodoro-status').textContent = phase === 'work' ? 'Work session started. Stay focused!' : 'Break time! Relax for a moment.';
    updatePomodoroDisplay();

    pomodoroInterval = setInterval(() => {
        pomodoroTimeLeft -= 1;
        if(pomodoroTimeLeft <= 0){
            clearInterval(pomodoroInterval);
            pomodoroInterval = null;

            if(phase === 'work'){
                pomodoroCycles += 1;
                document.getElementById('pomodoro-cycle').textContent = `Cycle: ${pomodoroCycles} completed`;
                document.getElementById('pomodoro-status').textContent = 'Work session complete! Take a short break.';
                speak('Work session complete! Great job.');
            } else {
                document.getElementById('pomodoro-status').textContent = 'Break complete! Ready for the next focus session.';
                speak('Break complete. Time to refocus.');
            }

            return;
        }
        updatePomodoroDisplay();
    }, 1000);
}

function updatePomodoroDisplay(){
    const minutes = Math.floor(pomodoroTimeLeft / 60);
    const seconds = pomodoroTimeLeft % 60;
    const timerEl = document.getElementById('pomodoro-timer');
    if(timerEl) timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('pomodoro-cycle').textContent = `Cycle: ${pomodoroCycles} completed`;
}

function resetPomodoro(){
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
    pomodoroTimeLeft = 25 * 60;
    pomodoroPhase = 'work';
    document.getElementById('pomodoro-status').textContent = 'Ready to focus?';
    document.getElementById('pomodoro-cycle').textContent = `Cycle: ${pomodoroCycles} completed`;
    updatePomodoroDisplay();
}

// SOUNDSCAPES
let currentSound = null;
const soundUrls = {
    rain: 'https://www.soundjay.com/misc/sounds/rain-03.mp3',
    ocean: 'https://www.soundjay.com/misc/sounds/waves-1.mp3',
    forest: 'https://www.soundjay.com/misc/sounds/forest-1.mp3',
    meditation: 'https://www.soundjay.com/misc/sounds/bell-meditation-1.mp3'
};

// MUSIC PLAYER
const musicPlaylist = [
    { title: 'Weightless (Ambient)', artist: 'Marconi Union', embedId: 'UfcAVejs1Ac', category: 'Relaxing' },
    { title: 'River Flows in You', artist: 'Yiruma', embedId: '4vC9nwR3MqU', category: 'Focus' },
    { title: 'Ocean Waves', artist: 'Nature Sounds', embedId: '6p7RIQ1yXa8', category: 'Sleep' },
    { title: 'Meditation Music', artist: 'Serenity', embedId: '1ZYbU82GVz4', category: 'Relaxing' },
    { title: 'Relaxing Piano', artist: 'Calm Piano', embedId: 'DWcJFNfaw9c', category: 'Relaxing' },
    { title: 'Deep Focus', artist: 'Concentration Music', embedId: 'lFcSrYw-1YE', category: 'Focus' }
];
let currentTrackIndex = 0;
let isMusicPlaying = false;
let musicFavorites = JSON.parse(localStorage.getItem('music-favorites') || '[]');

function initializeMusic() {
    renderPlaylist('All');
    renderFavorites();
    loadYouTubePlayer();
}

function loadYouTubePlayer() {
    const playerDiv = document.getElementById('youtube-player');
    if (!playerDiv) return;

    const track = musicPlaylist[currentTrackIndex];
    const autoplay = isMusicPlaying ? 1 : 0;
    playerDiv.innerHTML = `
        <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${track.embedId}?autoplay=${autoplay}&rel=0" 
                title="${track.title}" frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen style="border-radius: 12px;">
        </iframe>
    `;
    document.getElementById('music-now').textContent = track.title;
    document.getElementById('music-artist').textContent = track.artist;
}

function renderPlaylist(category) {
    const container = document.getElementById('music-playlist');
    if(!container) return;

    const filtered = category === 'All' ? musicPlaylist : musicPlaylist.filter(track => track.category === category);
    container.innerHTML = filtered.map((track, idx) => {
        const globalIndex = musicPlaylist.indexOf(track);
        const favorite = musicFavorites.includes(globalIndex);
        return `
            <div style="display:flex; justify-content: space-between; align-items: center; margin: 8px 0; background: rgba(255,255,255,0.8); padding: 10px; border-radius: 10px; border: 1px solid var(--border);">
                <div style="text-align:left; font-size: 15px;">
                    <strong>${track.title}</strong><br><span style="font-size: 12px; color: #666;">${track.artist} • ${track.category}</span>
                </div>
                <div style="display:flex; gap: 6px;">
                    <button class="btn" style="padding:6px 8px; font-size:12px;" onclick="playTrack(${globalIndex})">Play</button>
                    <button class="btn" style="padding:6px 8px; font-size:12px;" onclick="toggleFavorite(${globalIndex})">${favorite ? '★' : '☆'}</button>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('playlist-mode').textContent = `Playlist: ${category}`;
}

function toggleFavorite(index) {
    const pos = musicFavorites.indexOf(index);
    if(pos >= 0) {
        musicFavorites.splice(pos, 1);
    } else {
        musicFavorites.push(index);
    }
    localStorage.setItem('music-favorites', JSON.stringify(musicFavorites));
    renderPlaylist(document.getElementById('playlist-mode').textContent.replace('Playlist: ', '') || 'All');
    renderFavorites();
}

function renderFavorites() {
    const favContainer = document.getElementById('music-favorites');
    if(!favContainer) return;

    if(musicFavorites.length === 0) {
        favContainer.innerHTML = '<p style="color:#666; margin-top: 6px;">No favorite tracks yet. Tap ☆ to save songs.</p>';
        return;
    }

    favContainer.innerHTML = '<ul style="padding-left:18px; margin:0; color:#444;">' +
        musicFavorites.map(idx => `<li>${musicPlaylist[idx].title} - ${musicPlaylist[idx].artist}</li>`).join('') +
        '</ul>';
}

function toggleMusic() {
    const playBtn = document.getElementById('music-play-btn');
    if(!playBtn) return;

    isMusicPlaying = !isMusicPlaying;
    loadYouTubePlayer();
    playBtn.textContent = isMusicPlaying ? '⏸️ Pause' : '▶️ Play';
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % musicPlaylist.length;
    loadYouTubePlayer();
    if(isMusicPlaying) {
        // Reload with autoplay
        setTimeout(() => loadYouTubePlayer(), 100);
    }
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + musicPlaylist.length) % musicPlaylist.length;
    loadYouTubePlayer();
    if(isMusicPlaying) {
        // Reload with autoplay
        setTimeout(() => loadYouTubePlayer(), 100);
    }
}

function playTrack(index) {
    currentTrackIndex = index;
    isMusicPlaying = true;
    loadYouTubePlayer();
    document.getElementById('music-play-btn').textContent = '⏸️ Pause';
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % musicPlaylist.length;
    selectTrack(currentTrackIndex);
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + musicPlaylist.length) % musicPlaylist.length;
    selectTrack(currentTrackIndex);
}

// End music block

// Fallback URLs in case primary ones fail
const fallbackUrls = {
    rain: 'https://freesound.org/data/previews/316/316847_5123451-lq.mp3',
    ocean: 'https://freesound.org/data/previews/316/316847_5123451-lq.mp3',
    forest: 'https://freesound.org/data/previews/316/316847_5123451-lq.mp3',
    meditation: 'https://freesound.org/data/previews/316/316847_5123451-lq.mp3'
};

function playSound(type) {
    // Stop any currently playing sound
    stopAllSounds();

    try {
        if(soundUrls[type]) {
            const audio = new Audio();
            audio.src = soundUrls[type];
            audio.loop = true;
            audio.volume = document.getElementById('volume-slider') ? document.getElementById('volume-slider').value / 100 : 0.5;

            // Add event listeners for better UX
            audio.addEventListener('canplaythrough', () => {
                audio.play().catch(error => {
                    console.log('Audio play failed:', error);
                    // Try fallback URL
                    tryFallbackSound(type);
                });
            });

            audio.addEventListener('error', (e) => {
                console.log('Audio load error:', e);
                // Try fallback URL
                tryFallbackSound(type);
            });

            currentSound = { type, audio };

            // Update button states
            document.querySelectorAll('.sound-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
        }
    } catch (error) {
        console.log('Sound setup error:', error);
        // Try simple tone as last resort
        playSimpleTone(type === 'rain' || type === 'ocean' ? 'calm' : 'nature');
    }
}

function tryFallbackSound(type) {
    if(fallbackUrls[type] && currentSound && currentSound.type === type) {
        const audio = new Audio();
        audio.src = fallbackUrls[type];
        audio.loop = true;
        audio.volume = document.getElementById('volume-slider') ? document.getElementById('volume-slider').value / 100 : 0.5;

        audio.addEventListener('canplaythrough', () => {
            audio.play().catch(error => {
                console.log('Fallback audio also failed:', error);
                // As last resort, use simple tone
                playSimpleTone(type === 'rain' || type === 'ocean' ? 'calm' : 'nature');
            });
        });

        audio.addEventListener('error', (e) => {
            console.log('Fallback audio load error:', e);
            // As last resort, use simple tone
            playSimpleTone(type === 'rain' || type === 'ocean' ? 'calm' : 'nature');
        });

        currentSound.audio = audio;
    }
}

function stopAllSounds() {
    // Stop regular audio
    if(currentSound && currentSound.audio) {
        currentSound.audio.pause();
        currentSound.audio.currentTime = 0;
        currentSound = null;
    }

    // Stop simple tone
    stopSimpleTone();

    // Stop generated sounds
    if(currentSound && currentSound.oscillators) {
        currentSound.oscillators.forEach(sound => {
            try {
                if(sound.oscillator) sound.oscillator.stop();
            } catch(e) {}
        });
        currentSound.oscillators = null;
    }

    currentSound = null;
    document.querySelectorAll('.sound-btn, .btn').forEach(btn => btn.classList.remove('active'));
}

// Volume control
function updateVolume() {
    const volume = document.getElementById('volume-slider').value / 100;
    document.getElementById('volume-value').textContent = Math.round(volume * 100) + '%';

    if(currentSound && currentSound.audio) {
        currentSound.audio.volume = volume;
    }
}

// Simple tone generator as fallback
let toneOscillator = null;
let toneGain = null;
let audioContext = null;

function playSimpleTone(type) {
    stopAllSounds();
    stopSimpleTone();

    try {
        // Initialize audio context
        if(!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        if(audioContext.state === 'suspended') {
            audioContext.resume();
        }

        // Create oscillator and gain nodes
        toneOscillator = audioContext.createOscillator();
        toneGain = audioContext.createGain();

        // Connect nodes
        toneOscillator.connect(toneGain);
        toneGain.connect(audioContext.destination);

        // Set tone properties based on type
        if(type === 'calm') {
            toneOscillator.frequency.setValueAtTime(528, audioContext.currentTime); // C note
            toneGain.gain.setValueAtTime(0.1, audioContext.currentTime);
        } else if(type === 'nature') {
            toneOscillator.frequency.setValueAtTime(396, audioContext.currentTime); // G note
            toneGain.gain.setValueAtTime(0.08, audioContext.currentTime);
        }

        // Start the tone
        toneOscillator.start();

        // Update button states
        document.querySelectorAll('.sound-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        currentSound = { type: 'simple_' + type, audio: null };

    } catch (error) {
        console.log('Simple tone error:', error);
        alert('Unable to generate tone. Your browser may not support Web Audio API.');
    }
}

function stopSimpleTone() {
    if(toneOscillator) {
        try {
            toneOscillator.stop();
            toneOscillator = null;
        } catch (e) {
            // Oscillator might already be stopped
        }
    }
    if(toneGain) {
        toneGain = null;
    }
}

// Advanced sound generation using Web Audio API
function playGeneratedSound(type) {
    stopAllSounds();
    stopSimpleTone();

    try {
        // Initialize audio context
        if(!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        if(audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const volume = document.getElementById('volume-slider') ? document.getElementById('volume-slider').value / 100 : 0.5;

        switch(type) {
            case 'rain':
                generateRainSound(volume);
                break;
            case 'ocean':
                generateOceanSound(volume);
                break;
            case 'forest':
                generateForestSound(volume);
                break;
            case 'meditation':
                generateMeditationSound(volume);
                break;
        }

        // Update button states
        document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        currentSound = { type: 'generated_' + type, audio: null };

    } catch (error) {
        console.log('Generated sound error:', error);
        alert('Unable to generate sound. Your browser may not support Web Audio API.');
    }
}

function generateRainSound(volume) {
    // Create multiple oscillators for rain effect
    for(let i = 0; i < 5; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Random frequency for rain drops
        oscillator.frequency.setValueAtTime(800 + Math.random() * 400, audioContext.currentTime);

        // Volume envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime + Math.random() * 2);
        oscillator.stop(audioContext.currentTime + 0.5 + Math.random() * 2);
    }

    // Repeat the rain effect
    setInterval(() => {
        if(currentSound && currentSound.type === 'generated_rain') {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800 + Math.random() * 400, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume * 0.1, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
        }
    }, 200);
}

function generateOceanSound(volume) {
    // Create wave-like sound using multiple oscillators
    const oscillators = [];
    for(let i = 0; i < 3; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Low frequency for ocean waves
        oscillator.frequency.setValueAtTime(60 + i * 20, audioContext.currentTime);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, audioContext.currentTime);

        gainNode.gain.setValueAtTime(volume * 0.15, audioContext.currentTime);

        oscillator.start();
        oscillators.push({oscillator, gainNode});
    }

    // Store for cleanup
    currentSound.oscillators = oscillators;
}

function generateForestSound(volume) {
    // Create bird-like sounds with occasional chirps
    const createChirp = () => {
        if(currentSound && currentSound.type === 'generated_forest') {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Bird chirp frequencies
            const frequencies = [800, 1000, 1200, 900, 1100];
            const freq = frequencies[Math.floor(Math.random() * frequencies.length)];

            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(freq * 1.5, audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume * 0.08, audioContext.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        }
    };

    // Occasional chirps
    createChirp();
    setInterval(createChirp, 3000 + Math.random() * 5000);
}

function generateMeditationSound(volume) {
    // Create bell-like meditation sound
    const createBell = () => {
        if(currentSound && currentSound.type === 'generated_meditation') {
            const oscillators = [];

            // Fundamental and harmonics
            const frequencies = [528, 1056, 1584, 2112]; // C note harmonics

            frequencies.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);

                // Longer decay for lower harmonics
                const decayTime = 3 - index * 0.5;
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(volume * (0.1 / (index + 1)), audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + decayTime);

                oscillator.start();
                oscillator.stop(audioContext.currentTime + decayTime);

                oscillators.push({oscillator, gainNode});
            });

            currentSound.oscillators = oscillators;
        }
    };

    // Play bell every 30 seconds
    createBell();
    setInterval(createBell, 30000);
}

// SETTINGS
function loadSettings() {
    const moodReminder = localStorage.getItem('mood-reminder') === 'true';
    const gratitudeReminder = localStorage.getItem('gratitude-reminder') === 'true';

    document.getElementById('mood-reminder').checked = moodReminder;
    document.getElementById('gratitude-reminder').checked = gratitudeReminder;
}

function clearAllData() {
    if(confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
        localStorage.clear();
        location.reload();
    }
}

// Save settings when changed
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('mood-reminder').addEventListener('change', function() {
        localStorage.setItem('mood-reminder', this.checked);
    });

    document.getElementById('gratitude-reminder').addEventListener('change', function() {
        localStorage.setItem('gratitude-reminder', this.checked);
    });

    // Volume slider
    const volumeSlider = document.getElementById('volume-slider');
    if(volumeSlider) {
        volumeSlider.addEventListener('input', updateVolume);
        // Set initial volume
        updateVolume();
    }

    // Initialize theme
    initializeTheme();

    // Initialize quotes
    initializeQuotes();
});

// THEME TOGGLE
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
    const button = document.getElementById('theme-toggle');
    if(button) {
        button.textContent = theme === 'light' ? '' : '';
        button.title = theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }
}

// INSPIRATIONAL QUOTES
let currentQuoteIndex = 0;
const totalQuotes = 10;
const quoteImages = [
    'pictures/inspirational quotes/n1.png',
    'pictures/inspirational quotes/n2.jpg',
    'pictures/inspirational quotes/n3.png',
    'pictures/inspirational quotes/n4.jpg',
    'pictures/inspirational quotes/n5.jpg',
    'pictures/inspirational quotes/n6.jpg',
    'pictures/inspirational quotes/n7.jpg',
    'pictures/inspirational quotes/n8.jpg',
    'pictures/inspirational quotes/n9.jpg',
    'pictures/inspirational quotes/n10.jpg'
];

const quoteTexts = [
    "Your thoughts are the seeds of your future garden. Plant them wisely.",
    "Every day is a new beginning. Take a deep breath and start again.",
    "You are stronger than you know, braver than you feel, and smarter than you think.",
    "The present moment is the only time over which we have dominion.",
    "Your mental health is a priority. Your happiness matters.",
    "Progress, not perfection, is the key to wellness.",
    "You have survived 100% of your worst days. You're capable of more.",
    "Self-care is not selfish. You cannot pour from an empty cup.",
    "Your feelings are valid. Your experiences matter. Your healing is important.",
    "Tomorrow's strength comes from today's healing."
];

function initializeQuotes() {
    // Load saved quote index
    const savedIndex = localStorage.getItem('currentQuoteIndex');
    if(savedIndex !== null) {
        currentQuoteIndex = parseInt(savedIndex);
    }
    updateQuoteDisplay();
}

function updateQuoteDisplay() {
    const quoteImg = document.getElementById('current-quote');
    const quoteText = document.getElementById('quote-text');
    const quoteNumber = document.getElementById('quote-number');
    const totalQuotesDisplay = document.getElementById('total-quotes');

    if(quoteImg && quoteText && quoteNumber && totalQuotesDisplay) {
        quoteImg.src = quoteImages[currentQuoteIndex];
        quoteText.textContent = quoteTexts[currentQuoteIndex];
        quoteNumber.textContent = currentQuoteIndex + 1;
        totalQuotesDisplay.textContent = totalQuotes;

        // Save current index
        localStorage.setItem('currentQuoteIndex', currentQuoteIndex);
    }
}

function nextQuote() {
    currentQuoteIndex = (currentQuoteIndex + 1) % totalQuotes;
    updateQuoteDisplay();
}

function previousQuote() {
    currentQuoteIndex = (currentQuoteIndex - 1 + totalQuotes) % totalQuotes;
    updateQuoteDisplay();
}

function randomQuote() {
    const newIndex = Math.floor(Math.random() * totalQuotes);
    currentQuoteIndex = newIndex;
    updateQuoteDisplay();
}