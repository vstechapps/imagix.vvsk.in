// Base Layer interface
export interface Layer {
    id: string;
    name: string;
    type: 'Visual' | 'Text' | 'Audio' | 'Video'; // User facing types
    startTime?: number;
    duration?: number;
}

export interface Visual extends Layer {
    x: number; // default: 0
    y: number; // default: 0
    width: number; // default: null (full width)
    height: number; // default: null (full height)
    background: string; // default: null (transparent)
    border: {
        // default: null (no border)
        color: string,
        thickness: number,
    },
    opacity: number; // default: 1
}

export interface Text extends Layer {
    text: string;
    x: number; // default: 0
    y: number; // default: 0
    width: number; // default: null (full width)
    height: number; // default: null (full height)
    opacity: number; // default: 1
    color: string; // default: new etro.Color(0, 0, 0, 1)
    font: string; // default: '10px sans-serif'
    textX: number; // default: 0
    textY: number; // default: 0
    textAlign: string; // default: 'left'
    textBaseline: string; // default: 'alphabetic'
    textDirection: string; // default: 'ltr'
    textStroke: {
        // default: null (no stroke)
        color: string,
        position: string, // default: TextStrokePosition.Outside
        thickness: number, // default: 1
    }
}

export interface Image extends Layer {
    source: string,
    sourceX: number, // default: 0
    sourceY: number, // default: 0
    sourceWidth: number, // default: null (full width)
    sourceHeight: number, // default: null (full height)
    destX: number, // default: 0
    destY: number, // default: 0
    destWidth: number, // default: null (full width)
    destHeight: number, // default: null (full height)
    x: number, // default: 0
    y: number, // default: 0
    width: number, // default: null (full width)
    height: number, // default: null (full height)
    opacity: number, // default: 1
}

export interface Audio extends Layer {
    source: string,
    sourceStartTime: number,
    muted: boolean,
    volume: number,
    playbackRate: number,
}

export interface Video extends Layer {
    source: string,
    sourceX: number,
    sourceY: number,
    sourceWidth: number,
    sourceHeight: number,
    sourceStartTime: number,
    destX: number,
    destY: number,
    destWidth: number,
    destHeight: number,
    x: number,
    y: number,
    width: number,
    height: number,
    opacity: number,
    muted: boolean,
    volume: number,
    playbackRate: number,
}


export interface Media {
    file?: File; // Only available in browser, not stored in Firestore
    path: string; // Blob URL or storage URL
    localPath?: string; // Local file path (if available/supported)
    type: 'image' | 'video' | 'audio';
    format: string;
    name?: string; // File name
    size?: number; // File size in bytes
}



export interface Project {
    id?: string;
    name: string;
    userId: string;
    template: 'portrait' | 'landscape';
    duration: number; // in seconds
    width: number;
    height: number;
    createdAt: string;
    updatedAt: string;
    media?: Media[];
    layers?: Layer[];
}

export interface Font {
    id?: string;
    name: string;
    source: string;
    enabled: boolean;
    createdAt: number;
    updatedAt?: number;
}
