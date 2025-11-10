class WebSocketClient {
    url: string;
    ws?: WebSocket;

    
    constructor(url: string) {
        this.url = url;
        this.ws = undefined;
    }
    
    connect() {
        // Method 1: Token in query string
        this.ws = new WebSocket(`${this.url}`);
    
    // Method 2: Or authenticate after connection
    // this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      
      // If using method 2, send auth message
      // this.authenticate();
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.isAuthenticated = false;
    };
  }

  authenticate() {
    this.send({
      type: 'auth',
      token: this.authToken
    });
  }

  handleMessage(message) {
    switch (message.type) {
      case 'auth_success':
        this.isAuthenticated = true;
        console.log('Authentication successful');
        break;
      case 'auth_failed':
        console.error('Authentication failed');
        break;
      default:
        console.log('Received:', message);
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket not connected');
    }
  }

  joinRoom(roomId) {
    this.send({
      type: 'join_room',
      room: roomId
    });
  }

  sendMessage(roomId, content) {
    this.send({
      type: 'chat_message',
      room: roomId,
      content: content
    });
  }
}

// Usage
const wsClient = new WebSocketClient(
  'ws://localhost:3000/chat',
  'your_jwt_token_here'
);
wsClient.connect();