// src/utils/formatDate.ts
export const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
};