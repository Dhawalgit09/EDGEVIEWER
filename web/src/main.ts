/**
 * Main entry point for the EdgeViewer web application
 */

import { FrameDisplay } from './frameDisplay';
import { FrameLoader } from './frameLoader';

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
        const loadBase64Button = document.getElementById('load-base64-btn');
        const submitBase64Button = document.getElementById('submit-base64-btn');
        const cancelBase64Button = document.getElementById('cancel-base64-btn');
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        const loadFileButton = document.getElementById('load-file-btn');

        loadButton?.addEventListener('click', () => this.loadInitialFrame());
        mockStreamButton?.addEventListener('click', () => this.toggleMockStream());
        loadBase64Button?.addEventListener('click', () => this.showBase64Input());
        submitBase64Button?.addEventListener('click', () => this.loadFromBase64Input());
        cancelBase64Button?.addEventListener('click', () => this.hideBase64Input());
        loadFileButton?.addEventListener('click', () => fileInput?.click());
        fileInput?.addEventListener('change', (e) => this.loadFromFile(e));

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
     * Show base64 input container
     */
    private showBase64Input(): void {
        const container = document.getElementById('base64-container');
        if (container) {
            container.style.display = 'block';
            const textarea = document.getElementById('base64-input') as HTMLTextAreaElement;
            textarea?.focus();
        }
    }

    /**
     * Hide base64 input container
     */
    private hideBase64Input(): void {
        const container = document.getElementById('base64-container');
        if (container) {
            container.style.display = 'none';
            const textarea = document.getElementById('base64-input') as HTMLTextAreaElement;
            if (textarea) textarea.value = '';
        }
    }

    /**
     * Load frame from base64 input
     */
    private loadFromBase64Input(): void {
        const textarea = document.getElementById('base64-input') as HTMLTextAreaElement;
        if (!textarea || !textarea.value.trim()) {
            alert('Please paste a base64 string');
            return;
        }

        try {
            const base64Data = textarea.value.trim();
            const frame = FrameLoader.loadFromBase64(base64Data, {
                width: 640,
                height: 480,
                fps: 0,
                mode: 'edges',
                timestamp: Date.now()
            });
            this.frameDisplay.displayFrame(frame);
            this.hideBase64Input();
            console.log('Frame loaded from base64 successfully');
        } catch (error) {
            console.error('Error loading base64 frame:', error);
            alert('Failed to load frame. Please check the base64 string format.');
        }
    }

    /**
     * Load frame from file input
     */
    private loadFromFile(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
                const frame = FrameLoader.loadFromBase64(result, {
                    width: 640,
                    height: 480,
                    fps: 0,
                    mode: 'edges',
                    timestamp: Date.now()
                });
                this.frameDisplay.displayFrame(frame);
                console.log('Frame loaded from file successfully');
            }
        };
        reader.onerror = () => {
            alert('Failed to read file');
        };
        reader.readAsDataURL(file);
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

