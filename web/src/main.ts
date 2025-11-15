/**
 * Main entry point for the EdgeViewer web application
 */

import { FrameDisplay } from './frameDisplay.js';
import { FrameLoader } from './frameLoader.js';

class EdgeViewerApp {
    private frameDisplay!: FrameDisplay;
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
            const width = Math.min(800, window.innerWidth - 40);
            const height = Math.min(600, window.innerHeight - 200);
            canvas.width = width;
            canvas.height = height;
            this.frameDisplay.setSize(width, height);
            console.log('Canvas initialized:', width, 'x', height);
        }
    }

    /**
     * Set up event listeners
     */
    private setupEventListeners(): void {
        const loadButton = document.getElementById('load-frame-btn');
        const mockStreamButton = document.getElementById('mock-stream-btn');

        if (loadButton) {
            loadButton.addEventListener('click', () => {
                console.log('Load button clicked');
                this.loadInitialFrame();
            });
        } else {
            console.error('Load button not found');
        }

        if (mockStreamButton) {
            mockStreamButton.addEventListener('click', () => {
                console.log('Mock stream button clicked');
                this.toggleMockStream();
            });
        } else {
            console.error('Mock stream button not found');
        }

        // Handle window resize
        window.addEventListener('resize', () => this.initializeCanvas());
    }

    /**
     * Load and display an initial sample frame
     */
    private async loadInitialFrame(): Promise<void> {
        try {
            console.log('Loading initial frame...');
            const frame = await FrameLoader.loadSampleFrame();
            console.log('Frame loaded, displaying...', frame);
            this.frameDisplay.displayFrame(frame);
        } catch (error) {
            console.error('Error loading frame:', error);
            this.showError(`Failed to load frame: ${error}`);
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

    /**
     * Public method to load frame from base64 (for external use)
     */
    public loadFrameFromBase64(base64Data: string, stats?: Partial<import('./types').ProcessedFrame['stats']>): void {
        try {
            const frame = FrameLoader.loadFromBase64(base64Data, stats);
            this.frameDisplay.displayFrame(frame);
        } catch (error) {
            console.error('Error loading frame:', error);
            this.showError('Failed to load frame');
        }
    }
}

// Make app instance globally accessible for external use
let appInstance: EdgeViewerApp | null = null;

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        appInstance = new EdgeViewerApp();
        // Expose global function for loading base64 frames
        (window as any).loadEdgeViewerFrame = (base64Data: string, stats?: any) => {
            appInstance?.loadFrameFromBase64(base64Data, stats);
        };
    });
} else {
    appInstance = new EdgeViewerApp();
    // Expose global function for loading base64 frames
    (window as any).loadEdgeViewerFrame = (base64Data: string, stats?: any) => {
        appInstance?.loadFrameFromBase64(base64Data, stats);
    };
}

