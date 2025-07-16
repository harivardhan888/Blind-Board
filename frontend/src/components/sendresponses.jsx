import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Send, RefreshCw, Crown } from "lucide-react";
import io from "socket.io-client";

const socket = io("https://wordcloud-twql.onrender.com");

const SendResponses = () => {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    socket.on("question", (newQuestion) => {
      setQuestions([newQuestion]);
      setResponses([[""]]);
      setSubmitted(false);
    });

    return () => {
      socket.off("question");
    };
  }, []);

  const handleChange = (questionIndex, value) => {
    const newResponses = [...responses];
    newResponses[questionIndex][0] = value;
    setResponses(newResponses);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const firstResponse = responses.flat().find((answer) => answer.trim());

    if (firstResponse) {
      setIsSubmitting(true);
      socket.emit("word", firstResponse);
      setSubmitted(true);
      
      // Simulate network delay for animation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setResponses([[""]]);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto"
      >
        <div className="flex items-center justify-center mb-8 space-x-3">
          <Crown className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-800">Response Panel</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {questions.map((question, questionIndex) => (
              <motion.div
                key={questionIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  {question}
                </h3>
                <div className="relative">
                {
                  submitted ? (
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center space-x-1">
                      <span>Response submitted!</span>
                    </div>
                  ):
              
                  <input
                    type="text"
                    value={responses[questionIndex]?.[0] || ""}
                    onChange={(e) => handleChange(questionIndex, e.target.value)}
                    maxLength="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Type your response..."
                  />
                }
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Response</span>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default SendResponses;