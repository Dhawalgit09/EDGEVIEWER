/**
 * Module for displaying processed frames and updating the canvas
 */

import { ProcessedFrame, FrameStats } from './types.js';

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
        // Set explicit width and height attributes (not just CSS)
        if (canvas.width === 0 || canvas.width === 300) {
            canvas.width = 800;
        }
        if (canvas.height === 0 || canvas.height === 150) {
            canvas.height = 600;
        }
        
        // Set CSS size to match
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
        
        // Clear and show loading message
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Loading processed frame...', canvas.width / 2, canvas.height / 2);
        
        // Test that canvas drawing works
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(10, 10, 50, 50); // Draw a green square to test
        
        console.log('FrameDisplay initialized with canvas size:', canvas.width, 'x', canvas.height);
        console.log('Canvas element:', canvas);
        console.log('Canvas context:', this.ctx);
    }

    /**
     * Display a processed frame with its statistics
     */
    public displayFrame(frame: ProcessedFrame): void {
        console.log('Displaying frame:', {
            hasImageData: !!frame.imageData,
            imageDataLength: frame.imageData?.length,
            imageDataPreview: frame.imageData?.substring(0, 50),
            stats: frame.stats
        });

        if (!frame.imageData) {
            console.error('No image data provided');
            this.statsElement.innerHTML = '<div class="stat-item"><strong>Error:</strong> No image data</div>';
            return;
        }

        // Update stats first (even if image fails to load)
        this.updateStats(frame.stats);

        this.loadImage(frame.imageData)
            .then(img => {
                console.log('Image loaded successfully:', {
                    width: img.width,
                    height: img.height,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    complete: img.complete,
                    src: img.src.substring(0, 50)
                });
                
                // Wait a bit to ensure image is fully loaded
                if (!img.complete) {
                    console.log('Image not complete, waiting...');
                    img.onload = () => {
                        console.log('Image onload fired, drawing now');
                        this.drawImage(img);
                    };
                } else {
                    this.drawImage(img);
                }
            })
            .catch(err => {
                console.error('Error displaying frame:', err);
                // Draw error message on canvas
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillStyle = '#ff0000';
                this.ctx.font = '20px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Failed to load image: ' + (err.message || 'Unknown error'), this.canvas.width / 2, this.canvas.height / 2);
                this.statsElement.innerHTML = `<div class="stat-item"><strong>Error:</strong> ${err.message || 'Failed to load image'}</div>`;
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

        console.log('drawImage called with image:', {
            imgWidth: img.width,
            imgHeight: img.height,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            imgComplete: img.complete,
            imgNaturalWidth: img.naturalWidth,
            imgNaturalHeight: img.naturalHeight
        });

        // Ensure canvas has valid dimensions
        if (canvas.width === 0 || canvas.width === 300) {
            canvas.width = 800;
            console.log('Set canvas width to 800');
        }
        if (canvas.height === 0 || canvas.height === 150) {
            canvas.height = 600;
            console.log('Set canvas height to 600');
        }

        // Use actual image dimensions
        const imgWidth = img.naturalWidth || img.width || 640;
        const imgHeight = img.naturalHeight || img.height || 480;

        // Calculate aspect ratio to fit image in canvas
        const imgAspect = imgWidth / imgHeight;
        const canvasAspect = canvas.width / canvas.height;
        
        let drawWidth: number;
        let drawHeight: number;
        let offsetX = 0;
        let offsetY = 0;

        if (imgAspect > canvasAspect) {
            // Image is wider - fit to width
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgAspect;
            offsetY = (canvas.height - drawHeight) / 2;
        } else {
            // Image is taller - fit to height
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgAspect;
            offsetX = (canvas.width - drawWidth) / 2;
        }

        console.log('Calculated draw dimensions:', {
            drawWidth,
            drawHeight,
            offsetX,
            offsetY,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height
        });

        // Clear canvas with black background first
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        console.log('Canvas cleared with black');

        // Draw image centered - use the actual image element
        try {
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            console.log('Image drawn successfully on canvas');
            
            // Verify something was drawn by checking a pixel
            const imageData = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1);
            console.log('Pixel at center:', {
                r: imageData.data[0],
                g: imageData.data[1],
                b: imageData.data[2],
                a: imageData.data[3]
            });
        } catch (error) {
            console.error('Error drawing image:', error);
            // Draw error message
            ctx.fillStyle = '#ff0000';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Error drawing image', canvas.width / 2, canvas.height / 2);
        }
    }

    /**
     * Update the statistics display - Basic text overlay for FPS and resolution
     * This is controlled by TypeScript, not hardcoded HTML
     */
    private updateStats(stats: FrameStats): void {
        // Clear existing content
        this.statsElement.innerHTML = '';
        
        // Create FPS stat item dynamically
        const fpsItem = document.createElement('div');
        fpsItem.className = 'stat-item';
        fpsItem.innerHTML = `<strong>FPS:</strong> ${stats.fps.toFixed(1)}`;
        this.statsElement.appendChild(fpsItem);
        
        // Create Resolution stat item dynamically
        const resolutionItem = document.createElement('div');
        resolutionItem.className = 'stat-item';
        resolutionItem.innerHTML = `<strong>Resolution:</strong> ${stats.width} × ${stats.height}`;
        this.statsElement.appendChild(resolutionItem);
        
        console.log('Stats updated by TypeScript:', {
            fps: stats.fps.toFixed(1),
            resolution: `${stats.width} × ${stats.height}`
        });
    }

    /**
     * Set canvas size
     */
    public setSize(width: number, height: number): void {
        this.canvas.width = width;
        this.canvas.height = height;
    }
}

