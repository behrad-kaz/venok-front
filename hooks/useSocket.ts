// ============================================================
// FILE: hooks/useSocket.ts
// ============================================================
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  apiBaseUrl: string;
  conversationId: string;
  token: string;
  onMessage: (message: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useSocket({
  apiBaseUrl,
  conversationId,
  token,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
}: UseSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;
  const isConnectingRef = useRef(false);
  const conversationIdRef = useRef(conversationId);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  const connect = useCallback(() => {
    // ✅ اگر conversationId وجود ندارد، صبر کن
    if (!conversationIdRef.current) {
      console.log('ℹ️ No conversationId provided, waiting...');
      setIsConnecting(false);
      return;
    }

    if (isConnectingRef.current) {
      console.log('ℹ️ Already connecting, skipping...');
      return;
    }

    if (socketRef.current?.connected) {
      console.log('ℹ️ Socket already connected');
      setIsConnected(true);
      setIsConnecting(false);
      return;
    }

    // ✅ اگر socket وجود دارد و در حال اتصال است، صبر کن
    if (socketRef.current) {
      console.log('ℹ️ Socket exists but not connected, attempting to reconnect...');
      socketRef.current.connect();
      return;
    }

    isConnectingRef.current = true;
    setIsConnecting(true);
    
    console.log('🔌 Connecting to Socket.io...', { 
      apiBaseUrl, 
      conversationId: conversationIdRef.current,
      hasToken: !!token 
    });

    try {
      const socket = io(apiBaseUrl, {
        auth: { token: token || undefined },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        path: '/socket.io',
        autoConnect: true, // ✅ autoConnect: true
        forceNew: true,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('✅ Socket connected successfully');
        setIsConnected(true);
        setIsConnecting(false);
        isConnectingRef.current = false;
        reconnectAttempts.current = 0;
        
        const currentConvId = conversationIdRef.current;
        if (currentConvId) {
          console.log('📩 Joining conversation:', currentConvId);
          socket.emit('join_conversation', { conversationId: currentConvId });
        }
        
        onConnect?.();
      });

      socket.on('conversation_joined', (data) => {
        console.log('📩 Joined conversation:', data.messages?.length || 0);
        if (data.messages && Array.isArray(data.messages)) {
          data.messages.forEach((msg: any) => {
            onMessage({
              id: msg.id,
              text: msg.text,
              senderType: msg.senderType || 'customer',
              timestamp: msg.timestamp,
              isInternal: msg.isInternal || false,
              senderName: msg.senderName || (msg.senderType === 'customer' ? 'مشتری' : 'پشتیبانی'),
              fileUrl: msg.fileUrl,
              fileType: msg.fileType,
              conversationId: parseInt(conversationIdRef.current),
            });
          });
        }
      });

      socket.on('new_message', (message) => {
        console.log('💬 New message from Socket:', message);
        
        const convId = message.conversationId || conversationIdRef.current;
        
        onMessage({
          id: message.id,
          text: message.text,
          senderType: message.senderType || 'customer',
          timestamp: message.timestamp || new Date().toISOString(),
          isInternal: message.isInternal || false,
          senderName: message.senderName || (message.senderType === 'customer' ? 'مشتری' : 'پشتیبانی'),
          fileUrl: message.fileUrl,
          fileType: message.fileType,
          conversationId: typeof convId === 'string' ? parseInt(convId) : convId,
        });
      });

      socket.on('disconnect', (reason) => {
        console.log(`🔌 Socket disconnected: ${reason}`);
        setIsConnected(false);
        isConnectingRef.current = false;
        onDisconnect?.();
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message || error);
        setIsConnecting(false);
        isConnectingRef.current = false;
        
        reconnectAttempts.current += 1;
        if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.error('❌ Max reconnect attempts reached');
          socket.disconnect();
        }
        
        onError?.(new Error(error.message || 'Connection error'));
      });

      socket.on('error', (error) => {
        console.error('❌ Socket error:', error?.message || error || 'Unknown error');
        if (error && typeof error === 'object' && 'message' in error) {
          onError?.(new Error(error.message));
        } else if (typeof error === 'string') {
          onError?.(new Error(error));
        }
      });

    } catch (error) {
      console.error('❌ Error creating socket:', error);
      setIsConnecting(false);
      isConnectingRef.current = false;
      onError?.(new Error('Failed to create socket connection'));
    }
  }, [apiBaseUrl, token, onMessage, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsConnecting(true);
      isConnectingRef.current = false;
      reconnectAttempts.current = 0;
    }
  }, []);

  const sendMessage = useCallback((text: string, senderName?: string) => {
    if (!socketRef.current || !isConnected) {
      console.warn('⚠️ Socket not connected, message not sent');
      throw new Error('Socket not connected');
    }
    console.log('📤 Sending message via Socket:', text);
    socketRef.current.emit('send_message', {
      conversationId: conversationIdRef.current,
      text: text,
      isInternal: false,
      senderName: senderName || 'پشتیبانی',
    });
  }, [isConnected]);

  // ✅ وقتی conversationId عوض شد، دوباره وصل شو
  useEffect(() => {
    if (conversationId) {
      conversationIdRef.current = conversationId;
      // اگر socket وجود دارد و متصل است، به room جدید بپیوند
      if (socketRef.current?.connected) {
        socketRef.current.emit('join_conversation', { conversationId });
      } else {
        // اگر socket وجود ندارد یا وصل نیست، دوباره وصل شو
        connect();
      }
    }
  }, [conversationId, connect]);

  // ✅ فقط یک بار در mount اجرا شود
  useEffect(() => {
    connect();
    return () => disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isConnected,
    isConnecting,
    sendMessage,
    disconnect,
    reconnect: connect,
    socketRef,
  };
}