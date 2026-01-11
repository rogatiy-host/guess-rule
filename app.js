// ====== DATA ======
const CHAR = {
  chase:  { ru:"Чейз",  arc:"Тёмное рождество", img:"img/chase.png" },
  bobby:  { ru:"Бобби", arc:"Тёмное рождество", img:"img/bobby.png" },
  erick:  { ru:"Эрик",  arc:"Пустые",          img:"img/erick.png" },
  cassy:  { ru:"Кэсси", arc:"Тёмное рождество", img:"img/cassy.png" },
  mike:   { ru:"Майк",  arc:"Пустые",          img:"img/mike.png" },

  brendan:{ ru:"Брендан", arc:"Тёмное рождество", img:"img/brendan.png" },
  chac:   { ru:"Чак",     arc:"Закрытая школа",   img:"img/chac.png" },
  jake:   { ru:"Джейк",   arc:"Пустые",           img:"img/jake.png" },
  elly:   { ru:"Элли",    arc:"Тёмное рождество", img:"img/elly.png" },
  sean:   { ru:"Шон",     arc:"Пустые",           img:"img/sean.png" },

  may:    { ru:"Мэй",     arc:"Улыбающиеся",      img:"img/may.png" },
  ben:    { ru:"Бен",     arc:"Тёмное рождество", img:"img/ben.png" },
  nate:   { ru:"Нейт",    arc:"Дом за лесом",     img:"img/nate.png" },
  sara:   { ru:"Сара",    arc:"Тёмное рождество", img:"img/sara.png" },
  stacy:  { ru:"Стейси",  arc:"Тёмное рождество", img:"img/stacy.png" },

  jhonny: { ru:"Джони",   arc:"Улыбающиеся",      img:"img/jhonny.png" },
  kit:    { ru:"Кит",     arc:"Улыбающиеся",      img:"img/kit.png" },
  cevin:  { ru:"Кевин",   arc:"Улыбающиеся",      img:"img/cevin.png" },
  rubi:   { ru:"Руби",    arc:"Дом за лесом",     img:"img/rubi.png" },
  blane:  { ru:"Блейн",   arc:"Тёмное рождество", img:"img/blane.png" },

  banny:  { ru:"Бенни",   arc:"Улыбающиеся",      img:"img/banny.png" },
  sophy:  { ru:"Софи",    arc:"Улыбающиеся",      img:"img/sophy.png" },
  kira:   { ru:"Кира",    arc:"Закрытая школа",   img:"img/kira.png" },
  nick:   { ru:"Ник",     arc:"Улыбающиеся",      img:"img/nick.png" },
  mason:  { ru:"Мейсон",  arc:"Закрытая школа",   img:"img/mason.png" },
};

// ЛЁГКИЙ: 3 раунда, верные = Bobby, Brendan, Ben. Итоговое правило: "Персонажи с именем на Б"
const EASY = {
  modeName: "Лёгкий",
  rounds: [
    { correctId:"bobby", options:["chase","bobby","erick","cassy","mike"] },
    { correctId:"brendan", options:["brendan","chac","jake","elly","sean"] },
    { correctId:"ben", options:["may","ben","nate","sara","stacy"] },
  ],
  resultTitle: "Результат",
  ruleText: 'Правило: "Персонажи с именем на Б"',
};

// СЛОЖНЫЙ: 3 раунда, верные = May, Banny, Nick. Итоговое правило: "Первые, кто ушел из Дархэма"
const HARD = {
  modeName: "Сложный",
  rounds: [
    { correctId:"may", options:["jhonny","kit","cevin","sara","may"] },
    { correctId:"banny", options:["nate","rubi","banny","bobby","blane"] },
    { correctId:"nick", options:["sophy","sean","nick","kira","mason"] },
  ],
  resultTitle: "Конец",
  ruleText: 'Результат: "Первые, кто ушел из Дархэма"',
};

// ====== UI ======
const $ = (id) => document.getElementById(id);

const screenLanding = $("screenLanding");
const screenGame = $("screenGame");
const screenResult = $("screenResult");

const startEasy = $("startEasy");
const startHard = $("startHard");

const btnHome = $("btnHome");
const btnQuit = $("btnQuit");
const btnNext = $("btnNext");
const btnReplay = $("btnReplay");
const btnBackHome = $("btnBackHome");

const btnResetBest = $("btnResetBest");

const modeBadge = $("modeBadge");
const roundTitle = $("roundTitle");
const roundHint = $("roundHint");
const cardsGrid = $("cardsGrid");
const scoreEl = $("score");
const progressBar = $("progressBar");

const resultMode = $("resultMode");
const resultTitle = $("resultTitle");
const resultRule = $("resultRule");
const finalScore = $("finalScore");
const finalCorrect = $("finalCorrect");

const bestScoreEl = $("bestScore");

const BEST_KEY = "guess_rule_best_score_v1";

// ====== STATE ======
let game = null;
// game = { pack, roundIndex, score, correctCount, pickedId, locked }

// ====== HELPERS ======
function showScreen(which){
  [screenLanding, screenGame, screenResult].forEach(s => s.classList.remove("screen-active"));
  which.classList.add("screen-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getBestScore(){
  const v = localStorage.getItem(BEST_KEY);
  return v ? Number(v) : null;
}

function setBestScore(v){
  localStorage.setItem(BEST_KEY, String(v));
}

function renderBestScore(){
  const v = getBestScore();
  bestScoreEl.textContent = (v === null || Number.isNaN(v)) ? "—" : `${v} очков`;
}

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

function calcProgress(){
  const total = game.pack.rounds.length;
  const done = game.roundIndex; // completed rounds
  return clamp((done / total) * 100, 0, 100);
}

function updateProgress(){
  progressBar.style.width = `${calcProgress()}%`;
}

function safeChar(id){
  const c = CHAR[id];
  if(!c) return { ru:id, arc:"", img:"" };
  return c;
}

function cardTemplate(id, idx){
  const c = safeChar(id);
  const label = `${idx+1}`;
  return `
    <div class="card" data-id="${id}" role="button" tabindex="0" aria-label="Выбрать: ${c.ru}">
      <div class="badge">${label}</div>
      <img class="card-img" src="${c.img}" alt="${c.ru}" loading="lazy" />
      <div class="card-info">
        <div class="card-name">${c.ru}</div>
        <div class="card-meta">${c.arc}</div>
      </div>
    </div>
  `;
}

function lockRoundUI(locked){
  btnNext.disabled = !locked;
}

function setHint(text){
  roundHint.textContent = text;
}

function updateHeader(){
  modeBadge.textContent = `Режим: ${game.pack.modeName}`;
  roundTitle.textContent = `Раунд ${game.roundIndex + 1} из ${game.pack.rounds.length}`;
  scoreEl.textContent = String(game.score);
}

function renderRound(){
  const round = game.pack.rounds[game.roundIndex];
  cardsGrid.innerHTML = round.options.map((id, i) => cardTemplate(id, i)).join("");
  lockRoundUI(false);
  setHint("Выбери одного персонажа");
  updateHeader();
  updateProgress();
  attachCardHandlers();
}

function attachCardHandlers(){
  const cards = Array.from(cardsGrid.querySelectorAll(".card"));
  cards.forEach(card => {
    const onPick = () => pick(card.dataset.id);
    card.addEventListener("click", onPick);
    card.addEventListener("keydown", (e) => {
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        onPick();
      }
    });
  });
}

function pick(id){
  if(game.locked) return;

  const round = game.pack.rounds[game.roundIndex];
  game.pickedId = id;
  game.locked = true;

  const isCorrect = (id === round.correctId);

  // Система очков (можно поменять):
  // +10 за правильный, +0 за неправильный
  if(isCorrect){
    game.score += 10;
    game.correctCount += 1;
    setHint("Верно ✅");
  } else {
    setHint("Неверно ❌");
  }

  // Подсветка карточек
  const cards = Array.from(cardsGrid.querySelectorAll(".card"));
  cards.forEach(c => {
    const cid = c.dataset.id;
    c.classList.remove("selected","correct","wrong");
    if(cid === id) c.classList.add("selected");
    if(cid === round.correctId) c.classList.add("correct");
    if(cid === id && !isCorrect) c.classList.add("wrong");
  });

  scoreEl.textContent = String(game.score);
  lockRoundUI(true);
}

function next(){
  if(!game.locked) return;

  game.roundIndex += 1;
  game.pickedId = null;
  game.locked = false;

  if(game.roundIndex >= game.pack.rounds.length){
    finish();
  } else {
    renderRound();
  }
}

function finish(){
  // Прогресс 100%
  progressBar.style.width = `100%`;

  resultMode.textContent = `Режим: ${game.pack.modeName}`;
  resultTitle.textContent = game.pack.resultTitle;
  resultRule.textContent = game.pack.ruleText;
  finalScore.textContent = String(game.score);
  finalCorrect.textContent = `${game.correctCount} / ${game.pack.rounds.length}`;

  // best score
  const best = getBestScore();
  if(best === null || game.score > best){
    setBestScore(game.score);
  }
  renderBestScore();

  showScreen(screenResult);
}

function start(pack){
  game = {
    pack,
    roundIndex: 0,
    score: 0,
    correctCount: 0,
    pickedId: null,
    locked: false,
  };
  showScreen(screenGame);
  renderRound();
}

function goHome(){
  game = null;
  renderBestScore();
  showScreen(screenLanding);
}

// ====== EVENTS ======
startEasy.addEventListener("click", () => start(EASY));
startHard.addEventListener("click", () => start(HARD));

btnNext.addEventListener("click", next);

btnQuit.addEventListener("click", goHome);
btnHome.addEventListener("click", goHome);
btnBackHome.addEventListener("click", goHome);

btnReplay.addEventListener("click", () => {
  if(!game) return goHome();
  start(game.pack);
});

btnResetBest.addEventListener("click", () => {
  localStorage.removeItem(BEST_KEY);
  renderBestScore();
});

// Init
renderBestScore();
showScreen(screenLanding);