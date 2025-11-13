/**
 * Type definitions for frame data and statistics
 */

export interface FrameStats {
    fps: number;
    width: number;
    height: number;
    mode: 'raw' | 'edges';
    timestamp: number;
}

export interface ProcessedFrame {
    imageData: string; // base64 encoded image
    stats: FrameStats;
}

