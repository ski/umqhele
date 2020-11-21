
export const setupMint = async (state) => {
  const offer = {
    id: Date.now(),

    proposalTemplate: {
      want: {
      }
    },
    dappContext: true,
  };

  const apiSendRequest = {
    type: 'videoTokenizer/setup',
    id: Date.now().toLocaleString(),
    data: {
      depositFacetId: state.zoeInvitationDepositFacetId,
      offer,
    },
  }
  await state.apiSend(apiSendRequest);
}