import React, { createContext, useState } from 'react';

export const SocketContext = createContext(null);

const SocketProvider = ({children}) => {
    const [socket, setSocket] = useState(null);

    return (
        <SocketContext.Provider value={{ socket, setSocket }}>
            {children}
        </SocketContext.Provider>
    ) 

}

export default SocketProvider;