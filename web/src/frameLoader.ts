/**
 * Module for loading frame data (from static file or mock data)
 */

import { ProcessedFrame } from './types.js';

export class FrameLoader {
    /**
     * Load a sample processed frame from a static image file
     * Loads the actual edge-detected frame from Android app
     */
    public static async loadSampleFrame(): Promise<ProcessedFrame> {
        console.log('loadSampleFrame: Starting to load frame...');
    
        return new Promise((resolve) => {
            const img = new Image();
            let resolved = false;
    
            img.onload = () => {
                if (resolved) return;
                resolved = true;
    
                console.log('Image file loaded successfully:', img.width, 'x', img.height);
    
                const frame: ProcessedFrame = {
                    // just use the file path directly
                    imageData: 'sample_frame.png',
                    stats: {
                        fps: 12.5,
                        width: img.width,
                        height: img.height,
                        mode: 'edges',
                        timestamp: Date.now()
                    }
                };
    
                resolve(frame);
            };
    
            img.onerror = (error) => {
                if (resolved) return;
                resolved = true;
                console.error('Failed to load sample_frame.png, using placeholder', error);
    
                const placeholderImage = FrameLoader.createPlaceholderImage();
                const mockFrame: ProcessedFrame = {
                    imageData: placeholderImage,
                    stats: {
                        fps: 12.5,
                        width: 640,
                        height: 480,
                        mode: 'edges',
                        timestamp: Date.now()
                    }
                };
                resolve(mockFrame);
            };
    
            console.log('Attempting to load sample_frame.png...');
            img.src = 'sample_frame.png';  // make sure this file sits next to index.html
        });
    }
    
    /**
     * Load frame from base64 string (for when Android app sends data)
     */
    public static loadFromBase64(base64Data: string, stats: Partial<ProcessedFrame['stats']> = {}): ProcessedFrame {
        const defaultStats: ProcessedFrame['stats'] = {
            fps: 0,
            width: 0,
            height: 0,
            mode: 'edges',
            timestamp: Date.now()
        };

        return {
            imageData: base64Data.startsWith('data:') ? base64Data : `data:image/png;base64,${base64Data}`,
            stats: { ...defaultStats, ...stats }
        };
    }

    /**
     * Mock function to simulate receiving frames periodically
     * In production, this would be replaced with WebSocket or HTTP polling
     */
    public static startMockFrameStream(
        callback: (frame: ProcessedFrame) => void,
        intervalMs: number = 100
    ): () => void {
        let frameCount = 0;
        const intervalId = setInterval(async () => {
            const frame = await this.loadSampleFrame();
            frame.stats.fps = 1000 / intervalMs;
            frame.stats.timestamp = Date.now();
            frame.stats.mode = frameCount % 2 === 0 ? 'edges' : 'raw';
            frameCount++;
            callback(frame);
        }, intervalMs);

        return () => clearInterval(intervalId);
    }

    private static createPlaceholderImage(): string {
        const width = 640;
        const height = 480;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            console.error('Could not get canvas context');
            return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        }

        // Create a sample processed frame that looks like edge detection
        // Black background (typical for edge detection output)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Draw green edges (simulating Canny edge detection output)
        ctx.strokeStyle = '#00FF00'; // Green edges
        ctx.lineWidth = 2;

        // Draw some sample edge patterns
        ctx.beginPath();
        // Horizontal lines
        for (let y = 50; y < height - 50; y += 30) {
            ctx.moveTo(50, y);
            ctx.lineTo(width - 50, y);
        }
        // Vertical lines
        for (let x = 50; x < width - 50; x += 30) {
            ctx.moveTo(x, 50);
            ctx.lineTo(x, height - 50);
        }
        // Diagonal pattern
        for (let i = 0; i < 10; i++) {
            ctx.moveTo(100 + i * 50, 100);
            ctx.lineTo(150 + i * 50, height - 100);
        }
        ctx.stroke();

        // Add text overlay showing it's a sample frame
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Sample Processed Frame', width / 2, height / 2 - 20);
        ctx.font = '16px Arial';
        ctx.fillText('Edge Detection Output (640x480)', width / 2, height / 2 + 10);

        const dataUrl = canvas.toDataURL('image/png');
        console.log('Created placeholder image:', dataUrl.substring(0, 50) + '...');
        return dataUrl;
    }
}

