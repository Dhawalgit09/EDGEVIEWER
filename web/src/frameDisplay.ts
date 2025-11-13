/**
 * Module for displaying processed frames and updating the canvas
 */

import { ProcessedFrame } from './types';

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
    }

    /**
     * Display a processed frame with its statistics
     */
    public displayFrame(frame: ProcessedFrame): void {
        this.loadImage(frame.imageData)
            .then(img => {
                this.drawImage(img);
                this.updateStats(frame.stats);
            })
            .catch(err => {
                console.error('Error displaying frame:', err);
                this.statsElement.textContent = 'Error loading frame';
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
        const imgAspect = img.width / img.height;
        const canvasAspect = canvas.width / canvas.height;

        let drawWidth: number;
        let drawHeight: number;
        let offsetX = 0;
        let offsetY = 0;

        if (imgAspect > canvasAspect) {
            // Image is wider than canvas
            drawHeight = canvas.height;
            drawWidth = drawHeight * imgAspect;
            offsetX = (canvas.width - drawWidth) / 2;
        } else {
            // Image is taller than canvas
            drawWidth = canvas.width;
            drawHeight = drawWidth / imgAspect;
            offsetY = (canvas.height - drawHeight) / 2;
        }

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

