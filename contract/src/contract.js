// @ts-check
import '@agoric/zoe/exported';

import { makeIssuerKit, MathKind } from '@agoric/ertp';
import { E } from '@agoric/eventual-send';

/**
 * Tokenized Video Stream contract
 *
 * @type {ContractStartFn}
 */
const start = async (zcf) => {
  // ISSUE: how to import this??? assertIssuerKeywords(zcf, harden(['Money']));
  const {
    issuers: { Money: moneyIssuer },
    pricePerEntry,
  } = zcf.getTerms();

  const money = zcf.getAmountMath(moneyIssuer.getBrand());
  // Create the internal catalog entry mint
  const { issuer, mint, amountMath: entryMath, brand } = makeIssuerKit(
    'catalog entries',
    MathKind.SET,
  );

  const zoe = zcf.getZoeService();

  const houseInvitation = zcf.makeInvitation((_seat) => {
    throw new Error('unexpected offer to house');
  }, 'house');

  const listingHandler = (seat) => {
    const detail = seat.getAmountAllocated('Lot', brand);
    const HouseListingOffer = {
      want: { Fee: money.make(pricePerEntry) },
      give: { Lot: detail },
    };

    const token = mint.mintPayment(detail);
    zoe.offer(houseInvitation, HouseListingOffer, { Lot: token });
  };

  const makeListingInvitation = () =>
    zcf.makeInvitation(listingHandler, 'listing');

  const publicFacet = harden({
    makeListingInvitation,
    getIssuer: () => issuer,
  });
  return harden({ publicFacet });
};

harden(start);
export { start };
