import { useEffect, useState, useRef } from 'react';

const useWebSockets = (url = 'ws://localhost:8005/ws/clients') => {
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef(null);

    useEffect(() => {
        const connectWs = () => {
            ws.current = new WebSocket(url);

            ws.current.onopen = () => {
                console.log('WebSocket Connected');
                setIsConnected(true);
            };

            ws.current.onclose = () => {
                console.log('WebSocket Disconnected. Reconnecting...');
                setIsConnected(false);
                setTimeout(connectWs, 3000); // Auto-reconnect
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket Error:', error);
                ws.current.close();
            };
        };

        connectWs();

        return () => {
            if (ws.current) {
                ws.current.onclose = null; // Prevent reconnect on cleanup
                ws.current.close();
            }
        };
    }, [url]);

    return { isConnected };
};

export default useWebSockets;
