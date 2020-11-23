import '@agoric/zoe/exported';

import { MathKind } from '@agoric/ertp';
import {
  trade,
  assertProposalShape,
  withdrawFromSeat,
  depositToSeat,
  assertIssuerKeywords,
} from '@agoric/zoe/src/contractSupport';
import { makeStore } from '@agoric/store';
import { assert, details } from '@agoric/assert';
import { E } from '@agoric/eventual-send';
import { makeNotifierKit } from '@agoric/notifier';

/**
 * Tokenized Video Stream contract
 *
 * @type {ContractStartFn}
 */
const start = async (zcf) => {
  // Terms are
  const {
    issuers: { AuctionProceeds: auctionProceedsIssuer },
    maths: { ListingFee: listingFeeMath },
    brands: { ListingFee: listingFeeBrand },
    listingPrice,
    auctionInstallation,
  } = zcf.getTerms();

  // The houseSeat keeps the listing fees until they are withdrawn
  const { zcfSeat: houseSeat } = zcf.makeEmptySeatKit();

  // A notifier for the house so that they are notified when fees have
  // accumulated.
  const {
    notifier: feesAccumulatedNotifier,
    updater: feesAccumulatedUpdater,
  } = makeNotifierKit();

  assertIssuerKeywords(zcf, harden(['ListingFee', 'AuctionProceeds']));
  const listingMint = await zcf.makeZCFMint('Items', MathKind.SET);
  // Create the internal catalog entry mint
  const { issuer } = listingMint.getIssuerRecord();

  const catalog = makeStore('startTitle');

  const withdrawFees = (seat) => {
    assertProposalShape(seat, { give: {} });
    const { want } = seat.getProposal();
    trade(zcf, { seat: houseSeat, gains: {} }, { seat, gains: want });
    seat.exit();
    return 'Fees removed';
  };

  const runningAuctions = makeStore('startTitle');

  /**
   * @typedef {Record<Keyword,Keyword>} KeywordKeywordRecord
   */

  /**
   * @callback MapKeywords
   * @param {AmountKeywordRecord | PaymentPKeywordRecord | undefined } keywordRecord
   * @param {KeywordKeywordRecord} keywordMapping
   */

  /** @type {MapKeywords} */
  const mapKeywords = (keywordRecord = {}, keywordMapping) => {
    return Object.fromEntries(
      Object.entries(keywordRecord).map(([keyword, value]) => {
        if (keywordMapping[keyword] === undefined) {
          return [keyword, value];
        }
        return [keywordMapping[keyword], value];
      }),
    );
  };

  // The user must pass in a timeAuthority and closesAfter deadline
  // for the auction. The reserve price is taken from the user's proposal
  const makeListingInvitation = (itemToAuction, timeAuthority, closesAfter) => {
    /** @type {OfferHandler} */
    const listItem = async (listingSeat) => {
      // Check that the money provided is greater
      // than the listingPrice.
      const providedMoney = listingSeat.getAmountAllocated(
        'ListingFee',
        listingFeeBrand,
      );
      assert(
        listingFeeMath.isGTE(providedMoney, listingPrice),
        details`More money (${listingPrice}) is required to list these items`,
      );

      // Currently only a single item is supported
      const [{ uuid }] = itemToAuction.value;
      const startTitle = uuid

      assert(!catalog.has(uuid), details`time / title taken`);

      // Mint the item to be put up for auction
      listingMint.mintGains({ Asset: itemToAuction }, houseSeat);

      catalog.init(startTitle, itemToAuction.value);

      // Put the item up for auction
      const itemPaymentRecord = await withdrawFromSeat(
        zcf,
        houseSeat,
        harden({ Asset: itemToAuction }),
      );

      const zoe = zcf.getZoeService();

      const { creatorInvitation: auctionCreatorInvitation }
        = await E(zoe).startInstance(
          auctionInstallation,
          harden({
            Asset: issuer,
            Ask: auctionProceedsIssuer,
          }),
          harden({
            timeAuthority,
            closesAfter,
          }),
        );

      const reservePrice = listingSeat.getProposal().want.AuctionProceeds;

      const auctionProposal = harden({
        want: { Ask: reservePrice },
        give: { Asset: itemToAuction },
        exit: { waived: null },
      });

      const auctionCreatorUserSeat = await E(zoe).offer(
        auctionCreatorInvitation,
        auctionProposal,
        itemPaymentRecord,
      );

      const makeBidInvitationObj = await E(
        auctionCreatorUserSeat,
      ).getOfferResult();

      // Give the auction winnings to the user through the listingSeat
      E(auctionCreatorUserSeat)
        .getPayouts()
        .then(async (payouts) => {
          const amounts = await E(
            auctionCreatorUserSeat,
          ).getCurrentAllocation();
          const keywords = {
            Ask: 'AuctionProceeds', // deposit the "Ask" from the auction under the "AuctionProceeds" keyword
            Asset: 'Items', // in case of an error, deposit the returned asset under "Items"
          };
          const amountsMapped = mapKeywords(amounts, keywords);
          const payoutsMapped = mapKeywords(payouts, keywords);
          await depositToSeat(zcf, listingSeat, amountsMapped, payoutsMapped);

          // Take the listing price money from the user
          trade(
            zcf,
            { seat: houseSeat, gains: { ListingFee: listingPrice } },
            { seat: listingSeat, gains: {} },
          );

          const currentFeesAccumulated = houseSeat.getCurrentAllocation();
          feesAccumulatedUpdater.updateState(currentFeesAccumulated);
          listingSeat.exit();
        });
      runningAuctions.init(startTitle, makeBidInvitationObj);
      return startTitle;
    };
    return zcf.makeInvitation(listItem, 'list item');
  };

  const getBidInvitation = async (startTitle) => {
    assert(runningAuctions.has(startTitle), `${startTitle} not found`);
    const invitationMaker = runningAuctions.get(startTitle);
    const invitation = await E(invitationMaker).makeBidInvitation();
    return invitation;
  }

  const getListing = () => runningAuctions.keys();
  const getCatalog = () => catalog.values();
  const getCatalogEntry = (key) => catalog.get(key);
  const getRunningAuctions = () => runningAuctions.keys();

  // the seller is the house here selling a spot in the house to display the listing.
  const makeWithdrawFeesInvitation = () =>
    zcf.makeInvitation(withdrawFees, 'withdrawFees');

  const getFeesAccumulatedNotifier = () => feesAccumulatedNotifier;

  return harden({
    creatorFacet: { makeWithdrawFeesInvitation, getFeesAccumulatedNotifier },
    publicFacet: {
      makeListingInvitation,
      getListing,
      getCatalog,
      getCatalogEntry,
      getRunningAuctions,
      getIssuer: () => issuer,
      pricePerItem: () => listingPrice,
      getBidInvitation,
    },
  });
};

harden(start);
export { start };
