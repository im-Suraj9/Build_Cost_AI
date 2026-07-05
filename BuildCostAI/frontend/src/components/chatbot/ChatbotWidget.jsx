import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader, Lightbulb, Zap } from 'lucide-react'
import api from '../../services/api'
import ReactMarkdown from 'react-markdown'

const WELCOME = {
  id: 'welcome',
  role: 'bot',
  content: `Hi! I'm your AI construction consultant powered by **Groq AI** 🏗️⚡

I can help you with:
- **💰 Cost reduction strategies**
- **🧱 Material recommendations**
- **⏱️ Construction timelines**
- **🏛️ Foundation & structural advice**
- **💧 Waterproofing guidance**
- **👷 Contractor selection tips**

What would you like to know about your project?`,
  suggestions: ['How to reduce construction cost?', 'Best materials to use?', 'How long will construction take?'],
  poweredBy: 'groq'
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [groqActive, setGroqActive] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { id: Date.now(), role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }))

      const { data } = await api.post('/chat/message', { message: msg, history })

      if (data.powered_by === 'groq') setGroqActive(true)

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        content: data.response,
        suggestions: data.suggestions || [],
        poweredBy: data.powered_by
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        content: 'Sorry, I had trouble connecting. Please try again.',
        suggestions: []
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl shadow-lg shadow-brand-200 dark:shadow-brand-900/40 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && messages.length > 1 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
            {messages.filter(m => m.role === 'bot').length}
          </span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up" style={{ maxHeight: '70vh' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-brand-500 to-brand-600 p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-white text-sm">BuildCost AI Assistant</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <p className="text-white/80 text-xs">Online · Construction Expert</p>
              </div>
            </div>
            {/* Groq badge */}
            <div className="flex items-center gap-1 bg-white/15 px-2 py-1 rounded-lg">
              <Zap className="w-3 h-3 text-yellow-300" />
              <span className="text-xs font-bold text-white/90">Groq</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll" style={{ minHeight: 0 }}>
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'bot' && (
                  <div className="w-7 h-7 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-brand-500" />
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`rounded-2xl px-3.5 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-brand-500 text-white rounded-tr-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
                  }`}>
                    {msg.role === 'bot' ? (
                      <div className="prose-chat">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>

                  {/* Groq indicator on bot messages */}
                  {msg.role === 'bot' && msg.poweredBy === 'groq' && (
                    <div className="flex items-center gap-1 mt-1 ml-1">
                      <Zap className="w-2.5 h-2.5 text-yellow-500" />
                      <span className="text-xs text-gray-400">Groq · LLaMA 3</span>
                    </div>
                  )}

                  {/* Suggestions */}
                  {msg.suggestions?.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {msg.suggestions.map((s, i) => (
                        <button key={i} onClick={() => sendMessage(s)}
                          className="block w-full text-left text-xs px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-xl border border-brand-100 dark:border-brand-800/50 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors flex items-center gap-1.5">
                          <Lightbulb className="w-3 h-3 shrink-0" />
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-brand-500" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                    <span className="text-xs text-gray-400 ml-1.5">Groq thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about construction costs..."
                className="flex-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all"
                rows={1}
                style={{ maxHeight: '80px' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-9 h-9 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all shrink-0"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-center text-xs text-gray-300 dark:text-gray-600 mt-2 flex items-center justify-center gap-1">
              <Zap className="w-2.5 h-2.5 text-yellow-400" />
              Powered by Groq · Ultra-fast inference
            </p>
          </div>
        </div>
      )}
    </>
  )
}
