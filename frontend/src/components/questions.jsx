import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Shield, Clock, Trash2, MessageCircle, Copy, Save } from "lucide-react";
import io from "socket.io-client";

const socket = io("https://wordcloud-twql.onrender.com");

const STORAGE_KEY = 'wordcloud_questions';

const AdminPanel = () => {
  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  // Load questions from localStorage on component mount
  useEffect(() => {
    const savedQuestions = localStorage.getItem(STORAGE_KEY);
    if (savedQuestions) {
      try {
        setQuestions(JSON.parse(savedQuestions));
      } catch (error) {
        console.error('Error loading saved questions:', error);
      }
    }
    document.title = "Admin Panel | Blind Board";
  }, []);

  // Save questions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
      if (questions.length > 0) {
        setSaveStatus('Saved');
        const timer = setTimeout(() => setSaveStatus(''), 2000);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('Error saving questions:', error);
      setSaveStatus('Error saving');
    }
  }, [questions]);

  const addQuestion = async () => {
    if (question.trim()) {
      setIsSubmitting(true);
      socket.emit("question", question);
      
      setQuestions([
        ...questions,
        { text: question, timestamp: new Date().toISOString() }
      ]);
      
      setQuestion("");
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsSubmitting(false);
    }
  };

  const clearAllQuestions = () => {
    if (window.confirm('Are you sure you want to clear all questions? This cannot be undone.')) {
      setQuestions([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addQuestion();
    }
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const copyQuestion = (text, index) => {
    setQuestion(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1000);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          </div>
          <div className="flex items-center space-x-4">
            {saveStatus && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-green-600 flex items-center"
              >
                <Save className="w-4 h-4 mr-1" />
                {saveStatus}
              </motion.span>
            )}
            {questions.length > 0 && (
              <motion.button
                onClick={clearAllQuestions}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-red-500 text-sm hover:text-red-600 transition-colors duration-200"
              >
                Clear All
              </motion.button>
            )}
          </div>
        </div>

        {/* Question Input Section */}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your question..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 resize-none min-h-[100px]"
            />
            <motion.button
              onClick={addQuestion}
              disabled={isSubmitting || !question.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="absolute right-3 bottom-3 bg-indigo-600 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Questions List */}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-2 mb-6">
            <MessageCircle className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">Previous Questions</h2>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {questions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-gray-500 py-8"
                >
                  No questions sent yet
                </motion.div>
              ) : (
                questions.map((q, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group flex items-start justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex-1">
                      <p className="text-gray-800">{q.text}</p>
                      <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimestamp(q.timestamp)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={() => copyQuestion(q.text, index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`${
                          copiedIndex === index ? 'text-green-500' : 'text-gray-500'
                        } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                      >
                        <Copy className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => removeQuestion(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminPanel;