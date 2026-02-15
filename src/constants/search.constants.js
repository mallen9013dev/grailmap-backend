const DISTANCES = {
  EARTH_RADIUS_METERS: 6371000,
  DEFAULT_MAX_DISTANCE_METERS: 40233.6 // 100 miles
}

const SEARCH_OPTIONS = [
  // ----- CARDS -----
  {
    id: "trading_cards",
    label: "Trading Card Game Store",
    query: "trading card game store",
    category: "Cards"
  },
  {
    id: "sports_cards",
    label: "Sports Card Store",
    query: "sports trading card store",
    category: "Cards"
  },

  // ----- GAMES -----
  {
    id: "board_games",
    label: "Board Game Store",
    query: "board game store",
    category: "Games"
  },
  {
    id: "board_game_cafe",
    label: "Board Game Lounge (Café)",
    query: "tabletop game cafe lounge", // or "board game cafe tabletop games"
    category: "Games"
  },
  {
    id: "tabletop_gaming",
    label: "Tabletop Gaming Store",
    query: "tabletop board gaming store",
    category: "Games"
  },
  {
    id: "retro_video_games",
    label: "Retro Video Game Store",
    query: "retro collectible video game store",
    category: "Games"
  },
  {
    id: "miniatures_wargaming",
    label: "Miniatures & Wargaming Store",
    query: "miniatures wargaming store",
    category: "Games"
  },

  // ----- COMICS & ANIME -----
  {
    id: "comic_books",
    label: "Comic Book Store",
    query: "comic book store",
    category: "Comics & Anime"
  },
  {
    id: "anime_manga",
    label: "Anime & Manga Store",
    query: "anime manga store",
    category: "Comics & Anime"
  },

  // ----- TOYS & FIGURES -----
  {
    id: "vintage_toys",
    label: "Vintage Toy Store",
    query: "vintage collectible toy store",
    category: "Toys & Figures"
  },
  {
    id: "lego",
    label: "LEGO Resale Store",
    query: "lego resale store",
    category: "Toys & Figures"
  },
  {
    id: "figures_statues",
    label: "Figures & Statues Store",
    query: "anime pop culture collectible figures store", // fix
    category: "Toys & Figures"
  },

  // ----- MEDIA -----
  {
    id: "vinyl_records",
    label: "Vinyl Record Store",
    query: "used record store",
    category: "Media"
  },

  // ----- HOBBIES -----
  {
    id: "gundam_gunpla",
    label: "Gundam / Gunpla Store",
    query: "gunpla gundam model kits store",
    category: "Hobbies"
  }
]

export default {
  DISTANCES,
  SEARCH_OPTIONS
}
