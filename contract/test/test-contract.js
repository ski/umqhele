// @ts-check

// eslint-disable-next-line import/no-extraneous-dependencies
import '@agoric/install-ses';
// eslint-disable-next-line import/no-extraneous-dependencies
import test from 'ava';

import bundleSource from '@agoric/bundle-source';
import { E } from '@agoric/eventual-send';
import { makeLocalAmountMath } from '@agoric/ertp';
import { setupMixed } from '../src/setup';
import buildManualTimer from '../src/manualTimer';

const contractPath = `${__dirname}/../src/contract`;

test('tokenized video', async (t) => {
  const { moolaIssuer, moolaMint, makeMoola, zoe } = setupMixed();

  // bundle, install the contract
  const auctionHouseBundle = await bundleSource(contractPath);
  const auctionHouseinstallation = await E(zoe).install(auctionHouseBundle);
  // bundle, install the auction contract
  // ISSUE / TODO: let caller supply the installation?
  const secondPriceAuctionInstallation = await E(zoe).install(
    await bundleSource(
      require.resolve('@agoric/zoe/src/contracts/auction/secondPriceAuction'),
    ),
  );

  const listingIssuerKeywordRecord = harden({ Ask: moolaIssuer });

  const listingTerms = harden({
    listingPrice: 2,
    auctionInstallation: secondPriceAuctionInstallation,
  });

  const { creatorFacet, publicFacet: videoService } = await E(
    zoe,
  ).startInstance(
    auctionHouseinstallation,
    listingIssuerKeywordRecord,
    listingTerms,
  );

  // the seller is the house.
  const houseSeat = await zoe.offer(creatorFacet.createSellerInvitation());

  // whats happening here?
  const listingIssuer = videoService.getIssuer();
  const listingMaker = await makeLocalAmountMath(listingIssuer);

  const show2 = listingMaker.make(
    harden([
      {
        title: 'Learn to build smart contracts',
        showTime: Date.parse('2020-11-30 14:00:00'),
        // these don't go in the amountmath, do they?
        auctionEndDate: Date.parse('2020-11-16 14:00:00'),
        reservePrice: 9,
        startingBid: 3,
      },
    ]),
  );

  const AliceListingOffer = harden({
    want: { Items: show2 },
    give: { Money: makeMoola(2) }, // cheap to list
  });

  const listingPayment = moolaMint.mintPayment(makeMoola(2));
  // the handler for this invite is buyListing
  const buyListingInvitation = videoService.makeListingInvitation();

  const aliceListerSeat = await zoe.offer(
    buyListingInvitation,
    AliceListingOffer,
    harden({ Money: listingPayment }),
  );

  // we are creating a new invitation here so that bob can collect payout.
  const houseSeat2 = await zoe.offer(creatorFacet.createSellerInvitation());

  const aliceItemsPayout = aliceListerSeat.getPayout('Items');
  t.deepEqual(
    await listingIssuer.getAmountOf(aliceItemsPayout),
    show2,
    `alice gets nothing of what she put in`,
  );
  const housePayout = houseSeat.getPayout('Money');

  t.deepEqual(
    await moolaIssuer.getAmountOf(housePayout),
    makeMoola(2),
    'house is paid',
  );

  // now the tough part, as if

  const aliceAuctionSellOffer = harden({
    want: { Ask: makeMoola(9) }, // reserve price
    give: { Asset: show2 },
    // hm. https://github.com/Agoric/agoric-sdk/blob/master/packages/zoe/test/unitTests/contracts/test-secondPriceAuction.js#L49
    exit: { waived: null },
  });

  const timer = buildManualTimer(console.log);
  const terms = { timeAuthority: timer, closesAfter: 2 };

  const aliceSellInvitation = await videoService.makeAuctionSellerInvitation(
    terms,
  );
  const aliceSellSeat = zoe.offer(
    aliceSellInvitation,
    aliceAuctionSellOffer,
    harden({ Asset: aliceItemsPayout }),
  );

  const makeBidInvitationObj = await E(aliceSellSeat).getOfferResult();
  const [{ title, showTime }] = show2.value;
  const key = JSON.stringify([new Date(showTime).toISOString(), title]);
  // alice caches the invitation maker.
  videoService.addInvitationMaker(key, makeBidInvitationObj);

  const eveBidInvitation = videoService.getBidInvitation(key);

  const eveBidOffer = harden({
    want: { Asset: show2 },
    give: { Bid: makeMoola(20) },
  });

  const eveBidPayment = moolaMint.mintPayment(makeMoola(20));

  const eveBidSeat = await zoe.offer(
    eveBidInvitation,
    eveBidOffer,
    harden({ Bid: eveBidPayment }),
  );

  // time passes.
  timer.tick();
  timer.tick();

  // await E(eveBidSeat).tryExit();

  const eveItemsPayout = await E(eveBidSeat).getPayout('Asset');
  t.deepEqual(
    await listingIssuer.getAmountOf(eveItemsPayout),
    show2,
    `eve gets nothing of what she put in`,
  );

  let aliceMoolaPayout = await E(aliceSellSeat).getPayout('Ask');
  t.deepEqual(
    await moolaIssuer.getAmountOf(aliceMoolaPayout),
    makeMoola(20),
    `alice didn't get any mool`,
  );
  t.truthy(1 === 1, 'it aint true?!');
  if (true) return;
});
