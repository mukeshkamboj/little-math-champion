import React, { useState, useEffect } from 'react';
import { Download, Trophy, Award, Printer } from 'lucide-react';

interface Question {
  id: number;
  num1: number;
  num2: number;
  operator: '+' | '-';
  correctAnswer: number;
  userAnswer: string;
  questionType: 'result' | 'first' | 'second'; // What to solve for
  displayText: string;
}

interface TestState {
  candidateName: string;
  numQuestions: number;
  questions: Question[];
  currentQuestionIndex: number;
  isTestActive: boolean;
  isTestComplete: boolean;
}

const generateQuestion = (id: number): Question => {
  const operator = Math.random() > 0.5 ? '+' : '-';
  const questionType = ['result', 'first', 'second'][Math.floor(Math.random() * 3)] as 'result' | 'first' | 'second';
  
  let num1: number, num2: number, correctAnswer: number, displayText: string;
  
  if (operator === '+') {
    if (questionType === 'result') {
      // Type 3: 34 + 9 = ?
      // Right side number (num2) must be single digit (1-9)
      // Result cannot exceed 99
      num2 = Math.floor(Math.random() * 9) + 1; // 1 to 9
      const maxNum1 = 99 - num2; // Ensure num1 + num2 <= 99
      num1 = Math.floor(Math.random() * maxNum1) + 1; // 1 to maxNum1
      correctAnswer = num1 + num2;
      displayText = `${num1} + ${num2} = ?`;
    } else if (questionType === 'first') {
      // Type 1: 15 + ? = 20
      // ? (num2) must be single digit (1-9)
      // Result cannot exceed 99
      num2 = Math.floor(Math.random() * 9) + 1; // 1 to 9 (single digit)
      const sum = Math.floor(Math.random() * (99 - num2)) + (num2 + 1); // sum must be > num2 and <= 99
      num1 = sum - num2;
      correctAnswer = num2;
      displayText = `${num1} + ? = ${sum}`;
    } else {
      // Type 1 variant: ? + 15 = 20
      // ? (num1) must be single digit (1-9)
      // Result cannot exceed 99
      num1 = Math.floor(Math.random() * 9) + 1; // 1 to 9 (single digit)
      const sum = Math.floor(Math.random() * (99 - num1)) + (num1 + 1); // sum must be > num1 and <= 99
      num2 = sum - num1;
      correctAnswer = num1;
      displayText = `? + ${num2} = ${sum}`;
    }
  } else {
    // Subtraction
    if (questionType === 'result') {
      // Type 4: 34 - 9 = ?
      // Right side number (num2) must be single digit (1-9)
      num2 = Math.floor(Math.random() * 9) + 1; // 1 to 9
      num1 = Math.floor(Math.random() * (99 - num2)) + (num2 + 1); // num1 must be > num2 and <= 99
      correctAnswer = num1 - num2;
      displayText = `${num1} - ${num2} = ?`;
    } else if (questionType === 'first') {
      // Type 2: 30 - ? = 23
      // ? (num2) must be single digit (1-9)
      num2 = Math.floor(Math.random() * 9) + 1; // 1 to 9 (single digit)
      const difference = Math.floor(Math.random() * (99 - num2)) + 1; // difference can be 1 to (99 - num2)
      num1 = difference + num2; // num1 cannot exceed 99
      correctAnswer = num2;
      displayText = `${num1} - ? = ${difference}`;
    } else {
      // Type 2 variant: ? - 5 = 10
      // ? (num1) can be any value that makes sense
      // num2 must be chosen such that result makes sense
      num2 = Math.floor(Math.random() * 9) + 1; // 1 to 9
      const difference = Math.floor(Math.random() * (99 - num2)) + 1;
      num1 = difference + num2;
      correctAnswer = num1;
      displayText = `? - ${num2} = ${difference}`;
    }
  }
  
  return {
    id,
    num1,
    num2,
    operator,
    correctAnswer,
    userAnswer: '',
    questionType,
    displayText
  };
};

const App: React.FC = () => {
  const [testState, setTestState] = useState<TestState>({
    candidateName: '',
    numQuestions: 10,
    questions: [],
    currentQuestionIndex: 0,
    isTestActive: false,
    isTestComplete: false
  });
  
  const [tempName, setTempName] = useState('');
  const [tempNumQuestions, setTempNumQuestions] = useState('10');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showPrintTest, setShowPrintTest] = useState(false);
  const [printQuestions, setPrintQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('mathChampionState');
    if (saved) {
      const parsed = JSON.parse(saved);
      setTestState(parsed);
      if (parsed.isTestActive && parsed.questions[parsed.currentQuestionIndex]) {
        setCurrentAnswer(parsed.questions[parsed.currentQuestionIndex].userAnswer);
      }
    }
  }, []);

  useEffect(() => {
    if (testState.isTestActive || testState.isTestComplete) {
      localStorage.setItem('mathChampionState', JSON.stringify(testState));
    }
  }, [testState]);

  const startTest = () => {
    if (!tempName.trim()) {
      alert('Please enter your name!');
      return;
    }
    
    const num = parseInt(tempNumQuestions);
    if (isNaN(num) || num < 1) {
      alert('Please enter a valid number of questions (minimum 1)!');
      return;
    }

    const questions = Array.from({ length: num }, (_, i) => generateQuestion(i + 1));
    
    setTestState({
      candidateName: tempName.trim(),
      numQuestions: num,
      questions,
      currentQuestionIndex: 0,
      isTestActive: true,
      isTestComplete: false
    });
    setCurrentAnswer('');
  };

  const generatePrintTest = () => {
    const num = parseInt(tempNumQuestions);
    if (isNaN(num) || num < 1) {
      alert('Please enter a valid number of questions!');
      return;
    }
    
    const questions = Array.from({ length: num }, (_, i) => generateQuestion(i + 1));
    setPrintQuestions(questions);
    setShowPrintTest(true);
    
    setTimeout(() => window.print(), 100);
  };

  const submitAnswer = () => {
    const updatedQuestions = [...testState.questions];
    updatedQuestions[testState.currentQuestionIndex].userAnswer = currentAnswer;
    
    const nextIndex = testState.currentQuestionIndex + 1;
    const isComplete = nextIndex >= testState.questions.length;
    
    setTestState({
      ...testState,
      questions: updatedQuestions,
      currentQuestionIndex: nextIndex,
      isTestActive: !isComplete,
      isTestComplete: isComplete
    });
    
    setCurrentAnswer('');
  };

  const stopTest = () => {
    const updatedQuestions = [...testState.questions];
    if (currentAnswer) {
      updatedQuestions[testState.currentQuestionIndex].userAnswer = currentAnswer;
    }
    
    setTestState({
      ...testState,
      questions: updatedQuestions,
      isTestActive: false,
      isTestComplete: true
    });
  };

  const resetTest = () => {
    setTestState({
      candidateName: '',
      numQuestions: 10,
      questions: [],
      currentQuestionIndex: 0,
      isTestActive: false,
      isTestComplete: false
    });
    setTempName('');
    setTempNumQuestions('10');
    setCurrentAnswer('');
    localStorage.removeItem('mathChampionState');
  };

  const calculateScore = () => {
    const answered = testState.questions.filter(q => q.userAnswer !== '');
    const correct = answered.filter(q => parseInt(q.userAnswer) === q.correctAnswer).length;
    const total = answered.length;
    const percentage = total > 0 ? (correct / total) * 100 : 0;
    
    return { correct, total, percentage };
  };

  const getMotivationalMessage = (percentage: number) => {
    if (percentage === 100) return "You are a Math Champion! 🏆";
    if (percentage >= 75) return "Great job! 🌟";
    return "Nice Try! 💪";
  };

  const exportToPDF = () => {
    const { correct, total, percentage } = calculateScore();
    const motivationalMessage = getMotivationalMessage(percentage);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Math Test Results - ${testState.candidateName}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #4F46E5;
            padding-bottom: 20px;
          }
          .score-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 20px 0;
          }
          .question-card {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
          }
          .correct { border-color: #10b981; background-color: #f0fdf4; }
          .incorrect { border-color: #ef4444; background-color: #fef2f2; }
          .unanswered { background-color: #f9fafb; }
        </style>
      </head>
      <body>
        <div style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: Arial, sans-serif;">
          <div style="text-center; margin-bottom: 40px;">
            <h1 style="color: #333; font-size: 28px; margin-bottom: 10px;">Little Math Champion - Test Results</h1>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h2 style="margin: 0 0 10px 0;">Candidate: ${testState.candidateName}</h2>
              <p style="margin: 0;">Date: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <div style="background: #f0f4f8; padding: 20px; border-radius: 10px; margin-bottom: 30px; text-align: center;">
            <h3 style="color: #333; font-size: 24px; margin-bottom: 10px;">Score: ${correct}/${total} (${percentage.toFixed(1)}%)</h3>
            <p style="font-size: 20px; color: #667eea; font-weight: bold; margin: 0;">${motivationalMessage}</p>
          </div>
          
          <h3 style="color: #333; margin-bottom: 20px;">Detailed Results:</h3>
          <div style="display: grid; gap: 15px;">
            ${testState.questions.map((q, index) => {
              const userAnswerNum = parseInt(q.userAnswer);
              const isCorrect = userAnswerNum === q.correctAnswer;
              const isAnswered = q.userAnswer !== '';
              const bgColor = !isAnswered ? '#f3f4f6' : isCorrect ? '#d1fae5' : '#fee2e2';
              const borderColor = !isAnswered ? '#d1d5db' : isCorrect ? '#10b981' : '#ef4444';
              const statusSymbol = !isAnswered ? '⊘' : isCorrect ? '✓' : '✗';
              
              return `
                <div style="background: ${bgColor}; border: 2px solid ${borderColor}; padding: 15px; border-radius: 8px;">
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                      <p style="font-weight: bold; margin-bottom: 10px; font-size: 16px;">Question ${index + 1}: ${q.displayText}</p>
                      <p style="margin: 5px 0;"><strong>Your Answer:</strong> ${isAnswered ? q.userAnswer : 'Not answered'}</p>
                      <p style="margin: 5px 0;"><strong>Correct Answer:</strong> ${q.correctAnswer}</p>
                    </div>
                    <div style="font-size: 30px; margin-left: 20px;">${statusSymbol}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </body>
    </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${testState.candidateName}-math-test-results.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Results downloaded as HTML file! You can open it in a browser and use "Print to PDF" from your browser\'s print menu to create a PDF.');
  };

  // Start Screen
  if (!testState.isTestActive && !testState.isTestComplete) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-8">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Little Math Champion</h1>
              <p className="text-gray-600">Practice Addition & Subtraction (1-99)</p>
              <p className="text-sm text-gray-500 mt-2">Questions include: 5 + 3 = ?, ? + 7 = 12, 15 - ? = 8</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={tempNumQuestions}
                  onChange={(e) => setTempNumQuestions(e.target.value)}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="Default: 10"
                />
              </div>
              
              <button
                onClick={startTest}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition transform hover:scale-105 active:scale-95"
              >
                Start Test
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <button
                onClick={generatePrintTest}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Generate & Print Test
              </button>
            </div>
          </div>
        </div>

        {/* Print Test View */}
        {showPrintTest && (
          <div className="hidden print:block p-8 bg-white">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Little Math Champion - Practice Test</h1>
              <p className="text-lg">Total Questions: {printQuestions.length}</p>
              <div className="mt-4 border-t-2 border-b-2 border-gray-300 py-2">
                <p className="text-sm">Name: ______________________________ Date: ______________________</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {printQuestions.map((q, index) => (
                <div key={q.id} className="flex items-center gap-4">
                  <span className="font-bold text-lg w-8">{index + 1}.</span>
                  <span className="text-xl">{q.displayText}</span>
                  <div className="border-b-2 border-gray-400 w-24 h-8"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  // Test Active Screen
  if (testState.isTestActive) {
    const currentQuestion = testState.questions[testState.currentQuestionIndex];
    const progress = ((testState.currentQuestionIndex) / testState.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{testState.candidateName}</h2>
              <p className="text-sm text-gray-600">Question {testState.currentQuestionIndex + 1} of {testState.questions.length}</p>
            </div>
            <button
              onClick={stopTest}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
            >
              Stop Test
            </button>
          </div>

          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-6 rounded-2xl shadow-lg">
              <p className="text-5xl font-bold">
                {currentQuestion.displayText}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3">Your Answer:</label>
              <input
                type="number"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && currentAnswer) {
                    submitAnswer();
                  }
                }}
                className="w-full px-6 py-4 text-2xl border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-center"
                placeholder="Enter your answer"
                autoFocus
              />
            </div>

            <button
              onClick={submitAnswer}
              disabled={!currentAnswer}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg text-xl font-semibold hover:bg-indigo-700 transition transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {testState.currentQuestionIndex === testState.questions.length - 1 ? 'Finish Test' : 'Next Question'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (testState.isTestComplete) {
    const { correct, total, percentage } = calculateScore();
    const motivationalMessage = getMotivationalMessage(percentage);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
            <div className="text-center mb-8">
              <Award className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Test Complete!</h1>
              <h2 className="text-2xl font-semibold text-indigo-600 mb-4">{testState.candidateName}</h2>
              
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-6 px-8 rounded-xl mb-4">
                <p className="text-5xl font-bold mb-2">{correct}/{total}</p>
                <p className="text-2xl">{percentage.toFixed(1)}%</p>
              </div>
              
              <p className="text-3xl font-bold text-gray-800">{motivationalMessage}</p>
            </div>

            <div className="flex gap-4 mb-8">
              <button
                onClick={exportToPDF}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export Results (HTML/PDF)
              </button>
              <button
                onClick={resetTest}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Start New Test
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Detailed Results</h3>
            <div className="space-y-4">
              {testState.questions.map((q, index) => {
                const userAnswerNum = parseInt(q.userAnswer);
                const isCorrect = userAnswerNum === q.correctAnswer;
                const isAnswered = q.userAnswer !== '';

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-lg border-2 ${
                      !isAnswered
                        ? 'bg-gray-50 border-gray-300'
                        : isCorrect
                        ? 'bg-green-50 border-green-500'
                        : 'bg-red-50 border-red-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-gray-800 mb-2">
                          Question {index + 1}: {q.displayText}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Your Answer:</p>
                            <p className="text-lg font-semibold">
                              {isAnswered ? q.userAnswer : 'Not answered'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Correct Answer:</p>
                            <p className="text-lg font-semibold text-green-700">{q.correctAnswer}</p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        {!isAnswered ? (
                          <span className="text-4xl text-gray-400">⊘</span>
                        ) : isCorrect ? (
                          <span className="text-4xl text-green-500">✓</span>
                        ) : (
                          <span className="text-4xl text-red-500">✗</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default App;