// src/types.ts
export interface Credential {
    metadataCID: string;
    receiver: string;
    metadata: string;
    status: 'Active' | 'Revoked' | 'Deleted';
    timestamp: number;
    revokedFields: string[];
}

export interface FormField {
    key: string;
    value: string;
    isMandatory?: boolean;
}

export interface Document {
    fileHash: string;
    filename: string;
    metadataCID: string;
    timestamp: number;
    status: 'Active' | 'Revoked' | 'Deleted';
    url: string;
}

export interface NotificationType {
    type: 'success' | 'error';
    message: string;
    txHash?: string;
}