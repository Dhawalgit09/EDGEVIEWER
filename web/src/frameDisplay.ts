/**
 * Module for displaying processed frames and updating the canvas
 */

import { ProcessedFrame, FrameStats } from './types';

export class FrameDisplay {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private statsElement: HTMLElement;

    constructor(canvasId: string, statsId: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const stats = document.getElementById(statsId);

        if (!canvas || !stats) {
            throw new Error('Required DOM elements not found');
        }

        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get 2D rendering context');
        }
        this.ctx = context;
        this.statsElement = stats;

        // Initialize canvas with default size and background
        if (canvas.width === 0 || canvas.height === 0) {
            canvas.width = 800;
            canvas.height = 600;
        }
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Waiting for frame...', canvas.width / 2, canvas.height / 2);
        
        console.log('FrameDisplay initialized with canvas size:', canvas.width, 'x', canvas.height);
    }

    /**
     * Display a processed frame with its statistics
     */
    public displayFrame(frame: ProcessedFrame): void {
        console.log('Displaying frame:', {
            hasImageData: !!frame.imageData,
            imageDataLength: frame.imageData?.length,
            stats: frame.stats
        });

        this.loadImage(frame.imageData)
            .then(img => {
                console.log('Image loaded successfully:', img.width, 'x', img.height);
                this.drawImage(img);
                this.updateStats(frame.stats);
            })
            .catch(err => {
                console.error('Error displaying frame:', err);
                this.statsElement.textContent = `Error loading frame: ${err.message || 'Unknown error'}`;
            });
    }

    /**
     * Load an image from base64 data
     */
    private loadImage(base64Data: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = base64Data;
        });
    }

    /**
     * Draw the image on the canvas, maintaining aspect ratio
     */
    private drawImage(img: HTMLImageElement): void {
        const canvas = this.canvas;
        const ctx = this.ctx;

        // Calculate aspect ratio
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const offsetX = (canvas.width - drawWidth) / 2;
        const offsetY = (canvas.height - drawHeight) / 2;

        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw image
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }

    /**
     * Update the statistics display
     */
    private updateStats(stats: FrameStats): void {
        const modeText = stats.mode === 'edges' ? 'Edge Detection' : 'Raw Camera';
        const timestamp = new Date(stats.timestamp).toLocaleTimeString();

        this.statsElement.innerHTML = `
            <div class="stat-item">
                <strong>FPS:</strong> ${stats.fps.toFixed(1)}
            </div>
            <div class="stat-item">
                <strong>Resolution:</strong> ${stats.width} × ${stats.height}
            </div>
            <div class="stat-item">
                <strong>Mode:</strong> ${modeText}
            </div>
            <div class="stat-item">
                <strong>Timestamp:</strong> ${timestamp}
            </div>
        `;
    }

    /**
     * Set canvas size
     */
    public setSize(width: number, height: number): void {
        this.canvas.width = width;
        this.canvas.height = height;
    }
}

