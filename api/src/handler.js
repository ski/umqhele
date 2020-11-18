// @ts-check
import { E } from '@agoric/eventual-send';
import { makeWebSocketHandler } from './lib-http';
import buildManualTimer from '../../contract/test/manualTimer';
const spawnHandler = (
  { creatorFacet, videoService, board, http, invitationIssuer, zoe },
  _invitationMaker,
) =>
  makeWebSocketHandler(http, (send, _meta) =>
    harden({
      async onMessage(obj) { 
        try {
          switch (obj.type) {
            case 'videoTokenizer/sendInvitation': {
              const { depositFacetId, offer } = obj.data;
              const depositFacet = E(board).getValue(depositFacetId);
              
              //not sure if this is the right thing to do
              const sellerinvitation = await E(creatorFacet).createSellerInvitation();
              //const houseSeat = await E(zoe).offer(sellerinvitation);
  
              const listingInvitation = await E(videoService).makeListingInvitation();
              const invitationAmount = await E(invitationIssuer).getAmountOf(
                listingInvitation,
              );
              
              const {
                value: [{ handle }],
              } = invitationAmount;
              const invitationHandleBoardId = await E(board).getId(handle);
              const updatedOffer = { ...offer, invitationHandleBoardId };
              await E(depositFacet).receive(listingInvitation);
  
              send({
                type: 'videoTokenizer/sendInvitationResponse',
                data: {updatedOffer },
              });
              return true;
            }
  
            default:
              return undefined;
          }
        } catch (error) {
          console.log(error);
        }       
        
      },
      async onError(obj) { 
        console.log(JSON.stringify(obj));   
      }
    }),
  );

export default harden(spawnHandler);
