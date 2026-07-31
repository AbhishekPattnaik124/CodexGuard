export class AudioEngine {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.isEnabled = false;
        
        // Wait for voices to be loaded
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {
                this.voices = this.synth.getVoices();
            };
        }
    }

    enable() {
        this.isEnabled = true;
        this.speak("Audio systems online. Neural net ready.");
    }

    speak(text) {
        if (!this.isEnabled || !this.synth) return;

        // Cancel any currently playing speech to prevent long queues
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Try to find a robotic/sci-fi sounding voice
        const preferredVoices = this.voices.filter(v => 
            v.name.includes('Google UK English Male') || 
            v.name.includes('Microsoft Mark') ||
            v.name.includes('Samantha')
        );

        if (preferredVoices.length > 0) {
            utterance.voice = preferredVoices[0];
        }

        utterance.pitch = 0.8; // Lower pitch for AI sound
        utterance.rate = 1.1; // Slightly faster
        utterance.volume = 0.6;

        this.synth.speak(utterance);
    }
}

export const audioEngine = new AudioEngine();
