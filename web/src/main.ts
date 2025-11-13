/**
 * Main entry point for the EdgeViewer web application
 */

import { FrameDisplay } from './frameDisplay';
import { FrameLoader } from './frameLoader';

class EdgeViewerApp {
    private frameDisplay: FrameDisplay;
    private stopMockStream: (() => void) | null = null;

    constructor() {
        try {
            this.frameDisplay = new FrameDisplay('frame-canvas', 'frame-stats');
            this.initializeCanvas();
            this.setupEventListeners();
            this.loadInitialFrame();
        } catch (error) {
            console.error('Failed to initialize EdgeViewer:', error);
            this.showError('Failed to initialize application');
        }
    }

    /**
     * Initialize canvas size based on viewport
     */
    private initializeCanvas(): void {
        const canvas = document.getElementById('frame-canvas') as HTMLCanvasElement;
        if (canvas) {
            canvas.width = Math.min(800, window.innerWidth - 40);
            canvas.height = Math.min(600, window.innerHeight - 200);
        }
    }

    /**
     * Set up event listeners
     */
    private setupEventListeners(): void {
        const loadButton = document.getElementById('load-frame-btn');
        const mockStreamButton = document.getElementById('mock-stream-btn');

        loadButton?.addEventListener('click', () => this.loadInitialFrame());
        mockStreamButton?.addEventListener('click', () => this.toggleMockStream());

        // Handle window resize
        window.addEventListener('resize', () => this.initializeCanvas());
    }

    /**
     * Load and display an initial sample frame
     */
    private async loadInitialFrame(): Promise<void> {
        try {
            const frame = await FrameLoader.loadSampleFrame();
            this.frameDisplay.displayFrame(frame);
        } catch (error) {
            console.error('Error loading frame:', error);
            this.showError('Failed to load frame');
        }
    }

    /**
     * Toggle mock frame stream for demonstration
     */
    private toggleMockStream(): void {
        const button = document.getElementById('mock-stream-btn') as HTMLButtonElement;
        
        if (this.stopMockStream) {
            // Stop stream
            this.stopMockStream();
            this.stopMockStream = null;
            button.textContent = 'Start Mock Stream';
        } else {
            // Start stream
            this.stopMockStream = FrameLoader.startMockFrameStream((frame) => {
                this.frameDisplay.displayFrame(frame);
            }, 100);
            button.textContent = 'Stop Mock Stream';
        }
    }

    /**
     * Display error message
     */
    private showError(message: string): void {
        const statsElement = document.getElementById('frame-stats');
        if (statsElement) {
            statsElement.textContent = `Error: ${message}`;
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new EdgeViewerApp();
    });
} else {
    new EdgeViewerApp();
}

