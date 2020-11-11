

export function makeWebSocket(endpoint, { onOpen, onMessage, onClose }) {
  let socket = null;
  let retryStrategy = null;

  function openSocket() {
    if (socket) {
      return;
    }

    socket = new WebSocket(endpoint);
    socket.addEventListener('error', ev => {
      console.log(`ws.error`, ev);
      socket.close();
    });

    socket.addEventListener('open', ev => {
      onOpen(ev);
    });

    socket.addEventListener('close', ev => {
      socket = null;
      if (onClose) {
        onClose();
      }
    });

    socket.addEventListener('message', onMessage);
  }

  function disconnect() {
    retryStrategy = null;
    if (socket) {
      socket.close();
    }
  }

  const sendMessage = (obj) => {
    if (socket && socket.readyState <= 1) {
      socket.send(JSON.stringify(obj));
    }
  };

  const connectedExt = { connect: openSocket, disconnect };
  return { connected: connectedExt, sendMessage };
}