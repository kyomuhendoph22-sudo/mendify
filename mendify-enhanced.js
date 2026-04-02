// DATA EXPORT/IMPORT FUNCTIONALITY
function exportData() {
    try {
        const userData = {
            name: localStorage.getItem('name'),
            streak: localStorage.getItem('streak'),
            lastVisit: localStorage.getItem('lastVisit'),
            gratitudes: JSON.parse(localStorage.getItem('grat') || '[]'),
            moods: JSON.parse(localStorage.getItem('moods') || '[]'),
            journal: JSON.parse(localStorage.getItem('journal') || '[]'),
            goals: JSON.parse(localStorage.getItem('goals') || '[]'),
            settings: JSON.parse(localStorage.getItem('settings') || '{}'),
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `mendify-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        showToast('Data exported successfully! 📤', 'success');
    } catch (error) {
        showToast('Failed to export data', 'error');
    }
}

function importData(event) {
    try {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const userData = JSON.parse(e.target.result);
                
                if (confirm('This will replace all your current data. Are you sure?')) {
                    localStorage.setItem('name', userData.name || '');
                    localStorage.setItem('streak', userData.streak || '0');
                    localStorage.setItem('lastVisit', userData.lastVisit || '');
                    localStorage.setItem('grat', JSON.stringify(userData.gratitudes || []));
                    localStorage.setItem('moods', JSON.stringify(userData.moods || []));
                    localStorage.setItem('journal', JSON.stringify(userData.journal || []));
                    localStorage.setItem('goals', JSON.stringify(userData.goals || []));
                    localStorage.setItem('settings', JSON.stringify(userData.settings || {}));
                    
                    showToast('Data imported successfully! 📥', 'success');
                    setTimeout(() => window.location.reload(), 1000);
                }
            } catch (parseError) {
                showToast('Invalid backup file', 'error');
            }
        };
        
        reader.readAsText(file);
    } catch (error) {
        showToast('Failed to import data', 'error');
    }
    
    event.target.value = '';
}

// WELLNESS INSIGHTS
function generateInsights() {
    try {
        const moods = JSON.parse(localStorage.getItem('moods') || '[]');
        const gratitudes = JSON.parse(localStorage.getItem('grat') || '[]');
        const journal = JSON.parse(localStorage.getItem('journal') || '[]');
        const goals = JSON.parse(localStorage.getItem('goals') || '[]');
        
        const insights = analyzeWellnessData(moods, gratitudes, journal, goals);
        displayInsights(insights);
    } catch (error) {
        showToast('Failed to generate insights', 'error');
    }
}

function analyzeWellnessData(moods, gratitudes, journal, goals) {
    const insights = {
        moodTrends: analyzeMoodTrends(moods),
        gratitudePatterns: analyzeGratitudePatterns(gratitudes),
        goalProgress: analyzeGoalProgress(goals),
        journalThemes: analyzeJournalThemes(journal),
        overallWellness: calculateOverallWellness(moods, gratitudes, goals)
    };
    
    return insights;
}

function analyzeMoodTrends(moods) {
    if (moods.length === 0) return { message: "No mood data yet. Start tracking your mood!" };
    
    const recentMoods = moods.slice(0, 7);
    const moodValues = { 'Very Sad': 1, 'Sad': 2, 'Neutral': 3, 'Good': 4, 'Great': 5 };
    
    const avgMood = recentMoods.reduce((sum, entry) => sum + moodValues[entry.mood.label], 0) / recentMoods.length;
    
    return {
        average: avgMood.toFixed(1),
        message: `Your average mood this week is ${avgMood.toFixed(1)}/5. Keep tracking to see patterns!`
    };
}

function analyzeGratitudePatterns(gratitudes) {
    if (gratitudes.length === 0) return { message: "No gratitude entries yet. Start noting what you're thankful for!" };
    
    return {
        totalEntries: gratitudes.length,
        message: `You've expressed gratitude ${gratitudes.length} times. Great job building this positive habit!`
    };
}

function analyzeGoalProgress(goals) {
    if (goals.length === 0) return { message: "No goals set yet. Start setting your wellness goals!" };
    
    const completed = goals.filter(goal => goal.completed).length;
    const total = goals.length;
    const completionRate = (completed / total * 100).toFixed(0);
    
    return {
        total: total,
        completed: completed,
        completionRate: completionRate,
        message: `You've completed ${completed} of ${total} goals (${completionRate}% completion rate).`
    };
}

function analyzeJournalThemes(journal) {
    if (journal.length === 0) return { message: "No journal entries yet. Start writing your thoughts!" };
    
    const totalEntries = journal.length;
    const totalWords = journal.reduce((sum, entry) => sum + (entry.content || '').split(' ').length, 0);
    const avgWordsPerEntry = totalWords / totalEntries;
    
    return {
        totalEntries: totalEntries,
        averageLength: avgWordsPerEntry.toFixed(1),
        message: `You've written ${totalEntries} journal entries with an average of ${avgWordsPerEntry.toFixed(0)} words each.`
    };
}

function calculateOverallWellness(moods, gratitudes, goals) {
    let score = 50; // Base score
    
    if (moods.length > 0) {
        const moodValues = { 'Very Sad': 1, 'Sad': 2, 'Neutral': 3, 'Good': 4, 'Great': 5 };
        const avgMood = moods.slice(0, 7).reduce((sum, entry) => sum + moodValues[entry.mood.label], 0) / Math.min(moods.length, 7);
        score += (avgMood - 3) * 10;
    }
    
    if (gratitudes.length > 0) {
        score += Math.min(gratitudes.length * 2, 20);
    }
    
    if (goals.length > 0) {
        const completionRate = goals.filter(goal => goal.completed).length / goals.length;
        score += completionRate * 20;
    }
    
    return {
        score: Math.max(0, Math.min(100, Math.round(score))),
        level: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Attention'
    };
}

function displayInsights(insights) {
    const container = document.getElementById('insights-summary');
    
    const html = `
        <div style="text-align: left;">
            <div style="margin-bottom: 15px;">
                <strong>🎯 Overall Wellness: ${insights.overallWellness.score}/100 (${insights.overallWellness.level})</strong>
                <div style="background: linear-gradient(90deg, var(--success) 0%, var(--success) ${insights.overallWellness.score}%, #e0e0e0 ${insights.overallWellness.score}%, #e0e0e0 100%); height: 8px; border-radius: 4px; margin-top: 5px;"></div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong>😊 Mood Trends:</strong>
                <p style="font-size: 14px; color: #666; margin: 5px 0;">${insights.moodTrends.message}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong>🙏 Gratitude Patterns:</strong>
                <p style="font-size: 14px; color: #666; margin: 5px 0;">${insights.gratitudePatterns.message}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong>🎯 Goal Progress:</strong>
                <p style="font-size: 14px; color: #666; margin: 5px 0;">${insights.goalProgress.message}</p>
            </div>
            
            <div>
                <strong>📝 Journal Themes:</strong>
                <p style="font-size: 14px; color: #666; margin: 5px 0;">${insights.journalThemes.message}</p>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    showToast('Insights generated successfully! 📊', 'success');
}

// GUIDED MEDITATION FUNCTIONALITY
let meditationInterval;
let meditationTimeLeft;
let isMeditationActive = false;
let currentMeditation = null;

const meditationPrograms = {
    stress: {
        title: "Stress Relief",
        duration: 5 * 60,
        instructions: [
            "Find a comfortable position and close your eyes...",
            "Take a deep breath in through your nose...",
            "Hold for a moment, then slowly exhale...",
            "Release tension from your shoulders...",
            "Imagine a peaceful place where you feel safe...",
            "Let go of any worries, just for this moment...",
            "Focus on the sensation of your breathing...",
            "Each breath brings you more peace...",
            "You are calm and in control..."
        ]
    },
    sleep: {
        title: "Better Sleep",
        duration: 10 * 60,
        instructions: [
            "Lie down comfortably in your bed...",
            "Close your eyes and take three deep breaths...",
            "Release the tension in your muscles...",
            "Starting from your toes, relax each part of your body...",
            "Let your thoughts drift away like clouds...",
            "Focus on the gentle rhythm of your breathing...",
            "You are safe, warm, and comfortable...",
            "Allow yourself to drift into peaceful sleep...",
            "Sweet dreams await you..."
        ]
    },
    focus: {
        title: "Focus & Clarity",
        duration: 8 * 60,
        instructions: [
            "Sit in a comfortable, upright position...",
            "Close your eyes and take a deep breath...",
            "Bring your attention to the present moment...",
            "Notice the feeling of your breath entering and leaving...",
            "When your mind wanders, gently return to your breath...",
            "You are training your focus like a muscle...",
            "Each breath brings you back to the present...",
            "Your mind becomes clearer and more focused...",
            "You are ready to tackle your tasks with clarity..."
        ]
    },
    anxiety: {
        title: "Anxiety Relief",
        duration: 12 * 60,
        instructions: [
            "Find a safe, comfortable space...",
            "Close your eyes and acknowledge your feelings...",
            "It's okay to feel anxious right now...",
            "Place a hand on your heart, feel its steady beat...",
            "Breathe in slowly for 4 counts...",
            "Hold for 4 counts...",
            "Exhale slowly for 6 counts...",
            "You are safe in this present moment...",
            "These feelings will pass like waves...",
            "You are stronger than your anxiety..."
        ]
    }
};

function startMeditation(type) {
    try {
        const program = meditationPrograms[type];
        if (!program) {
            showToast('Meditation program not found', 'error');
            return;
        }
        
        currentMeditation = type;
        meditationTimeLeft = program.duration;
        isMeditationActive = true;
        
        document.getElementById('meditation-title').textContent = program.title;
        document.getElementById('meditation-player').style.display = 'block';
        document.getElementById('meditation-timer').classList.add('active');
        
        updateMeditationDisplay();
        showMeditationInstructions(program.instructions);
        
        meditationInterval = setInterval(() => {
            meditationTimeLeft--;
            updateMeditationDisplay();
            
            if (meditationTimeLeft <= 0) {
                completeMeditation();
            }
        }, 1000);
        
        showToast(`Starting ${program.title} meditation`, 'success');
    } catch (error) {
        showToast('Failed to start meditation', 'error');
    }
}

function updateMeditationDisplay() {
    const minutes = Math.floor(meditationTimeLeft / 60);
    const seconds = meditationTimeLeft % 60;
    document.getElementById('meditation-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function showMeditationInstructions(instructions) {
    let instructionIndex = 0;
    const instructionInterval = setInterval(() => {
        if (instructionIndex < instructions.length && isMeditationActive) {
            document.getElementById('meditation-instruction').textContent = instructions[instructionIndex];
            
            if ('speechSynthesis' in window) {
                speak(instructions[instructionIndex]);
            }
            
            instructionIndex++;
        } else {
            clearInterval(instructionInterval);
        }
    }, (meditationPrograms[currentMeditation].duration * 1000) / instructions.length);
}

function toggleMeditation() {
    if (isMeditationActive) {
        pauseMeditation();
    } else {
        resumeMeditation();
    }
}

function pauseMeditation() {
    isMeditationActive = false;
    clearInterval(meditationInterval);
    document.getElementById('meditation-toggle').textContent = '▶️ Resume';
    document.getElementById('meditation-timer').classList.remove('active');
    showToast('Meditation paused', 'success', 1000);
}

function resumeMeditation() {
    isMeditationActive = true;
    meditationInterval = setInterval(() => {
        meditationTimeLeft--;
        updateMeditationDisplay();
        
        if (meditationTimeLeft <= 0) {
            completeMeditation();
        }
    }, 1000);
    
    document.getElementById('meditation-toggle').textContent = '⏸️ Pause';
    document.getElementById('meditation-timer').classList.add('active');
    showToast('Meditation resumed', 'success', 1000);
}

function stopMeditation() {
    isMeditationActive = false;
    clearInterval(meditationInterval);
    currentMeditation = null;
    
    document.getElementById('meditation-player').style.display = 'none';
    document.getElementById('meditation-timer').classList.remove('active');
    document.getElementById('meditation-toggle').textContent = '⏸️ Pause';
    
    showToast('Meditation stopped', 'success', 1000);
}

function completeMeditation() {
    stopMeditation();
    showToast('Meditation completed! 🧘‍♀️ Take a moment to notice how you feel.', 'success', 5000);
    
    const meditationLog = JSON.parse(localStorage.getItem('meditationLog') || '[]');
    meditationLog.push({
        type: currentMeditation,
        title: meditationPrograms[currentMeditation].title,
        duration: meditationPrograms[currentMeditation].duration,
        completedAt: new Date().toISOString()
    });
    localStorage.setItem('meditationLog', JSON.stringify(meditationLog.slice(0, 50)));
}
