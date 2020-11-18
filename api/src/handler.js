// @ts-check
import { E } from '@agoric/eventual-send';
import { makeWebSocketHandler } from './lib-http';
import buildManualTimer from '../../contract/test/manualTimer';
const spawnHandler = (
  { creatorFacet, videoService, board, http, invitationIssuer, auctionIssuer,zoe },
  _invitationMaker,
) =>
  makeWebSocketHandler(http, (send, _meta) =>
    harden({
      async onMessage(obj) {
        switch (obj.type) {

          case 'videoTokenizer/createListing': {
            const { depositFacetId, offer } = obj.data;
            const depositFacet = await E(board).getValue(depositFacetId);
            const listingInvitationP = await E(videoService).makeListingInvitation();
            const invitationAmount = await E(invitationIssuer).getAmountOf(listingInvitationP);

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
            const sellerInvitation = await E(creatorFacet).createSellerInvitation();
            const houseSeat = await E(zoe).offer(sellerInvitation);

            // const { depositFacetId, offer } = obj.data;
            // const depositFacet = E(board).getValue(depositFacetId);
            // //not sure if this is the right thing to do
            
            // const invitationAmount = await E(invitationIssuer).getAmountOf(
            //   sellerInvitation,
            // );

            // const {
            //   value: [{ handle }],
            // } = invitationAmount;
            // const invitationHandleBoardId = await E(board).getId(handle);
            // const updatedOffer = { ...offer, invitationHandleBoardId };
            // await E(depositFacet).receive(sellerInvitation);
            send({
              type: 'videoTokenizer/setupResponse',
              data: { houseSeat },
            });
            return true;
          }

          default:
            console.log(JSON.stringify(obj));
            return undefined;
        }
      },
      async onError(obj) {
        console.log(JSON.stringify(obj));
      }
    }),
  );

export default harden(spawnHandler);
