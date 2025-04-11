import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderImage: string;
  content: string;
  fileUrl?: string;
  fileType?: string;
  createdAt: string;
}

interface GroupChatProps {
  groupId: string;
  groupName: string;
}

const GroupChat: React.FC<GroupChatProps> = ({ groupId, groupName }) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageCache = useRef(new Set<string>());
  
  // Connect to socket server and load messages
  useEffect(() => {
    if (!session?.user) return;

    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || '', {
      path: '/api/socket',
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      
      // Join the group chat
      socketInstance.emit('joinGroup', {
        groupId: groupId,
        userId: session.user.id
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Listen for new messages
    socketInstance.on('newMessage', (message: any) => {
      console.log('New message received:', message);
      
      // Check if this message is already in our cache
      if (messageCache.current.has(message._id)) {
        return; // Skip duplicate messages
      }
      
      // Add to cache
      messageCache.current.add(message._id);
      
      // Convert the message format
      const formattedMessage: Message = {
        id: message._id,
        senderId: message.sender._id,
        senderName: message.sender.name,
        senderImage: message.sender.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender.name)}`,
        content: message.content,
        fileUrl: message.fileUrl,
        fileType: message.fileType,
        createdAt: message.createdAt
      };
      
      setMessages(prev => [...prev, formattedMessage]);
    });

    setSocket(socketInstance);

    // Fetch initial messages from API
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        // Fetch messages from the server - replace with real API call
        const response = await fetch(`/api/messages?groupId=${groupId}`);
        if (response.ok) {
          const data = await response.json();
          const formattedMessages = data.map((msg: any) => ({
            id: msg._id,
            senderId: msg.sender._id,
            senderName: msg.sender.name,
            senderImage: msg.sender.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender.name)}`,
            content: msg.content,
            fileUrl: msg.fileUrl,
            fileType: msg.fileType,
            createdAt: msg.createdAt
          }));
          
          // Add all to cache
          formattedMessages.forEach((msg: Message) => {
            messageCache.current.add(msg.id);
          });
          
          setMessages(formattedMessages);
        } else {
          // Fallback to empty array if API fails
          setMessages([]);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.emit('leaveGroup', {
          groupId: groupId,
          userId: session.user.id
        });
        socketInstance.disconnect();
      }
    };
  }, [groupId, session]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !session?.user || !socket) return;
    
    // Create payload for socket
    const payload = {
      studyGroup: groupId,
      content: newMessage.trim()
    };
    
    // Send message via socket
    socket.emit('sendMessage', payload);
    
    // We'll no longer add the local message immediately as we'll get it back via socket
    // This prevents duplicate messages
    
    // Reset input
    setNewMessage('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('Starting file upload for:', file.name, 'type:', file.type, 'size:', file.size);

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('file', file);
      console.log('FormData created with file:', file.name);

      // Create XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();
      
      // Set up progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          console.log(`Upload progress: ${percentComplete}%`);
          setUploadProgress(percentComplete);
        }
      });
      
      // Handle the response
      const uploadPromise = new Promise<{url: string}>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log('Upload complete, server response:', response);
              resolve(response);
            } catch (e) {
              console.error('Error parsing response:', xhr.responseText);
              reject(new Error('Invalid response from server'));
            }
          } else {
            console.error('Upload failed with status:', xhr.status, xhr.statusText);
            console.error('Response:', xhr.responseText);
            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
          }
        };
        
        xhr.onerror = () => {
          console.error('Network error during upload');
          reject(new Error('Network error during upload'));
        };
      });
      
      // Open and send the request
      xhr.open('POST', '/api/chat/upload', true);
      xhr.send(formData);
      console.log('Upload request sent');
      
      // Wait for upload to complete
      const data = await uploadPromise;
      
      console.log('File uploaded successfully, got URL:', data.url);
      
      // Verify the file is accessible
      const checkFileRequest = new XMLHttpRequest();
      checkFileRequest.open('HEAD', data.url, true);
      checkFileRequest.onload = () => {
        console.log('File check status:', checkFileRequest.status);
      };
      checkFileRequest.onerror = () => {
        console.error('File check failed, URL might not be accessible:', data.url);
      };
      checkFileRequest.send();
      
      // Send message with file
      if (socket && isConnected) {
        const messagePayload = {
          studyGroup: groupId,
          content: `📎 ${file.name}`,
          fileUrl: data.url,
          fileType: file.type,
          fileName: file.name,
          fileSize: file.size
        };
        
        console.log('Sending message with file payload:', JSON.stringify(messagePayload));
        socket.emit('sendMessage', messagePayload);
        
        // Add the message locally immediately for better UX
        const newMessage: Message = {
          id: Date.now().toString(), // Temporary ID
          senderId: session?.user?.id || '',
          senderName: session?.user?.name || '',
          senderImage: session?.user?.image || '',
          content: messagePayload.content,
          fileUrl: messagePayload.fileUrl,
          fileType: messagePayload.fileType,
          createdAt: new Date().toISOString()
        };
        
        console.log('Adding local message with file:', newMessage);
        setMessages(prev => [...prev, newMessage]);
      } else {
        console.error('Socket not connected or not available', {
          socketExists: !!socket,
          isConnected
        });
        toast.error('Chat connection is not available. Try refreshing the page.');
      }

      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-50 rounded-t-lg px-4 py-3 border-b">
        <h3 className="text-lg font-medium text-gray-900">Group Chat</h3>
        <p className="text-sm text-gray-500">Chat with other members of {groupName}</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">No messages yet. Be the first to send one!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === session?.user?.id;
            
            return (
              <div 
                key={message.id} 
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[75%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                  <div className="flex-shrink-0">
                    <img 
                      src={message.senderImage} 
                      alt={message.senderName} 
                      className="h-10 w-10 rounded-full"
                    />
                  </div>
                  <div className={`mx-2 ${isCurrentUser ? 'text-right' : ''}`}>
                    <div 
                      className={`px-4 py-2 rounded-lg ${
                        isCurrentUser 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p>{message.content}</p>
                      {message.fileUrl && (
                        <div className="mt-2 border rounded overflow-hidden">
                          {message.fileType?.startsWith('image/') ? (
                            <div className="relative">
                              <img 
                                src={message.fileUrl} 
                                alt="Uploaded content" 
                                className="max-w-full h-auto rounded"
                                onError={(e) => {
                                  console.error('Error loading image:', message.fileUrl);
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement?.classList.add('bg-gray-100', 'p-2');
                                  e.currentTarget.parentElement?.appendChild(
                                    document.createTextNode('Image failed to load')
                                  );
                                }}
                              />
                            </div>
                          ) : (
                            <a 
                              href={message.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={`text-blue-500 hover:underline flex items-center p-3 ${
                                isCurrentUser ? 'bg-primary-700' : 'bg-gray-100'
                              }`}
                            >
                              <svg className="w-6 h-6 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">Download File</span>
                                <span className="text-xs opacity-75 truncate max-w-[150px]">
                                  {message.content.replace('📎 ', '')}
                                </span>
                              </div>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      <span className="font-medium">{isCurrentUser ? 'You' : message.senderName}</span>
                      {' '}• {formatTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 rounded-l-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!session}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 border border-gray-300"
            disabled={!session || isUploading}
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 mb-1"></div>
                <span className="text-xs">{uploadProgress}%</span>
              </div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            )}
          </button>
          <button
            type="submit"
            disabled={!newMessage.trim() || !session}
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-r-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />
        {!session && (
          <p className="text-xs text-gray-500 mt-2">
            You need to sign in to send messages.
          </p>
        )}
      </form>
    </div>
  );
};

export default GroupChat; 