document.addEventListener("DOMContentLoaded", () => {
  // Hide all games
  document.getElementById("game1-content").style = "display: none;";
  document.getElementById("game2-content").style = "display: none;";
  document.getElementById("game3-content").style = "display: none;";
  // Hide game actions
  document.getElementById("game-actions").style = "display: none;";

  // hide les informations du jeu , parce que JS is on!
  const games = document.querySelectorAll(".information");
  games.forEach((game) => {
    game.style.display = "none";
  });
  
  //activer le bouton de soumission:
  document.getElementById("submit-button").disabled = false;
  //rendre les boutons besoin d'aide + retour a l'accueil visibles:
  document.getElementById("help-button").style.display = "block";
  document.getElementById("back-button").style.display = "inline";

});

//track si la partie s'est terminee par manque de temps
var tempsEcoule = false;

document
  .getElementById("game1-button")
  .addEventListener("click", () => showGame("game1"));
document
  .getElementById("game2-button")
  .addEventListener("click", () => showGame("game2"));
document
  .getElementById("game3-button")
  .addEventListener("click", () => showGame("game3"));

  function showGame(gameId, questionsId) {
    // hide menu
    document.getElementById("menu").style.display = "none";
    // show game content
    document.getElementById(gameId).style.display = "block";
    // show game actions
    document.getElementById("game-actions").style.display = "block";
  
    // initialize game with the right questions
    const questions = convertULToQuestionsArray(questionsId);
    console.log(questions);
  
    initGame(questions);
    
    //definir les caracteres autorisees de l'input:
    // Define the allowed characters of the input:

    //console.log(gameId);
    if (gameId === "game1-content") {
      // If "game1" is active, set the pattern of "user-answer" to only allow a single digit
      document.getElementById("user-answer").pattern = "[0-9]";
    } else {
      // If "game1" is not active, remove the pattern from "user-answer"
      document.getElementById("user-answer").removeAttribute('pattern');
    }

    

    // on prend le div qui contient le titre du jeu, et on le met comme child du div du quiz:
    var gameActions = document.getElementById("game-actions");
    var firstChild = gameActions.firstChild;
    var gameContent = document.getElementById(gameId);
    gameActions.insertBefore(gameContent, firstChild)
  
    // Pour le bouton help:
    const helpContent = document.getElementById(gameId).querySelector(".information").cloneNode(true);
    helpContent.style.display = "none"; // Cacher le contenu d'aide par défaut
  
    // Stocker une référence au titre du quiz
    const titleNode = gameContent.querySelector("h2");
  
    // Gérer l'affichage/masquage du contenu d'aide lors du clic sur le bouton "Besoin d'aide ?"
    const helpButton = document.getElementById('help-button');
    let isHelpVisible = false; // Variable pour suivre l'état de l'affichage du contenu d'aide
  
    helpButton.addEventListener("click", () => {
      isHelpVisible = !isHelpVisible; // Inverser l'état de l'affichage du contenu d'aide
  
      if (isHelpVisible) {
        helpContent.style.display = "block"; // Afficher le contenu d'aide
        helpButton.textContent = "Masquer l'aide"; // Changer le texte du bouton
        document.getElementById("game-actions").appendChild(helpContent); // Ajouter le contenu d'aide à la fin des actions du jeu
      } else {
        helpContent.style.display = "none"; // Masquer le contenu d'aide
        helpButton.textContent = "Besoin d'aide ?"; // Restaurer le texte du bouton
        gameContent.insertBefore(titleNode, gameContent.firstChild); // Réinsérer le titre du quiz à sa place d'origine
        document.getElementById("game-actions").removeChild(helpContent); // Retirer le contenu d'aide des actions du jeu
      }
    });
  }
  

document
  .getElementById("game1-button")
  .addEventListener("click", () =>
    showGame("game1-content", "game1-questions")
  );
document
  .getElementById("game2-button")
  .addEventListener("click", () =>
    showGame("game2-content", "game2-questions")
  );
document
  .getElementById("game3-button")
  .addEventListener("click", () =>
    showGame("game3-content", "game3-questions")
  );

function initGame(questions) {
  let score = 0;
  let timerInterval;
  let currentQuestionIndex = 0;
  const timeLimit = 30;

  function generateQuestion() {
    currentQuestionIndex = Math.floor(Math.random() * questions.length);
    document.getElementById("tonality-question").textContent =
      questions[currentQuestionIndex].query;
    document.getElementById("user-answer").value = "";

    timerInterval = resetTimer(
      document.getElementById("time-left"),
      timerInterval,
      timeLimit,
      onTimerEnd
    );
  }

  function onTimerEnd() {
    const correctAnswer = questions[currentQuestionIndex].answer;
    showResult(
      document.getElementById("result"),
      false,
      true,
      correctAnswer,
      document.getElementById("replay")
    );
  }

  let lastAnswerWasWrong = false;

document.getElementById("alteration-form").addEventListener("submit", (e) => {
  e.preventDefault();

  // Disable the submit button
  document.getElementById("submit-button").disabled = true;

  clearInterval(timerInterval);
  const userAnswer = document.getElementById("user-answer").value;
  const correctAnswer = questions[currentQuestionIndex].answer;

  if (
    userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
  ) {
    score++;
    lastAnswerWasWrong = false;
    showResult(
      document.getElementById("result"),
      true,
      false,
      correctAnswer,
      document.getElementById("replay"),
      () => {
        document.getElementById("score").textContent = `Score: ${score}`;
      }
    );
  } else {
    lastAnswerWasWrong = true;
    showResult(
      document.getElementById("result"),
      false,
      false,
      correctAnswer,
      document.getElementById("replay"),
      () => {}
    );
  }

  document.getElementById("score").textContent = `Score: ${score}`;
});

document.getElementById("replay").addEventListener("click", () => {
  document.getElementById("result").textContent = "";
  generateQuestion();
  timerInterval = resetTimer(
    document.getElementById("time-left"),
    timerInterval,
    timeLimit,
    onTimerEnd
  );
  
  //reset le score a 0 si le temps etait ecoule:
  if(tempsEcoule) {
    document.getElementById("score").textContent = `Score: ${0}`;
    tempsEcoule = false;
  }
  

  // Enable the submit button
  document.getElementById("submit-button").disabled = false;

  // Reset the score if the last answer was wrong
  if (lastAnswerWasWrong) {
    score = 0;
    document.getElementById("score").textContent = `Score: ${score}`;
  }
});

  generateQuestion();

  timerInterval = resetTimer(
    document.getElementById("time-left"),
    timerInterval,
    timeLimit,
    onTimerEnd
  );
}

function resetTimer(timerElement, timerInterval, initialTime, onTimeOut) {
  clearInterval(timerInterval);
  let timeLeft = initialTime;
  timerElement.textContent = timeLeft;
  return setInterval(() => {
    if (timeLeft > -1) {
      timerElement.textContent = timeLeft;
      timeLeft -= 1;
    } else {
      clearInterval(timerInterval);
      onTimeOut();
    }
  }, 1000);
}

function showResult(
  resultElement,
  isCorrect,
  isTimeEnd,
  correctAnswer,
  replayButton,
  updateScore
) {
  const resultText = isCorrect
    ? "Bonne réponse!"
    : `Incorrect. La bonne réponse était ${correctAnswer}.`;
  const timerEndText = `Temps écoulé! La bonne réponse était ${correctAnswer}.`;

  if(!isCorrect) {
    tempsEcoule = true;
  }

  //rendre le submit disabled:
  document.getElementById("submit-button").disabled = true;

  resultElement.textContent = resultText;
  replayButton.style.display = "block";
  if (isCorrect) {
    updateScore();
  }
  if (isTimeEnd) {
    resultElement.textContent = timerEndText;
  }
}

function convertULToQuestionsArray(ulElementId) {
  // Create a virtual DOM element to parse the HTML string
  const ulElement = document.getElementById(ulElementId);
  if (!ulElement) {
    console.error("UL element not found");
    return [];
  }

  // Map over each list item to extract the question and answer
  const questions = Array.from(ulElement.querySelectorAll("li")).map((li) => {
    const fullText = li.textContent.trim().replace("\n", "").replace(":", "?");
    const answer = li.querySelector("b")
      ? li.querySelector("b").textContent.trim()
      : "";

    // Remove the answer part from the full text to get the question
    const query = fullText.replace(answer, "").trim();

    // Return the question object
    return { query, answer };
  });

  return questions;
}