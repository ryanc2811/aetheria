const Deck = require("./Deck");
const CardManager = require("./CardManager");
class DeckBuilder {
  constructor(cardManager) {
    this.cardManager = cardManager;
  }

  build(deckData) {
    const deck = new Deck(deckData, this.cardManager);

    return deck;
  }
}

module.exports = DeckBuilder;
