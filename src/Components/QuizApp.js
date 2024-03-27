import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './QuizApp.css';

const QuizApp = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [numQuestions, setNumQuestions] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // Initial time in seconds
  const [quizEnded, setQuizEnded] = useState(false);

  const handleNextQuestion = useCallback(() => {
    setShowResult(false);
    setUserAnswer('');
    setResultMessage('');
    if (currentQuestion < numQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(60); // Reset time for next question
    } else {
      setQuizEnded(true);
    }
  }, [currentQuestion, numQuestions]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `https://opentdb.com/api.php?amount=${numQuestions}&difficulty=${difficulty}&type=multiple`
        );
        const updatedQuestions = response.data.results.map((question) => {
          const answers = [
            ...question.incorrect_answers,
            question.correct_answer,
          ];
          // Shuffle the answers array
          shuffleArray(answers);
          return {
            ...question,
            answers: answers.map(answer => decodeEntities(answer)),
          };
        });
        setQuestions(updatedQuestions);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, [difficulty, numQuestions]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0 && currentQuestion < numQuestions) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && currentQuestion < numQuestions) {
      handleNextQuestion();
    }
    return () => {
      clearTimeout(timer);
    };
  }, [timeLeft, currentQuestion, numQuestions, handleNextQuestion]);

  const handleAnswerChange = (event) => {
    setUserAnswer(event.target.value);
  };

  const handleCheckAnswer = () => {
    if (
      userAnswer.toLowerCase() ===
      questions[currentQuestion].correct_answer.toLowerCase()
    ) {
      setResultMessage('Correct!');
      setScore(score + 1); // Increment score for correct answer
    } else {
      setResultMessage(
        `Incorrect! The correct answer is: ${questions[currentQuestion].correct_answer}`
      );
    }
    setShowResult(true);
  };

  const handleDifficultyChange = (event) => {
    setDifficulty(event.target.value);
  };

  const handleNumQuestionsChange = (event) => {
    setNumQuestions(event.target.value);
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const decodeEntities = (encodedString) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = encodedString;
    return textarea.value;
  };

  if (questions.length === 0) {
    return <div>Loading...</div>;
  }

  if (quizEnded) {
    return (
      <div className="quiz-container">
        <h1>End of Quiz</h1>
        <div className="score">Your Score: {score} / {numQuestions}</div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <h1>Quiz Battle</h1>
      <div className="options">
        <div>
          <label htmlFor="difficulty">Select Difficulty:</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={handleDifficultyChange}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label htmlFor="numQuestions">Number of Questions:</label>
          <input
            type="number"
            id="numQuestions"
            value={numQuestions}
            onChange={handleNumQuestionsChange}
            min="1"
          />
        </div>
      </div>
      <div className="score">Score: {score} / {numQuestions}</div>
      <div className="timer">Time Left: {timeLeft} seconds</div>
      {showResult && <p>{resultMessage}</p>}
      <h2 dangerouslySetInnerHTML={{ __html: questions[currentQuestion].question }} />
      <div className="radio-group">
        {questions[currentQuestion].answers.map((answer, index) => (
          <div key={index} className="answer-option">
            <input
              type="radio"
              id={`answer${index}`}
              name="answer"
              value={answer}
              checked={userAnswer === answer}
              onChange={handleAnswerChange}
              disabled={showResult}
            />
            <label htmlFor={`answer${index}`} dangerouslySetInnerHTML={{ __html: answer }} />
          </div>
        ))}
      </div>
      <div className="button-group">
        <div className="column">
          <button
            className="ui button primary fluid"
            onClick={handleCheckAnswer}
            disabled={showResult}
          >
            Check Answer
          </button>
        </div>
        <div className="column">
          <button
            className="ui button secondary fluid"
            onClick={handleNextQuestion}
            disabled={!showResult}
          >
            Next Question
          </button>
        </div>
      </div>
      <footer className="footer">
        <p>&copy; 2024 JP LLC. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default QuizApp;
