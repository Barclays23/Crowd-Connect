// frontend/src/components/chat/FAQChatbot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, X, Bot, User, MessageCircle, Loader2 } from 'lucide-react';
import { chatServices } from '@/services/chatServices';
import type { ChatMessage, IChatResponseState } from '@/types/chat.types';
import type { ApiResponse } from '@/types/common.types';
import { ChatMessageRenderer } from '@/components/chat/ChatMessageRenderer';



export const FAQChatbot = () => {
   const [isOpen, setIsOpen] = useState(false);
   const [input, setInput] = useState('');
   const [isLoading, setIsLoading] = useState(false);
  
   const [messages, setMessages] = useState<ChatMessage[]>([
      {
         id: Date.now(),
         role: 'bot',
         text: "Hello! I'm the CrowdConnect assistant. How can I help you today?",
         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
   ]);
  
   const messagesEndRef = useRef<HTMLDivElement>(null);

   const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
   };

   useEffect(() => {
      scrollToBottom();
   }, [messages, isLoading]);

   const handleSend = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!input.trim() || isLoading) return;

      const userMessage = input.trim();
      setInput('');
      
      // Add User Message
      setMessages(prev => [...prev, {
         id: Date.now(),
         role: 'user',
         text: userMessage,
         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      
      setIsLoading(true);

      try {
         const response: ApiResponse<IChatResponseState> = await chatServices.askQuestion({ question: userMessage });

         console.log('response', response);
         
         if (response.success && response.data) {
            setMessages(prev => [...prev, {
               id: Date.now(),
               role: 'bot',
               text: response.data.answer,
               timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
         }

      } catch (error) {
         console.error("Chat error:", error);
         setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'bot',
            text: "Sorry, I am having trouble connecting right now. Please try again later.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
         }]);

      } finally {
         setIsLoading(false);
      }
   };




   return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
         
         {/* The Chat Window */}
         <div 
         className={`mb-4 transition-all duration-300 origin-bottom-right ${
            isOpen ? 'scale-100 opacity-100' : 'scale-50 opacity-0 pointer-events-none absolute'
         }`}
         >
         <Card className="w-95 max-w-[calc(100vw-32px)] h-137.5 max-h-[calc(100vh-120px)] bg-(--card-bg) shadow-(--shadow-xl) border border-(--border-muted) flex flex-col overflow-hidden">
            
            {/* FIXED: Removed hardcoded white, using --btn-primary-text and --bg-neutral */}
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-primary text-(--btn-primary-text) rounded-t-lg p-4 shrink-0">
               <div className="flex items-center gap-2">
               <div className="bg-(--bg-neutral) p-1.5 rounded-full">
                  <Bot className="w-5 h-5 text-(--btn-primary-text)" />
               </div>
               <CardTitle className="text-lg font-semibold text-(--btn-primary-text)">CrowdConnect FAQ</CardTitle>
               </div>
               <Button 
               size="sm" 
               variant="ghost" 
               onClick={() => setIsOpen(false)}
               className="h-8 w-8 p-0 text-(--btn-primary-text) hover:bg-(--bg-neutral-hover) hover:text-(--btn-primary-text)"
               >
               <X className="w-5 h-5" />
               </Button>
            </CardHeader>
            
            <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
               {/* Messages Area */}
               <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-(--bg-secondary)">
               {messages.map((message) => (
                  <div
                     key={message.id}
                     className={`flex gap-3 animate-scaleIn ${
                     message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                     }`}
                  >
                     <div
                     className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        message.role === 'user'
                           ? 'bg-(--brand-primary) text-(--btn-primary-text)'
                           : 'bg-(--bg-tertiary) text-(--text-secondary) border border-(--border-muted)'
                     }`}
                     >
                     {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                     </div>
                     
                     <div
                     className={`flex flex-col gap-1 max-w-[80%] ${
                        message.role === 'user' ? 'items-end' : 'items-start'
                     }`}
                     >
                     <div
                        className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${
                           message.role === 'user'
                           ? 'bg-(--brand-primary) text-(--btn-primary-text) rounded-tr-sm'
                           : 'bg-(--card-primary) text-(--text-primary) border border-(--border-muted) rounded-tl-sm'
                        }`}
                     >
                        {/* <p className="whitespace-pre-line leading-relaxed">{message.text}</p> */}
                        <ChatMessageRenderer 
                           content={message.text} 
                           isAiResponse={message.role === 'bot'} 
                        />
                     </div>
                     <span className="text-xs text-(--text-tertiary)">
                        {message.timestamp}
                     </span>
                     </div>
                  </div>
               ))}

               {/* Typing Indicator */}
               {isLoading && (
                  <div className="flex gap-3 animate-scaleIn flex-row">
                     <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--bg-tertiary) text-(--text-secondary) border border-(--border-muted)">
                     <Bot className="w-4 h-4" />
                     </div>
                     <div className="bg-(--card-primary) border border-(--border-muted) rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
                     {/* FIXED: Changed to animate-bounce with arbitrary delays for staggering */}
                     <span className="w-1.5 h-1.5 rounded-full bg-(--brand-primary)/60 animate-bounce"></span>
                     <span className="w-1.5 h-1.5 rounded-full bg-(--brand-primary)/60 animate-bounce [animation-delay:0.2s]"></span>
                     <span className="w-1.5 h-1.5 rounded-full bg-(--brand-primary)/60 animate-bounce [animation-delay:0.4s]"></span>
                     </div>
                  </div>
               )}
               <div ref={messagesEndRef} />
               </div>

               {/* Input Area */}
               <form onSubmit={handleSend} className="border-t border-(--border-muted) p-3 bg-(--card-bg) shrink-0">
               <div className="flex gap-2">
                  <Input
                     type="text"
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     disabled={isLoading}
                     placeholder="Type your question..."
                     className="flex-1 bg-(--form-bg) border-(--form-input-border) text-(--text-primary) rounded-full focus-visible:ring-(--brand-primary)"
                  />
                  <Button 
                     type="submit"
                     size="icon"
                     disabled={!input.trim() || isLoading}
                     className="rounded-full bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-(--btn-primary-text) shrink-0"
                  >
                     {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                  </Button>
               </div>
               <p className="text-[11px] text-(--text-tertiary) mt-2 text-center">
                  Ask me anything about bookings, events, or refunds!
               </p>
               </form>
            </CardContent>
         </Card>
         </div>

         {/* Floating Toggle Button (Only visible when chat is closed) */}
         <Button 
         size="lg"
         onClick={() => setIsOpen(!isOpen)}
         className={`h-14 w-14 rounded-full bg-gradient-primary hover:scale-105 text-(--btn-primary-text) shadow-(--shadow-lg) hover:shadow-(--shadow-xl) transition-all duration-300 ${
            isOpen ? 'scale-0 opacity-0 absolute' : 'scale-100 opacity-100'
         }`}
         aria-label="Open FAQ Chatbot"
         >
         <MessageCircle className="w-7 h-7" />
         </Button>

      </div>
   );
};