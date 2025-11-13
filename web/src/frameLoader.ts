/**
 * Module for loading frame data (from static file or mock data)
 */

import { ProcessedFrame } from './types';

export class FrameLoader {
    /**
     * Load a sample processed frame from a static image file
     * In a real implementation, this could fetch from an HTTP endpoint or WebSocket
     */
    public static async loadSampleFrame(): Promise<ProcessedFrame> {
        return new Promise((resolve) => {
            const placeholderImage = FrameLoader.createPlaceholderImage();

            const mockFrame: ProcessedFrame = {
                imageData: placeholderImage,
                stats: {
                    fps: 15.2,
                    width: 640,
                    height: 480,
                    mode: 'edges',
                    timestamp: Date.now()
                }
            };

            setTimeout(() => resolve(mockFrame), 120);
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
            return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        }

        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#1f2937');
        gradient.addColorStop(0.5, '#3b82f6');
        gradient.addColorStop(1, '#10b981');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 4;
        ctx.strokeRect(40, 30, width - 80, height - 60);

        ctx.setLineDash([10, 6]);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.strokeRect(80, 70, width - 160, height - 140);
        ctx.setLineDash([]);

        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 80; x <= width - 80; x += 40) {
            const y = height / 2 + Math.sin(x / 40) * 60;
            ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 36px "Segoe UI", sans-serif';
        ctx.fillText('EdgeViewer Sample Frame', 90, height / 2 - 40);
        ctx.font = '24px "Segoe UI", sans-serif';
        ctx.fillText('Mock processed frame for web viewer', 90, height / 2 + 10);

        return canvas.toDataURL('image/png');
    }
}

