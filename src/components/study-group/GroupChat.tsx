import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { io, Socket } from 'socket.io-client';
import { StudyGroup } from '@/lib/redux/slices/studyGroupSlice';

interface Message {
  _id: string;
  studyGroup: string;
  sender: {
    _id: string;
    name: string;
    image?: string;
  };
  content: string;
  createdAt: string;
}

interface GroupChatProps {
  group: StudyGroup;
}

const GroupChat = ({ group }: GroupChatProps) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize socket connection
  useEffect(() => {
    if (!session?.user?.id || !group._id) return;
    
    // Connect to WebSocket server
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
    console.log('Connecting to socket at:', socketUrl);
    
    try {
      const socketInstance = io(socketUrl, {
        path: '/api/socket',
        query: {
          userId: session.user.id,
          groupId: group._id,
        },
      });
      
      socketInstance.on('connect', () => {
        console.log('Socket connected successfully');
        setSocketConnected(true);
      });
      
      socketInstance.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        setSocketConnected(false);
        // Don't set error message here to avoid UI disruption
      });
      
      socketInstance.on('newMessage', (newMessage: Message) => {
        setMessages(prevMessages => [...prevMessages, newMessage]);
      });
      
      setSocket(socketInstance);
      
      // Socket cleanup on component unmount
      return () => {
        socketInstance.disconnect();
      };
    } catch (error) {
      console.error('Error setting up socket:', error);
    }
  }, [session, group._id]);
  
  // Fetch previous messages
  useEffect(() => {
    if (!group._id) return;
    
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/messages/${group._id}`);
        
        if (!response.ok) {
          throw new Error('Failed to load messages');
        }
        
        const data = await response.json();
        setMessages(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        
        // Use mock messages for demo
        const mockMessages: Message[] = [
          {
            _id: '1',
            studyGroup: group._id,
            sender: {
              _id: '1',
              name: 'Demo User',
              image: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff',
            },
            content: 'Welcome to our study group! Let\'s discuss our study plan.',
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          },
          {
            _id: '2',
            studyGroup: group._id,
            sender: {
              _id: '2',
              name: 'Jane Smith',
              image: 'https://ui-avatars.com/api/?name=Jane+Smith&background=553C9A&color=fff',
            },
            content: 'I\'m struggling with the latest assignment. Can anyone help?',
            createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          },
          {
            _id: '3',
            studyGroup: group._id,
            sender: {
              _id: '3',
              name: 'Bob Johnson',
              image: 'https://ui-avatars.com/api/?name=Bob+Johnson&background=047857&color=fff',
            },
            content: 'I can help with that. Let\'s meet before the next class.',
            createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          },
        ];
        
        setMessages(mockMessages);
        setError('Using demo messages - actual API unavailable');
        setIsLoading(false);
      }
    };
    
    fetchMessages();
  }, [group._id]);
  
  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !session?.user?.id) return;
    
    try {
      if (socket && socketConnected) {
        // Socket is working, send through socket
        const payload = {
          studyGroup: group._id,
          content: message,
        };
        
        socket.emit('sendMessage', payload);
      } else {
        // Socket not working, add a mock message directly
        const mockMessage: Message = {
          _id: `mock-${Date.now()}`,
          studyGroup: group._id,
          sender: {
            _id: session.user.id,
            name: session.user.name || 'You',
            image: session.user.image || undefined,
          },
          content: message,
          createdAt: new Date().toISOString(),
        };
        
        setMessages(prevMessages => [...prevMessages, mockMessage]);
        
        if (!error) {
          setError('Demo mode: messages are not saved');
        }
      }
      
      // Clear input
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { [date: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = formatMessageDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };
  
  const messageGroups = groupMessagesByDate();
  const isCurrentUser = (senderId: string) => senderId === session?.user?.id;

  return (
    <div className="flex flex-col bg-white rounded-lg shadow overflow-hidden h-[500px]">
      <div className="bg-primary-600 text-white px-4 py-3 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Group Chat</h3>
        {!socketConnected && socket && (
          <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">
            Demo Mode
          </span>
        )}
      </div>
      
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2">
          <p className="text-xs text-yellow-700">{error}</p>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500 text-center">
            No messages yet. Be the first to send one!
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, msgs]) => (
            <div key={date} className="space-y-3">
              <div className="flex justify-center">
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                  {date}
                </span>
              </div>
              
              {msgs.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${isCurrentUser(msg.sender._id) ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md ${
                      isCurrentUser(msg.sender._id)
                        ? 'bg-primary-100 text-primary-900'
                        : 'bg-gray-100 text-gray-800'
                    } rounded-lg px-4 py-2 shadow-sm`}
                  >
                    {!isCurrentUser(msg.sender._id) && (
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        {msg.sender.name}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className="text-xs text-gray-500 text-right mt-1">
                      {formatMessageTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-gray-200 p-4">
        {!session ? (
          <div className="text-center text-gray-500">
            Please sign in to join the conversation
          </div>
        ) : (
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 input-field py-2"
              placeholder="Type your message..."
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="btn-primary px-4 py-2"
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default GroupChat; 