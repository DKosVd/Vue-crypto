const AGGREGATE_INDEX = "5";
const INVALID_SUB = "500";
const IVALID_SUB_MESSAGE = "INVALID_SUB";
const handlesTicket = new Map();

const webSocket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=8178659e743532676c065d222082a799720ccf612aec0dea1fc0c4c5d5fe1109`
);

const broadcastChannel = new BroadcastChannel("currencies");

const api = {
  // async getPriceByName() {
  //   if (!handlesTicket.size) {
  //     return;
  //   }
  //   const data = await fetch(
  //     `https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${[
  //       ...handlesTicket.keys(),
  //     ].join(
  //       ","
  //     )}&api_key=8178659e743532676c065d222082a799720ccf612aec0dea1fc0c4c5d5fe1109`
  //   );
  //   const result = await data.json();
  //   const updatedPrice = Object.fromEntries(
  //     Object.entries(result).map(([currency, value]) => [currency, 1 / value])
  //   );
  //   Object.entries(updatedPrice).forEach(([currency, newPrice]) => {
  //     const handles = handlesTicket.get(currency) || [];
  //     handles.forEach((cb) => cb(newPrice));
  //   });
  // },

  async getCurrency() {
    const data = await fetch(
      `https://min-api.cryptocompare.com/data/all/coinlist?summary=true&api_key=8178659e743532676c065d222082a799720ccf612aec0dea1fc0c4c5d5fe1109`
    );
    const result = await data.json();
    return result;
  },

  async getCost(from, to) {
    const data = await fetch(
      `https://min-api.cryptocompare.com/data/price?fsym=${from}&tsyms=${to}&api_key=8178659e743532676c065d222082a799720ccf612aec0dea1fc0c4c5d5fe1109`
    );
    const result = await data.json();
    return result;
  },
};

webSocket.addEventListener("message", async (msg) => {
  const {
    TYPE: type,
    PRICE: newPrice,
    FROMSYMBOL: currency,
    MESSAGE: message,
    PARAMETER: parameter,
    TOSYMBOL: tosymbol,
  } = JSON.parse(msg.data);

  if (type === INVALID_SUB && message === IVALID_SUB_MESSAGE) {
    const [fromCurrency, toCurrency] = parameter.split("~").slice(2);
    if (toCurrency === "BTC") {
      handlingHandlers(fromCurrency, "-", new Error(message));
    }
    subscribeSocket(fromCurrency, "BTC");
    // const { BTC: costCurrentInBTC } = await api.getCost(from, "BTC");
    // const { USD: costBTCInUSD } = await api.getCost("BTC", "USD");
    // const resultCost = costCurrentInBTC * costBTCInUSD;
    // const handles = handlesTicket.get(from) || [];
    // handles.forEach((fn) => {
    //   fn(resultCost);
    //   sendToBroadcastChannel(from, resultCost);
    // });
    // subscribeSocket(from, "BTC");
  }

  if (tosymbol === "BTC") {
    const { USD: costBTCInUSD } = await api.getCost("BTC", "USD");
    const resultCost = newPrice * costBTCInUSD;
    if (!isNaN(resultCost)) {
      handlingHandlers(currency, resultCost);
      return;
    }
  }

  if (type !== AGGREGATE_INDEX || typeof newPrice === "undefined") {
    return;
  }

  const handles = handlesTicket.get(currency) || [];
  handles.forEach((fn) => {
    fn(newPrice);
    sendToBroadcastChannel(currency, newPrice);
  });
});

function sendToWs(message) {
  const stringifiedMessage = JSON.stringify(message);

  if (webSocket.readyState === WebSocket.OPEN) {
    webSocket.send(stringifiedMessage);
  }

  webSocket.addEventListener(
    "open",
    () => {
      webSocket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function sendToBroadcastChannel(currency, price, err) {
  broadcastChannel.postMessage({
    name: currency,
    price: price,
    err: err,
  });
}

function subscribeSocket(ticket, currency) {
  sendToWs({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticket}~${currency || "USD"}`],
  });
}

function unSubscribeSocket(ticket) {
  sendToWs({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticket}~USD`],
  });
}

function handlingHandlers(currency, price = "-", err = null) {
  const handlers = handlesTicket.get(currency) || [];
  handlers.forEach((fn) => {
    fn(price, err);
    sendToBroadcastChannel(currency, price, err);
  });
}

export function subscribeToTicket(ticket, cb) {
  const handleTicket = handlesTicket.get(ticket) || [];
  handlesTicket.set(ticket, [...handleTicket, cb]);
  subscribeSocket(ticket);
}

export function unSubscribeFromTicket(ticket) {
  handlesTicket.delete(ticket);
  unSubscribeSocket(ticket);
}

window.handlesTicket = handlesTicket;

export default api;
