// @ts-check
import { E } from '@agoric/eventual-send';
import { makeWebSocketHandler } from './lib-http';

const spawnHandler = async (
  {
    creatorFacet,
    moneyPurse,
    itemMath,
    timeAuthority,
    videoService,
    board,
    http,
    invitationIssuer,
    zoe,
  },
  _invitationMaker,
) => {
  // withdraw fees from the contract and deposit them in the dapp wallet
  const notifier = await E(creatorFacet).getFeesAccumulatedNotifier();

  const collectFees = (update) => {
    const amountAllocatedToHouse = update.value;

    // we are creating a new invitation here so we can collect the
    // payout to the dapp wallet
    const houseSeatP = E(zoe).offer(
      E(creatorFacet).makeWithdrawFeesInvitation(),
      harden({ want: amountAllocatedToHouse }), // want everything allocated to house
    );

    const listingFeesPaymentP = E(houseSeatP).getPayout('ListingFee');

    listingFeesPaymentP.then((payment) => moneyPurse.deposit(payment));

    E(notifier).getUpdateSince(update.count).then(collectFees);
  };

  // Start collecting fees
  E(notifier).getUpdateSince().then(collectFees);

  const handler = makeWebSocketHandler(http, (send, _meta) =>
    harden({
      async onMessage(obj) {
        switch (obj.type) {
          case 'videoTokenizer/listings': {
            const listing = await E(videoService).getListing();
            send({
              type: 'videoTokenizer/listingsResponse',
              data: { listing },
            });
            return true;
          }

          case 'videoTokenizer/createListing': {
            const { depositFacetId, offer, entry, closesAfter } = obj.data;
            const depositFacet = await E(board).getValue(depositFacetId);
            const itemToAuction = itemMath.make(harden([entry]));
            const listingInvitationP = await E(
              videoService,
            ).makeListingInvitation(itemToAuction, timeAuthority, closesAfter);
            const invitationAmount = await E(invitationIssuer).getAmountOf(
              listingInvitationP,
            );

            const {
              value: [{ handle }],
            } = invitationAmount;

            const invitationHandleBoardId = await E(board).getId(handle);
            const updatedOffer = { ...offer, invitationHandleBoardId };
            await E(depositFacet).receive(listingInvitationP);
            send({
              type: 'videoTokenizer/createListingResponse',
              data: { updatedOffer },
            });
            return true;
          }

          case 'videoTokenizer/setup': {
            send({
              type: 'videoTokenizer/setupResponse',
              data: { message: 'setup has already occurred' },
            });
            return true;
          }

          default:
            console.log(JSON.stringify(obj));
            return false;
        }
      },
    }),
  );
  return handler;
};

export default harden(spawnHandler);
