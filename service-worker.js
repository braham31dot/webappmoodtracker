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
        // If the resource is found in the cache, serve it. Otherwise, fetch it from the network.
        return response || fetch(event.request).then((fetchResponse) => {
          // Optionally, cache the response here for later use
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
// Initialize current mood and notes
let currentMood = '';
let currentNotes = localStorage.getItem('userNotes') || '';

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

// Function to open a prompt where the user can write a daily reflection or note
function openNotes() {
    const userNotes = prompt("Write your daily reflection:", currentNotes);
    if (userNotes !== null) {
        currentNotes = userNotes;
        localStorage.setItem('userNotes', currentNotes);
    }
}

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
window.onclick = function(event) {
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

