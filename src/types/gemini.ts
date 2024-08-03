type Funcs = "create_note"

export interface GeminiResponseStreaming {
    candidates:    Candidate[];
    usageMetadata: UsageMetadata;
}

export interface GeminiResponse {
    candidates:    Candidate[];
    usageMetadata: UsageMetadata;
}

export interface Candidate {
    content:        Content;
    finishReason:   string;
    index:          number;
    safetyRatings?: SafetyRating[];
}

export interface Content {
    parts: CheatPart[];
    role:  string;
}

export interface TextPart {
    text: string;
}

export interface FuncCallPart {
    functionCall: {
        name: Funcs,
        args: {
            [key:string]: string
        }
    }
}

export interface CheatPart {
    text?: string;
    functionCall?: {
        name: Funcs,
        args: {
            [key:string]: string
        }
    }
}

export interface SafetyRating {
    category:    string;
    probability: Probability;
}

export enum Probability {
    Negligible = "NEGLIGIBLE",
}

export interface UsageMetadata {
    promptTokenCount:     number;
    candidatesTokenCount: number;
    totalTokenCount:      number;
}