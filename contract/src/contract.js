// @ts-check
import '@agoric/zoe/exported';

import { MathKind } from '@agoric/ertp';
import { trade, defaultAcceptanceMsg } from '@agoric/zoe/src/contractSupport';
import { makeStore } from '@agoric/store';
import { assert, details } from '@agoric/assert';
import { E } from '@agoric/eventual-send';

/**
 * Tokenized Video Stream contract
 *
 * @type {ContractStartFn}
 */
const start = async (zcf) => {

  //Terms are 
  const {
    issuers: { Ask: moolaIssuer },
    listingPrice,
    auctionInstallation //pricePerItem,        
  } = zcf.getTerms();
  const money = zcf.getAmountMath(moolaIssuer.getBrand()); //TODO: rename money to moolaAmountMath

  // ISSUE: how to import this??? assertIssuerKeywords(zcf, harden(['Money']));  
  const listinMint = await zcf.makeZCFMint('Items', MathKind.SET); //ListingItem or LotItem?
  // Create the internal catalog entry mint
  const { issuer, amountMath: itemsMath } = listinMint.getIssuerRecord();

  // ISSUE / TODO: how does this relate to webrtc key?
  const catalog = makeStore('startTitle');

  // In order to trade money for a listing, we need a seller seat.
  // should this seat  be a singleton ?
  let sellerSeat;
  const open = (seat) => {
    if (sellerSeat) {
      sellerSeat.exit();
    }
    sellerSeat = seat;
    return defaultAcceptanceMsg;
  };


  const buyListing = (buyerSeat) => {

    assert(sellerSeat, details`not yet open for business`);
    const wanted = buyerSeat.getProposal().want.Items.value;
    const wantedAmount = itemsMath.make(wanted);
    listinMint.mintGains({ Items: wantedAmount }, sellerSeat);

    const fee = money.make(listingPrice);

    const [{ title, showTime }] = wanted;
    const key = JSON.stringify([new Date(showTime).toISOString(), title]);

    assert(!catalog.has(key), details`time / title taken`);
    assert(sellerSeat, details`catalog not yet open`);
    trade(
      zcf,
      { seat: sellerSeat, gains: { Money: fee } },
      { seat: buyerSeat, gains: { Items: wantedAmount } },
    );
    buyerSeat.exit();
    catalog.init(key, wanted);
    return key;
  };

  const runningAuctions = makeStore('startTitle');

  const addInvitationMaker = (startTitle, invitationMaker) =>
    runningAuctions.init(startTitle, invitationMaker);

  const getBidInvitation = (startTitle) =>
    runningAuctions.get(startTitle).makeBidInvitation();

  //this is the house invitation.
  const makeListingInvitation = () =>
    zcf.makeInvitation(buyListing, 'buy listing');

  const zoe = zcf.getZoeService();

  const makeAuctionSellerInvitation = async (terms) => {
    const {
      timeAuthority,
      closesAfter
    } = terms;
    const { creatorInvitation } = await E(zoe).startInstance(
      auctionInstallation,
      harden({
        Asset: issuer,
        Ask: moolaIssuer,
      }),
      harden({
        timeAuthority: timeAuthority,
        closesAfter: closesAfter
      }),
    );
    return creatorInvitation;
  };

  //the seller is the house here selling a spot in the house to display the listing.

  const createSellerInvitation = () => zcf.makeInvitation(open, 'seller');

  return harden({
    creatorFacet: { createSellerInvitation },
    publicFacet: {
      makeListingInvitation,
      makeAuctionSellerInvitation,
      getIssuer: () => issuer,
      pricePerItem: () => money.make(listingPrice),
      addInvitationMaker,
      getBidInvitation,
    },
  });
};

harden(start);
export { start };
