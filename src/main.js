let filmFiltratiGlobali = [];
let paginaCorrente = 0;
const FILM_PER_PAGINA = 3;

const API_KEY = "de0dba6b0b5ddfeb9b66853ceff7489c";
const BASE_URL = "https://api.themoviedb.org/3";

const generiTMDB = {
  azione: 28,
  commedia: 35,
  drammatico: 18,
  fantascienza: 878,
  romantico: 10749,
  thriller: 53,
  horror: 27,
  animazione: 16,
  fantasy: 14
};

// Carica i film da TMDB in base al genere
function caricaFilmDaAPI(genere) {
  const genereId = generiTMDB[genere];

  return fetch(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=it-IT&with_genres=${genereId}&sort_by=vote_average.desc&vote_count.gte=50`
  )
    .then(res => res.json())
    .then(data => data.results);
}

// Assegna il mood a un film
function assegnaMood(film) {
  const generi = film.genre_ids;
  const voto = film.vote_average;

  // ADRENALINICO
  if (generi.includes(28) || generi.includes(27) || generi.includes(53)) {
    return "adrenalinico";
  }

  // FELICE
  if (generi.includes(35) || generi.includes(16) || generi.includes(10751)) {
    return "felice";
  }

  // TRISTE
  if (generi.includes(18) || generi.includes(10749)) {
    return voto >= 7.5 ? "triste" : "rilassato";
  }

  // RILASSATO
  if (generi.includes(878) || generi.includes(14)) {
    return "rilassato";
  }

  return "rilassato"; // fallback
}

// Normalizza un film in formato usabile dall'app
function normalizzaFilm(f) {
  return {
    nome: f.title,
    anno: f.release_date?.split("-")[0] || "Sconosciuto",
    valutazione: f.vote_average,
    genere: document.getElementById("genere").value,
    mood: assegnaMood(f)
  };
}

// Mostra una pagina di film filtrati
function mostraPagina(risultato) {
  const start = paginaCorrente * FILM_PER_PAGINA; // Indice di inizio
  const end = start + FILM_PER_PAGINA;        // Indice di fine
  const pagina = filmFiltratiGlobali.slice(start, end); // Film da mostrare (end non incluso)

  risultato.innerHTML = `<h2>🎬 Consigliati per te</h2>`;

  pagina.forEach(film => {
    risultato.innerHTML += `
      <p><strong>- ${film.nome}</strong></p>
      <p>Anno: ${film.anno}</p>
      <p>Genere: ${film.genere}</p>
      <p>⭐ Valutazione: ${film.valutazione}</p>
      <br/>
    `;
  });

  risultato.innerHTML += `
    <button class="inner" onclick="paginaPrecedente()" ${paginaCorrente === 0 ? "disabled" : ""}>⬅ Precedente</button>
    <button class="inner" onclick="paginaSuccessiva()" ${end >= filmFiltratiGlobali.length ? "disabled" : ""}>Successivo ➡</button>
  `;
}

// Bottoni per navigare tra le pagine
function paginaSuccessiva() {
  if ((paginaCorrente + 1) * FILM_PER_PAGINA < filmFiltratiGlobali.length) {
    paginaCorrente++;
    mostraPagina(document.getElementById("risultato"));
  }
}

function paginaPrecedente() {
  if (paginaCorrente > 0) {
    paginaCorrente--;
    mostraPagina(document.getElementById("risultato"));
  }
}

// Funzione principale per consigliare film
function consigliaFilm() {
  const genere = document.getElementById("genere").value;
  const mood = document.getElementById("mood").value;
  const risultato = document.getElementById("risultato");

  risultato.innerHTML = "⏳ Sto cercando il film perfetto...";

  caricaFilmDaAPI(genere).then(filmAPI => {
    filmFiltratiGlobali = filmAPI.map(normalizzaFilm)
                                 .filter(f => f.mood === mood);

    if (filmFiltratiGlobali.length === 0) {
      risultato.innerHTML = "😢 Nessun film trovato per questo mood";
      return;
    }

    filmFiltratiGlobali.sort((a, b) => b.valutazione - a.valutazione);
    paginaCorrente = 0;
    mostraPagina(risultato);
  }).catch(err => {
    console.error(err);
    risultato.innerHTML = "❌ Errore nel caricamento dei film";
  });
}
