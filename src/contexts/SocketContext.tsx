'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';
import { API_URL, getAuthToken } from '../lib/api';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  joinOrder: (orderId: string) => void;
  leaveOrder: (orderId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL?.trim() || API_URL.replace(/\/api$/, '');

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const token = getAuthToken();
    const s = io(SOCKET_URL, {
      withCredentials: true,
      auth: token ? { token } : undefined,
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    s.on('connect', () => {
      setConnected(true);
      console.log('[Socket] Connected to server, ID:', s.id);

      if (user?.role === 'admin') {
        s.emit('join_admin');
      }
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    s.on('new_order', (order: any) => {
      toast.info(
        `New order received: ${order.orderNumber} (Rs. ${(order.total / 100).toFixed(0)})`,
        'New Order Placed!'
      );
    });

    s.on('low_stock_alert', (product: any) => {
      toast.warning(
        `Product "${product.name}" is low on stock (${product.stock} units remaining)!`,
        'Low Stock Alert'
      );
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user?._id, isAdmin]);

  const joinOrder = (orderId: string) => {
    if (socket && socket.connected) {
      socket.emit('join_order', orderId);
    }
  };

  const leaveOrder = (orderId: string) => {
    if (socket && socket.connected) {
      socket.emit('leave_order', orderId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected, joinOrder, leaveOrder }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
