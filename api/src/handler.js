// @ts-check
import { E } from '@agoric/eventual-send';
import { makeWebSocketHandler } from './lib-http';
import buildManualTimer from '../../contract/test/manualTimer';
const spawnHandler = (
  { creatorFacet, videoService, board, http, invitationIssuer, auctionIssuer, zoe },
  _invitationMaker,
) =>
  makeWebSocketHandler(http, (send, _meta) =>
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

          case 'videoTokenizer/publishAuction': {
            const { depositFacetId, offer } = obj.data;
            const depositFacet = await E(board).getValue(depositFacetId);
            
            const timer = buildManualTimer(console.log);
            const terms = { timeAuthority: timer, closesAfter: 2 };

            const sellerInvitationP =  await E(videoService).makeAuctionSellerInvitation(terms);
            const invitationAmount = await E(invitationIssuer).getAmountOf(sellerInvitationP);
            
            const {
              value: [{ handle }],
            } = invitationAmount;

            const invitationHandleBoardId = await E(board).getId(handle);
            let updatedOffer = { ...offer, invitationHandleBoardId };
            const auction = await E(depositFacet).receive(sellerInvitationP);
            updatedOffer = { ...updatedOffer, auction };
            send({
              type: 'videoTokenizer/publishAuctionResponse',
              data: { updatedOffer },
            });
            return true;
          }

          case 'videoTokenizer/setup': {
            const sellerInvitation = await E(creatorFacet).createSellerInvitation();
            const houseSeat = await E(zoe).offer(sellerInvitation);         
            send({
              type: 'videoTokenizer/setupResponse',
              data: { houseSeat },
            });
            return true;
          }

          default:
            console.log(JSON.stringify(obj));
            return false;
        }
      }
    }),
  );

export default harden(spawnHandler);
