// @ts-check
import { E } from '@agoric/eventual-send';
import { makeWebSocketHandler } from './lib-http';

const spawnHandler = (
  { creatorFacet, videoService, board, http, invitationIssuer },
  _invitationMaker,
) =>
  makeWebSocketHandler(http, (send, _meta) =>
    harden({
      async onMessage(obj) {
        switch (obj.type) {
          case 'videoTokenizer/sendInvitation': {
            const { depositFacetId, offer } = obj.data;
            const depositFacet = E(board).getValue(depositFacetId);
            console.log("depositFacet");
            const invitation = await E(creatorFacet).createSellerInvitation();
            const invitationAmount = await E(invitationIssuer).getAmountOf(
              invitation,
            );
            
            const {
              value: [{ handle }],
            } = invitationAmount;
            const invitationHandleBoardId = await E(board).getId(handle);
            const updatedOffer = { ...offer, invitationHandleBoardId };
            await E(depositFacet).receive(invitation);

            send({
              type: 'videoTokenizer/sendInvitationResponse',
              data: {updatedOffer },
            });
            return true;
          }

          default:
            return undefined;
        }
      },
    }),
  );

export default harden(spawnHandler);
