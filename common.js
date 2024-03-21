document.addEventListener("DOMContentLoaded", () => {
  // si JS est actif:

  //on cache les 3 jeux
  document.getElementById("game1-content").style = "display: none;";
  document.getElementById("game2-content").style = "display: none;";
  document.getElementById("game3-content").style = "display: none;";
  //on cache le quiz et ses boutons
  console.log(document.getElementById("game-actions"))


  
  document.getElementById("game-actions").style = "display: none;";


  //on cache les connaissances pck JS est actif
  const games = document.querySelectorAll(".information");
  games.forEach((game) => {
    game.style.display = "none";
  });

  //on active le bouton "soumettre reponse" qui etait disabled
  document.getElementById("submit-button").disabled = false;

  //rendre les boutons besoin d'aide + retour a l'accueil visibles:
  document.getElementById("help-button").style.display = "block";
  document.getElementById("back-button").style.display = "inline";
});

//pour la barre de navigation:
function afficherAccueil() {
  document.querySelector(".principal").style.display = "block";
  document.querySelector(".about").style.display = "none";
}

function afficherAbout() {
  document.querySelector(".principal").style.display = "none";
  document.querySelector(".about").style.display = "flex";
}

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
  // cacher le menu
  document.getElementById("menu").style.display = "none";
  document.getElementById("introduction").style.display = "none";

  // afficher le quiz
  document.getElementById(gameId).style.display = "block";
  // afficher les boutons
  document.getElementById("game-actions").style.display = "block";

  // convertir la data sur les jeux dans le html a des questions:
  const questions = convertULToQuestionsArray(questionsId);

  //console.log(questions);

  //commencer une partie
  initGame(questions);

  //definir les caracteres autorisees de l'input:
  //console.log(gameId);
  if (gameId === "game1-content") {
    // si c'est game1, alors le jeu ne doit accepter que des chiffres
    document.getElementById("user-answer").pattern = "[0-9]";
  } else {
    // sinon on enleve le pattern de l'input
    document.getElementById("user-answer").removeAttribute("pattern");
  }

  // on prend le div qui contient le titre du jeu, et on le met comme child du div du quiz:
  var gameActions = document.getElementById("game-actions");
  var firstChild = gameActions.firstChild;
  var gameContent = document.getElementById(gameId);
  gameActions.insertBefore(gameContent, firstChild);

  // pour le bouton besoin d'aide :
  const helpContent = document
    .getElementById(gameId)
    .querySelector(".information")
    .cloneNode(true);
  helpContent.style.display = "none"; // Cacher le contenu d'aide par défaut

  // stocker une ref au titre du quiz
  const titleNode = gameContent.querySelector("h2");

  // gere l'affichage/masquage du div lorsqu'on clique sur `Besoin d'aide`
  const helpButton = document.getElementById("help-button");
  let isHelpVisible = false;

  helpButton.addEventListener("click", () => {
    isHelpVisible = !isHelpVisible;

    //si on veut afficher l'aide:
    if (isHelpVisible) {
      helpContent.style.display = "block";
      helpButton.textContent = "Masquer l'aide";
      document.getElementById("game-actions").appendChild(helpContent);
    }
    //si on veut la cacher:
    else {
      helpContent.style.display = "none";
      helpButton.textContent = "Besoin d'aide ?";
      gameContent.insertBefore(titleNode, gameContent.firstChild);
      document.getElementById("game-actions").removeChild(helpContent);
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

//demarre une partie, init ce qui est necessaire:
function initGame(questions) {
  let score = 0;
  let timerInterval;
  let currentQuestionIndex = 0;
  const timeLimit = 30;

  //genere une question aleatoire a partir du html et selon le jeu
  function generateQuestion() {
    currentQuestionIndex = Math.floor(Math.random() * questions.length);
    document.getElementById("tonality-question").textContent =
      "Question: " + questions[currentQuestionIndex].query;
    document.getElementById("user-answer").value = "";

    timerInterval = resetTimer(
      document.getElementById("time-left"),
      timerInterval,
      timeLimit,
      onTimerEnd
    );
  }

  //gere ce qui se passe quand le timer finit
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

    //si l'user tape la bonne reponse:
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
    }
    //si l'user tape une mauvaise reponse:
    else {
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

  //gere ce qui se passe quand on appuie sur Replay:
  //rejouer permet de passer a la prochaine question:
  document.getElementById("replay").addEventListener("click", () => {
    //remet une nouvelle question:
    document.getElementById("result").textContent = "";
    generateQuestion();
    timerInterval = resetTimer(
      document.getElementById("time-left"),
      timerInterval,
      timeLimit,
      onTimerEnd
    );

    //reset le score a 0 si le temps etait ecoule:
    if (tempsEcoule) {
      document.getElementById("score").textContent = `Score: ${0}`;
      tempsEcoule = false;
    }

    //activer le bouton soumettre reponse
    document.getElementById("submit-button").disabled = false;

    //on reset le score si la derniere reponse etait fausse:
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

//fonction permet de reset le timer selon le parametre timerInterval
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

//affiche le resultat du score dans son element correspondant
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

  if (!isCorrect) {
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

//cette fonction prend la data dans laquelle est stockee les infos sur le jeu,
//puis les convertit en array:
function convertULToQuestionsArray(ulElementId) {
  // on recupere la data
  const tbodyElement = document.getElementById(ulElementId);
  if (!tbodyElement) {
    console.error("UL element not found");
    return [];
  }

  // puis on map chaque question a sa reponse
  const questions = Array.from(tbodyElement.querySelectorAll("tr")).map(
    (tr) => {
      const fullText = tr.querySelectorAll("td")[0].textContent.trim();
      const answer = tr.querySelectorAll("td")[1].textContent.trim() || "";

      // on remove la reponse
      const query = fullText.replace(answer, "").trim();

      // puis on retourne tout ca
      return { query, answer };
    }
  );

  return questions;
}
