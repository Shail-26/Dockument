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

export type NotificationType = {
    type: 'success' | 'error';
    message: string;
    txHash?: string;
};