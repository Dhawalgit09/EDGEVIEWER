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
        // For demonstration, we'll create a mock frame with a placeholder image
        // In production, this would load an actual processed frame from the Android app
        return new Promise((resolve) => {
            // Create a simple test pattern as base64 (1x1 green pixel as placeholder)
            // In real usage, this would be a base64-encoded processed frame from Android
            const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
            
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

            // Simulate async loading
            setTimeout(() => resolve(mockFrame), 100);
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
}

