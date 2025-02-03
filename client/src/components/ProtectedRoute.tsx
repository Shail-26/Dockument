// components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

export const ProtectedRoute = () => {
    const { walletAddress } = useWallet();

    if (!walletAddress) {
        return <Navigate to="/connect-wallet" replace />;
    }

    return <Outlet />;
};