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

  useEffect(() => {
    socket.on("word", (word) => {
      setWords((prevWords) => [...prevWords, word]);
    });

    socket.on("question", (newQuestion) => {
      setQuestion(newQuestion);
      setWords([]);

    //   window.location.reload();
    });

    return () => {
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
        </div>

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
        
        <WordCloud words={words} question={question} />
        </motion.div>
      </motion.div>
    </div>
  );
};

// SendResponses Component


export default  WordCloudComp ;