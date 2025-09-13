import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Send, RefreshCw, Crown } from "lucide-react";
import io from "socket.io-client";
import WordCloud from "./Cloud";


const socket = io("https://wordcloud-twql.onrender.com");

// WordCloud Component
const WordCloudComp = () => {
  const [words, setWords] = useState([]);
  const [question, setQuestion] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    // Connection status handlers
    socket.on("connect", () => {
      setIsConnected(true);
      setConnectionError(null);
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    socket.on("connect_error", (error) => {
      setConnectionError("Failed to connect to server");
      setIsConnected(false);
      console.error("Connection error:", error);
    });

    // Data handlers
    socket.on("word", (word) => {
      console.log("Received word on display page:", word);
      setWords((prevWords) => {
        const newWords = [...prevWords, word];
        console.log("Updated words array:", newWords);
        return newWords;
      });
    });

    socket.on("question", (newQuestion) => {
      console.log("Received new question on display page:", newQuestion);
      setQuestion(newQuestion);
      setWords([]);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("word");
      socket.off("question");
    };
  }, []);

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-center mb-8 space-x-3">
          <h1 className="text-3xl font-bold text-gray-800">Blind Board</h1>
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
               title={isConnected ? 'Connected' : 'Disconnected'}></div>
        </div>
        
        {connectionError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          >
            {connectionError}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {question && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-lg p-6 mb-8"
            >
              <h2 className="text-xl font-bold text-blue-600">
                {question}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          layout
          className="bg-white rounded-lg shadow-lg p-8"
        >
          {words.length > 0 ? (
            <div>
              <div className="mb-4 text-center">
                <p className="text-sm text-gray-600">
                  Received {words.length} response{words.length !== 1 ? 's' : ''}
                </p>
              </div>
              <WordCloud words={words} question={question} />
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Cloud className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Waiting for responses...</p>
              <p className="text-sm mt-2">
                {isConnected ? 'Connected and ready to receive data' : 'Connecting to server...'}
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

// SendResponses Component


export default  WordCloudComp ;