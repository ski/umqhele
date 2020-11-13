// @ts-check
import '@agoric/zoe/exported';

import { makeIssuerKit, MathKind } from '@agoric/ertp';
import { trade, defaultAcceptanceMsg } from '@agoric/zoe/src/contractSupport';
import { makeStore } from '@agoric/store';
import { assert, details } from '@agoric/assert';

/**
 * Tokenized Video Stream contract
 *
 * @type {ContractStartFn}
 */
const start = async (zcf) => {
  const {
    issuers: { Money: moneyIssuer },
    pricePerItem,
  } = zcf.getTerms();
  const money = zcf.getAmountMath(moneyIssuer.getBrand());

  // ISSUE: how to import this??? assertIssuerKeywords(zcf, harden(['Money']));
  const zcfMint = await zcf.makeZCFMint('Items', MathKind.SET);
  // Create the internal catalog entry mint
  const { issuer, amountMath: itemsMath } = zcfMint.getIssuerRecord();

  // ISSUE / TODO: how does this relate to webrtc key?
  const catalog = makeStore('startTitle');

  // In order to trade money for a listing, we need a seller seat.
  let sellerSeat;
  const open = (seat) => {
    sellerSeat = seat;
    return defaultAcceptanceMsg;
  };

  const buyListing = (buyerSeat) => {
    assert(sellerSeat, details`not yet open for business`);
    const wanted = buyerSeat.getProposal().want.Items.value;
    const wantedAmount = itemsMath.make(wanted);
    zcfMint.mintGains({ Items: wantedAmount }, sellerSeat);

    const fee = money.make(pricePerItem);

    const [{ title, showTime }] = wanted;
    const key = JSON.stringify([new Date(showTime).toISOString(), title]);
    console.log('buyListing', { key });

    assert(!catalog.has(key), details`time / title taken`);
    assert(sellerSeat, details`catalog not yet open`);
    trade(
      zcf,
      { seat: sellerSeat, gains: { Money: fee } },
      { seat: buyerSeat, gains: { Items: wantedAmount } },
    );
    console.log('trade returned');
    buyerSeat.exit();
    catalog.init(key, wanted);
    return key;
  };

  const makeListingInvitation = () =>
    zcf.makeInvitation(buyListing, 'buy listing');

  const creatorInvitation = zcf.makeInvitation(open, 'seller');
  return harden({
    creatorInvitation,
    publicFacet: {
      makeListingInvitation,
      getIssuer: () => issuer,
      pricePerItem: () => money.make(pricePerItem),
    },
  });
};

harden(start);
export { start };
