const CACHE_NAME = 'mood-tracker-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/logo.png',
    '/service-worker.js',
];

// Cache files on install
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Serve cached files or fetch from the network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request).then((fetchResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, fetchResponse.clone());
                        return fetchResponse;
                    });
                });
            })
    );
});

// Clean up old caches when activating
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (!cacheWhitelist.includes(cacheName)) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
    );
});

// JavaScript logic for the Mood Tracker App
let currentMood = '';

// Function to set the selected mood and display feedback
function setMood(mood) {
    currentMood = mood;
    const feedback = document.getElementById('feedback');

    const moodFeedback = {
        happy: "That's awesome! You're feeling happy!",
        neutral: "Okay, you're feeling neutral.",
        sad: "Sorry you're feeling down. Hang in there!",
        anxious: "You're feeling anxious, take a deep breath.",
        stressed: "Take it easy, you're feeling stressed.",
        depressed: "Sorry you're feeling this way, take care of yourself."
    };

    feedback.textContent = moodFeedback[mood] || "How are you feeling today?";
}

// Function to save the selected mood to local storage
function saveMood() {
    if (currentMood === '') {
        alert("Please select a mood first!");
    } else {
        alert(`Your mood has been saved as: ${currentMood}`);
        let history = JSON.parse(localStorage.getItem('moodHistory')) || [];
        history.push({ mood: currentMood, date: new Date().toLocaleDateString() });
        localStorage.setItem('moodHistory', JSON.stringify(history));
    }
}

// Function to view the history of moods saved in local storage
function viewHistory() {
    const history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    if (history.length === 0) {
        alert("No mood history available.");
        return;
    }

    let historyText = "Your Mood History:\n\n";
    history.forEach(entry => {
        historyText += `${entry.date}: ${entry.mood}\n`;
    });

    alert(historyText);
}

document.addEventListener("DOMContentLoaded", () => {
    const openNotesButton = document.getElementById('open-notes');
    const notesContainer = document.getElementById('notes-container');
    const noteInput = document.getElementById('note-input');
    const saveNoteButton = document.getElementById('save-note');
    const notesHistoryButton = document.getElementById('notes-history');
    const notesList = document.getElementById('notes-list');

    // Load saved notes from localStorage (if any)
    loadNotes();
    displayNotes(); // Call it on load to show any existing notes

    // Event listener to show the notes container
    openNotesButton.addEventListener('click', () => {
        notesContainer.style.display = 'block';
    });

    // Event listener for saving the note
    saveNoteButton.addEventListener('click', () => {
        const noteText = noteInput.value.trim();
        if (noteText !== "") {
            saveNoteToLocalStorage(noteText);
            noteInput.value = "";
            loadNotes();
        } else {
            alert("Please enter a note.");
        }
    });

    // Event listener for viewing notes history
    notesHistoryButton.addEventListener('click', () => {
        notesContainer.style.display = 'block'; // Ensure container is visible
        displayNotes();
    });

    // Function to save a note to localStorage
    function saveNoteToLocalStorage(noteText) {
        const notes = getNotesFromLocalStorage();
        notes.push(noteText);
        localStorage.setItem("notes", JSON.stringify(notes));
    }

    // Function to get notes from localStorage
    function getNotesFromLocalStorage() {
        const notes = localStorage.getItem("notes");
        return notes ? JSON.parse(notes) : [];
    }

    // Function to load notes from localStorage and display them
    function loadNotes() {
        const notes = getNotesFromLocalStorage();
        notesList.innerHTML = "";
        if (notes.length === 0) {
            notesList.innerHTML = "<li>No notes saved.</li>";
        } else {
            notes.forEach((note, index) => {
                const li = document.createElement("li");
                li.textContent = note;
                notesList.appendChild(li);
            });
        }
    }

    function displayNotes() {
        loadNotes(); // Just call loadNotes to update the display
    }
});

// Function to show the Privacy Policy Modal
function showPrivacyPolicy() {
    const modal = document.getElementById('privacyModal');
    modal.style.display = "block";
}

// Function to close the Privacy Policy Modal
function closePrivacyPolicy() {
    const modal = document.getElementById('privacyModal');
    modal.style.display = "none";
}

// Close the privacy policy modal if the user clicks outside of it
window.onclick = function (event) {
    const modal = document.getElementById('privacyModal');
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// Register Service Worker (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    });
}
