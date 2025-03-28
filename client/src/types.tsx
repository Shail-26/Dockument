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
    revokedFieldKeys?: any;
    fileHash: string;
    filename: string;
    metadataCID?: string;
    timestamp: number;
    status: 'Active' | 'Revoked' | 'Deleted' | 'Shared';
    url: string;
    allowedFields?: string[]; // Optional for shared documents
    expiration?: number; // Optional for shared documents
    filteredMetadata?: { [key: string]: any }; // Optional for shared documents
    recipient?: string;
}

export interface NotificationType {
    type: 'success' | 'error';
    message: string;
    txHash?: string;
}