import { useState, useEffect, useRef } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import Layout from '@/components/layout/Layout';
import dbConnect from '@/lib/mongodb';
import StudyGroup from '@/models/StudyGroup';
import Message from '@/models/Message';

interface MessageType {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    image: string;
  };
  groupId: string;
  createdAt: string;
}

interface ChatPageProps {
  group: any;
  initialMessages: MessageType[];
}

export default function ChatPage({ group, initialMessages }: ChatPageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messageCache = useRef(new Set<string>());

  // Initialize message cache with initial messages
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      initialMessages.forEach(msg => {
        messageCache.current.add(msg._id);
      });
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Connect to socket.io server
  useEffect(() => {
    if (!session) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || '', {
      path: '/api/socket',
    });

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
      
      // Join the group chat room
      socketInstance.emit('joinGroup', {
        groupId: group._id,
        userId: session.user.id
      });
    });

    socketInstance.on('newMessage', (message: MessageType) => {
      console.log('Received new message:', message);
      
      // Check if message is already in our cache to prevent duplicates
      if (messageCache.current.has(message._id)) {
        return;
      }
      
      // Add to message cache
      messageCache.current.add(message._id);
      
      setMessages(prev => [...prev, message]);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.emit('leaveGroup', {
        groupId: group._id,
        userId: session.user.id
      });
      socketInstance.disconnect();
    };
  }, [session, group._id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket || !isConnected) return;

    socket.emit('sendMessage', {
      studyGroup: group._id,
      content: newMessage.trim(),
    });

    setNewMessage('');
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=/study-groups/${group._id}/chat`);
    }
  }, [status, router, group._id]);

  // Check if user is a member of the group
  const isMember = group.members.some((member: any) => 
    member._id === session?.user.id
  );

  // Redirect if user is not a member of the group
  useEffect(() => {
    if (status === 'authenticated' && !isMember) {
      router.push(`/study-groups/${group._id}`);
    }
  }, [status, isMember, router, group._id]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || !isMember) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/study-groups/${group._id}`} className="text-primary-600 hover:text-primary-500 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Study Group
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white mr-2">{group.name}</h1>
              <div className="text-white bg-primary-500 px-3 py-1 rounded-full text-sm font-medium">
                Chat
              </div>
            </div>
            <div className="text-white text-sm">
              {isConnected ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Connected
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                  Disconnected
                </span>
              )}
            </div>
          </div>
          
          {/* Chat area */}
          <div className="flex flex-col h-[calc(100vh-300px)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-lg font-medium">No messages yet</p>
                  <p>Be the first to send a message to the group!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isCurrentUser = message.sender._id === session.user.id;
                    
                    return (
                      <div 
                        key={message._id} 
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className="flex-shrink-0">
                            <Image
                              src={message.sender.image || '/images/default-avatar.png'}
                              alt={message.sender.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          </div>
                          <div className={`mx-2 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                            <div className={`px-4 py-2 rounded-lg ${
                              isCurrentUser 
                                ? 'bg-primary-500 text-white' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              <p>{message.content}</p>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              <span>{message.sender.name}</span>
                              <span className="mx-1">•</span>
                              <span>{new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Message input */}
            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 input-field h-10"
                  disabled={!isConnected}
                />
                <button
                  type="submit"
                  className="ml-2 bg-primary-600 hover:bg-primary-500 text-white h-10 px-4 rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newMessage.trim() || !isConnected}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
              
              {!isConnected && (
                <p className="text-sm text-red-500 mt-2">
                  You are currently disconnected. Please refresh the page to reconnect.
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Member sidebar could be added here in a more complex layout */}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  
  await dbConnect();
  
  try {
    // Find the study group
    const group = await StudyGroup.findById(id)
      .populate('creator', 'name image')
      .populate('members', 'name image')
      .lean();
    
    if (!group) {
      return {
        notFound: true,
      };
    }
    
    // Properly cast the MongoDB document to avoid type issues
    const typedGroup = group as any;
    
    // Convert group data
    const groupData = {
      ...typedGroup,
      _id: typedGroup._id.toString(),
      creator: {
        ...typedGroup.creator,
        _id: typedGroup.creator._id.toString(),
      },
      members: typedGroup.members.map((member: any) => ({
        ...member,
        _id: member._id.toString(),
      })),
      createdAt: typedGroup.createdAt.toISOString(),
      updatedAt: typedGroup.updatedAt.toISOString(),
    };
    
    // Fetch messages for this group
    const messages = await Message.find({ groupId: id })
      .populate('sender', 'name image')
      .sort({ createdAt: 1 })
      .lean();
    
    // Convert message data
    const messageData = messages.map((message: any) => ({
      ...message,
      _id: message._id.toString(),
      sender: {
        ...message.sender,
        _id: message.sender._id.toString(),
      },
      groupId: message.groupId.toString(),
      createdAt: message.createdAt.toISOString(),
    }));
    
    return {
      props: {
        group: groupData,
        initialMessages: messageData,
      },
    };
  } catch (error) {
    console.error('Error fetching study group data:', error);
    return {
      notFound: true,
    };
  }
}; 