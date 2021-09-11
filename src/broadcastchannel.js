const broadcastChannel = new BroadcastChannel("currencies");

export function getNewPriceFromChannel(updatePrice, err) {
  broadcastChannel.addEventListener("message", (message) => {
    const { data: ticketFromChannel } = message;
    updatePrice(ticketFromChannel.name, ticketFromChannel.price);
    err({
      err: ticketFromChannel.err,
      ticket: {
        name: ticketFromChannel.name,
        price: ticketFromChannel.price,
      },
    });
  });
}
