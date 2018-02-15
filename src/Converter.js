export function convertTitle(hand) {
    return `PokerStars Game #${hand.handId}:  ${hand.gameType} ${hand.betting} ($${hand.smallBlind.amount}/$${hand.bigBlind.amount} USD) - ${hand.timePlayed}`;
}

export function convertDescription(hand) {
    let tableDescription = `Table '${hand.tableName} ${hand.minBuyIn}-${hand.maxBuyIn} bb' ${hand.maxSeats}-max`;

    if (hand.buttonSeatNumber) {
        tableDescription += ` Seat #${hand.buttonSeatNumber} is the button`;
    }

    return tableDescription;
}

export function convertPlayerStartingChips(hand) {
    return hand.players.map(player => `Seat ${player.seatId}: ${player.name} ($${player.initialBalance} in chips)`).join('\n');
}

export function convertBlindsPosted(hand) {
    return hand.blindsPosted.map(blind => `${blind.playerName}: posts ${blind.type} blind $${blind.amount}`).join('\n');
}

export function convertHoleCards(hand) {
    if (!hand.holeCards) {
        return '';
    }
    return `Dealt to ${hand.holeCards.playerName} [${hand.holeCards.cards}]`;
}

export function convertFlopCards(hand) {
    return `[${hand.flopCards}]`;
}

export function convertTurnCards(hand) {
    return `${convertFlopCards(hand)} [${hand.turnCard}]`;
}

export function convertRiverCards(hand) {
    return `${convertTurnCards(hand)} [${hand.riverCard}]`;
}

export function convertFinalBoard(hand) {
    let cards;
    if (hand.madeItToRiver) {
        cards = convertRiverCards(hand);
    } else if (hand.madeItToTurn) {
        cards = convertTurnCards(hand);
    } else if (hand.madeItToFlop) {
        cards = convertFlopCards(hand);
    } else {
        return 'Board []';
    }

    const replaced = cards.replace(/[[\]]+/gi, '');
    return `Board [${replaced}]`;
}

function buildOutputForActions(actions) {
    return actions.map(action => `${action.playerName}: ${action.action}`).join('\n');
}

export function convertPreFlopActions(hand) {
    return buildOutputForActions(hand.preFlopActions);
}

export function convertFlopActions(hand) {
    return buildOutputForActions(hand.flopActions);
}

export function convertTurnActions(hand) {
    return buildOutputForActions(hand.turnActions);
}

export function convertRiverActions(hand) {
    return buildOutputForActions(hand.riverActions);
}

export function convertPotInfo(hand) {
    return hand.pots.map(pot => `${pot.description}`).join(' ');
}

export function convertCardsShown(hand) {
    return hand.cardsShown.map(object => `${object.playerName}: shows [${object.cards}] (a ${object.handType})`).join('\n');
}

export function convertMoneyTransfers(hand) {
    return hand.playerSummaries.filter(object => object.totalWin > 0).map(object => `${object.playerName} collected $${object.totalWin} from pot`).join('\n');
}

export function convertPlayerSummary(hand) {
    return hand.playerSummaries.map(object => {
        let output = `Seat ${object.seatNumber}: ${object.playerName} `;

        if (object.cardsShown) {
            output += `showed [${object.cardsShown}] `;
            if (object.totalWin > 0) {
                output += `and won ($${object.totalWin}) with a ${object.handType}`;
            } else {
                output += `and lost with a ${object.handType}`;
            }
        } else if (object.netWin > 0) {
            output += `won ($${object.totalWin}) with a ${object.handType}`;
        } else {
            output += 'folded';
        }

        return output;
    }).join('\n');
}

export function convertHand(hand) {
    const outputParts = [
        convertTitle(hand),
        convertDescription(hand),
        convertPlayerStartingChips(hand),
        convertBlindsPosted(hand),
        '*** HOLE CARDS ***',
        convertHoleCards(hand),
        convertPreFlopActions(hand),
    ];

    if (hand.madeItToFlop) {
        outputParts.push(
            `*** FLOP *** ${convertFlopCards(hand)}`,
            convertFlopActions(hand),
        );
    }

    if (hand.madeItToTurn) {
        outputParts.push(
            `*** TURN *** ${convertTurnCards(hand)}`,
            convertTurnActions(hand),
        );
    }

    if (hand.madeItToRiver) {
        outputParts.push(
            `*** RIVER *** ${convertRiverCards(hand)}`,
            convertRiverActions(hand),
        );
    }

    if (hand.madeItToShowDown) {
        outputParts.push(
            '*** SHOW DOWN ***',
            convertCardsShown(hand),
            convertMoneyTransfers(hand),
        );
    }

    outputParts.push(
        '*** SUMMARY ***',
        convertPotInfo(hand),
        convertFinalBoard(hand),
        convertPlayerSummary(hand),
    );

    return outputParts.filter(part => part !== '').join('\n');
}
