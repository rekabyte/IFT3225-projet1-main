const nom_jeu_span = document.querySelector('.nom-jeu span');
const nom_jeu = document.querySelector('.nom-jeu');
const up_arrow = document.querySelector('.upArrow');
const div_connaissances = document.querySelector('.div-conaissances');
const aide_button = document.querySelector('.button-aide');
const score_span = document.querySelector('.span-score');
const input = document.querySelector('#soumettre');
const div_contenu = document.querySelector('.div-quiz-contenu');
const div_bonneReponse = document.querySelector('.bonne-reponse');
const div_mauvaiseReponse = document.querySelector('.mauvaise-reponse');
const commencer_button = document.querySelector('button[onclick="startGame()"]');
const formulaire = document.querySelector('.formulaire');
const formulaire_radio = document.querySelector('.form-radio');
let score;

let choosenGameId;
let questionsReponses;
let randomReponses;
let randomQuestion;
let reponse;
let timerId;


const tempsCompteur = 15; //en secondes
const noms_jeux = {
  'game1': "Jeu des Alterations",
  'game2': "Jeu de Reconnaissance de Tonalité",
  'game3': "Jeu des Relations Tonales"
};

// si JS est actif:
document.addEventListener("DOMContentLoaded", () => {

  // si JS est actif:
  nom_jeu_span.textContent = "(Choisissez un jeu)";

  //rotate la fleche dans le bouton besoin d'aide:
  up_arrow.style.transform = 'rotate(0deg)';

  //on desactive le bouton commencer
  commencer_button.setAttribute('disabled', '');

  //on cache les connaissances:
  document.querySelector('.aChanger').setAttribute("class", "collapse");

});

//pour la barre de navigation:
function afficherAccueil() {
  document.querySelector('.principal').style.display = 'block';
  document.querySelector('.about').style.display = 'none';
}

function afficherAbout() {
  document.querySelector('.principal').style.display = 'none';
  document.querySelector('.about').style.display = 'flex';
}

//cette fonction change la direction de l'arrow 
// a chaque fois qu'on clique sur le bouton besoin d'aide
let toggled = true;
function changeArrowDirection() {
  if(toggled == false) {
    toggled = !toggled;
    up_arrow.style.transform = 'rotate(0deg)';
  }
  else {
    toggled = !toggled;
    up_arrow.style.transform = 'rotate(180deg)';
  }
}

//update le jeu choisi et setup le quiz:
function chooseGame(gameId) {
  choosenGameId = gameId;
  nom_jeu.textContent = noms_jeux[choosenGameId];
  
  //on rend le bouton Commencer accessible:
  commencer_button.removeAttribute("disabled");

  //on remove l'attr active de tout les boutons et on les disables tous:
  for(let key in noms_jeux) {
    let bouton = document.querySelector(`button[onclick="chooseGame(\'${key}\')"]`);
    bouton.removeAttribute('active');
  }

  //on set le bouton qui a declenché l'event comme etant active
  let button = document.querySelector(`button[onclick="chooseGame(\'${choosenGameId}\')"]`);
  button.setAttribute('active', '');
  button.removeAttribute('disabled');

  //on affiche le bon formulaire:
  if(gameId != 'game1') {
    formulaire.style.display = 'none';
    formulaire_radio.style.display = 'block';
  }
  //si c'est un autre jeu on met le formulaire radio:
  else {
    formulaire.style.display = 'block';
    formulaire_radio.style.display = 'none';
  }

}

//Convertit la data html du jeu selectionnee (choosenGameId)
// en dictionnaire (questionsReponses)
function generateQuestions() {
  //console.log(`generation pour .${choosenGameId}-game table tbody ...`);
  let game_tbody = document.querySelector(`.${choosenGameId}-game table tbody`);
  questionsReponses = {};

  game_tbody.querySelectorAll('tr').forEach(row => {
    let columns = row.querySelectorAll('td');
    let key = columns[0].textContent.trim();
    let value = columns[1].textContent.trim();

    //verifier si le td contient la classe "empty-row"
    if (!columns[1].classList.contains('empty-row')) {
      questionsReponses[key] = value;
    }
  });

  //for (let key in questionsReponses) {
  //  console.log(`${key}: ${questionsReponses[key]}`);
  //}
  
}

//Cette fonction commence une partie:
function startGame() {

  //on show le bon div:
  div_contenu.style.display = "block";
  div_bonneReponse.style.display = "none";
  div_mauvaiseReponse.style.display = "none";

  //On disable le bouton Commencer et change sont content:
  commencer_button.setAttribute('disabled', '');
  commencer_button.textContent = "PARTIE EN COURS...";

  //on disable le bouton de changement de jeux:
  let bouton_choisi = document.querySelector(`button[onclick="chooseGame(\'${choosenGameId}\')"]`);
  bouton_choisi.setAttribute("disabled", '');
  bouton_choisi.style.backgroundColor = "rgb(72, 18, 18)";

  //on disable les autres boutons
  for(let key in noms_jeux) {
    let bouton = document.querySelector(`button[onclick="chooseGame(\'${key}\')"]`);
    bouton.setAttribute("disabled", '');
  }

  //verifier si un type de jeu a ete choisi:
  if(choosenGameId != null) {
    //console.log("Debut de game...");

    score = 0;
    score_span.textContent = "0";

    //on enleve les palceholders:
    let placeholders = document.querySelectorAll('span[class*="placeholder"]');
    placeholders.forEach(node => {
      node.style.display = "none";
    });

    //choisir une question/reponse aleatoirement du dictionnaire:
    // Supposons que votre dictionnaire s'appelle 'questionsReponses'

    generateQuestions();

    let questions = Object.keys(questionsReponses);
    let randomIndex = Math.floor(Math.random() * questions.length);
    randomQuestion = questions[randomIndex];
    reponse = questionsReponses[randomQuestion];

    //mettre la question choisi dans le span:
    let span_question = document.querySelector('.question');
    span_question.textContent = randomQuestion + " ?";

    //on demarre le compteur:
    timerId = startTimer();

    //console.log(`Cle aleatoire : ${randomQuestion}`);
    //console.log(`Valeur aleatoire : ${reponse}`);

    //si le jeu est un jeu de type radio
    if(choosenGameId != 'game1') {
      generateRandomReponses();

      // choisir un index aleatoire pour la bonne reponse
      let correctAnswerIndex = Math.floor(Math.random() * randomReponses.length);

      // inserer la bonne reponses parmis les4 autres mauvaises reponses
      randomReponses.splice(correctAnswerIndex, 0, reponse);

      //selectionner les 5 labels 
      let radioLabels = document.querySelectorAll('.form-radio div label');

      //puis on remplis chaque label avec une reponse aleatoire
      radioLabels.forEach((label, index) => {
          label.textContent = randomReponses[index];
      });

      //console.log("reponses aleatoires selectionnees :", randomReponses);

    }
  }
}

//confirme si la reponse est bonne ou pas
// et agit en consequence
async function validerReponse() {

  //Si le jeu choisi est game1:
  if(choosenGameId == 'game1') {

    //si bonne reponse:
    if(input.value == reponse) {

      //on stoppe l'ancien compteur:
      stopTimer();

      //ajouter 1 point au score
      let score2 = parseInt(score_span.textContent);
      score2++;
      score = score2;
      score_span.textContent = score2;

      //on remove cette question du dictionnaire:
      delete questionsReponses[randomQuestion];

      //on reinitialize l'input (decocher toutes les radios):
      let radioButtons = document.querySelectorAll('.form-radio input[type="radio"]');
      radioButtons.forEach(radioButton => {
          radioButton.checked = false;
      });

      //afficher le div de bonne reponse:
      div_contenu.style.display = "none";
      div_bonneReponse.style.display = "flex";
      await wait(1);
      div_contenu.style.display = "block";
      div_bonneReponse.style.display = "none";

      //on passe a next question:
      let questions = Object.keys(questionsReponses);
      let randomIndex = Math.floor(Math.random() * questions.length);
      randomQuestion = questions[randomIndex];
      reponse = questionsReponses[randomQuestion];

      //mettre la question choisi dans le span:
      let span_question = document.querySelector('.question');
      span_question.textContent = randomQuestion;

      //on demarre le compteur:
      startTimer();

    }

    //si mauvaise reponse:
    else {
      //console.log("mauvaise reponse");
      //console.log(`Attendu: ${reponse}, Recu; ${input.textContent}`)
      stopTimer(timerId);
      showLostScreen();
    }
    

  }

  //si le jeu choisi est de type radio:
  else {
    const radios = document.querySelectorAll('input[type="radio"]:checked');
    //reponse choisie:
    const labelText = radios[0].nextElementSibling.textContent;

    //si bonne reponse
    if(labelText == reponse) {
      //on stoppe l'ancien compteur:
      stopTimer(timerId);

      //ajouter 1 point au score
      let score2 = parseInt(score_span.textContent);
      score2++;
      score = score2;
      score_span.textContent = score2;

      //on remove cette question du dictionnaire:
      delete questionsReponses[randomQuestion];

      //on reinitialize l'input:
      input.value = '';

      //afficher le div de bonne reponse:
      div_contenu.style.display = "none";
      div_bonneReponse.style.display = "flex";
      await wait(1);
      div_contenu.style.display = "block";
      div_bonneReponse.style.display = "none";

      //on passe a next question:
      generateRandomReponses();
      //on passe a next question:
      let questions = Object.keys(questionsReponses);
      let randomIndex = Math.floor(Math.random() * questions.length);
      randomQuestion = questions[randomIndex];
      reponse = questionsReponses[randomQuestion];


      // choisir un index aleatoire pour la bonne reponse
      let correctAnswerIndex = Math.floor(Math.random() * randomReponses.length);

      // inserer la bonne reponses parmis les4 autres mauvaises reponses
      randomReponses.splice(correctAnswerIndex, 0, reponse);

      //selectionner les 5 labels 
      let radioLabels = document.querySelectorAll('.form-radio div label');

      //puis on remplis chaque label avec une reponse aleatoire
      radioLabels.forEach((label, index) => {
          label.textContent = randomReponses[index];
      });

      
      //mettre la question choisi dans le span:
      let span_question = document.querySelector('.question');
      span_question.textContent = randomQuestion;

      //on demarre le compteur:
      timerId = startTimer();
    }

    //si mauvaise reponse
    else {
      //console.log("mauvaise reponse");
      //console.log(`Attendu: ${reponse}, Recu; ${input.textContent}`)
      stopTimer(timerId);
      showLostScreen();
    }


    //console.log("texte du label associee au bouton radio selectionnee :", labelText);
  }

  

}

function showLostScreen() {
  div_contenu.style.display = "none";
  div_mauvaiseReponse.style.display = "block";

  //on reactive bouton commencer:
  commencer_button.textContent = "COMMENCER !";
  commencer_button.removeAttribute("disabled");

  //on remet la couleur d'origine au bouton choisi:
  document.querySelector(`button[onclick="chooseGame(\'${choosenGameId}\')"]`).style.backgroundColor = '';

  //on reactive les boutons de jeux:
  for(let key in noms_jeux) {
    let bouton = document.querySelector(`button[onclick="chooseGame(\'${key}\')"]`);
    bouton.removeAttribute('disabled');
  }

  document.querySelector('.mauvaise-reponse p:nth-child(2)').textContent = `Score: ${score}`;
}

//demarre le timer
function startTimer() {
  //interval de maj de la progression
  const updateInterval = 100; // 10 fois par secondes

  const progressBar = document.querySelector('.progress-bar');
  const startTime = Date.now();

  //convertir tempsCompteur en ms:
  const totalMilliseconds = tempsCompteur * 1000;

  //fct qui met a jour la barre de progression
  function updateProgressBar() {

    const tempsEcoule = Date.now() - startTime;

    //pourcentage progression:
    let progressPercentage = (tempsEcoule / totalMilliseconds) * 100;

    //calcul couleur en fct du pourcentage:
    let color;
    if (progressPercentage <= 50) {
      //de vert a jaune (0% a 50%)
      color = `rgb(${255 * progressPercentage / 50}, 255, 0)`;
    } else {
      //de jaune a rouge (50% a 100%)
      color = `rgb(255, ${255 - (255 * (progressPercentage - 50) / 50)}, 0)`;
    }

    //changer la couleur de la barre
    progressBar.style.backgroundColor = color;

    //met a jour la progression dans la barre
    let width = 100 - progressPercentage;
    progressBar.style.width = `${width}%`;

    //verifier si le temps s'est fini:
    if (tempsEcoule >= totalMilliseconds) {
      clearInterval(progressInterval);
      //console.log("Temps écoulé!");
      showLostScreen();
    }
  }

  //appel initial: met a jour la barre de progression
  updateProgressBar();

  //met a jour la barre de progression chaque 10ms
  const progressInterval = setInterval(updateProgressBar, updateInterval);

  //on retourne le timerId
  //sert a arrete le timer quand on veut
  return progressInterval;
}

//arrete le timer
function stopTimer() {
  setTimeout(() => {
    clearInterval(timerId);
  }, 100);
}

//fonction qui genere 4 reponses aleatoires et differentes
function generateRandomReponses() {
  randomReponses = [];
  let keys = Object.keys(questionsReponses);

  //selectionne 4 reponses aleatoires et differentes
  while (randomReponses.length < 4) {
      //selectionne d'abord une cle du dictionnaire aleatoirement
      let randomKey = keys[Math.floor(Math.random() * keys.length)];

      //on verifie si la cle n'a pas deja ete tiree precedemment
      if (!randomReponses.includes(questionsReponses[randomKey])) {
          //on l'ajoute
          randomReponses.push(questionsReponses[randomKey]);
      }
  }

  //console.log("reponses aleatoires selectionnees :", randomReponses);
}

// Ces fonctions auxiliaires proviennent de StackOverflow:

//Fonction pour interpoler une couleur entre deux couleurs en fonction d'un pourcentage
//utilisee pour la barre de progression de temps pour passer de vert a rouge a jaune
function interpolateColor(color1, color2, percent) {
  const hex = (color) => parseInt(color.substring(1), 16);
  const r = Math.round(hex(color1) * (1 - percent) + hex(color2) * percent);
  const g = Math.round(hex(color1.substr(2)) * (1 - percent) + hex(color2.substr(2)) * percent);
  const b = Math.round(hex(color1.substr(4)) * (1 - percent) + hex(color2.substr(4)) * percent);
  return `rgb(${r},${g},${b})`;
}

//une fonction wait classique
function wait(seconds) {
  return new Promise(resolve => {
      setTimeout(resolve, seconds * 1000);
  });
}

