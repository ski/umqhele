
// eslint-disable-next-line import/no-extraneous-dependencies
import '@agoric/install-ses';
// eslint-disable-next-line import/no-extraneous-dependencies
import test from 'ava';

import bundleSource from '@agoric/bundle-source';
import { E } from '@agoric/eventual-send';
import { makeLocalAmountMath } from '@agoric/ertp';
import { makePromiseKit } from '@agoric/promise-kit';
import { setupMixed } from './setup';

const contractPath = `${__dirname}/../src/contract`;

test('tokenized video', async (t) => {
  const { moolaIssuer, moolaMint, makeMoola, zoe, timer } = setupMixed();

  // sync points
  const webSite = makePromiseKit();
  const listing = makePromiseKit();
  const bidPlaced = makePromiseKit();

  const house = async () => {
    // bundle, install the video service contract, auction contract
    const install = (path) => bundleSource(path).then((b) => E(zoe).install(b));
    const [
      auctionHouseInstallation,
      secondPriceAuctionInstallation,
    ] = await Promise.all([
      install(contractPath),
      install(
        require.resolve('@agoric/zoe/src/contracts/auction/secondPriceAuction'),
      ),
    ]);

    const moola2 = await makeMoola(2);

    const terms = harden({
      listingPrice: moola2,
      auctionInstallation: secondPriceAuctionInstallation,
    });
    const { creatorFacet, publicFacet: videoService } = await E(
      zoe,
    ).startInstance(
      auctionHouseInstallation,
      harden({ Money: moolaIssuer }),
      terms,
    );

    // share the public facet
    webSite.resolve(videoService);

    // the seller is the house.
    const houseSeat = await zoe.offer(creatorFacet.createSellerInvitation());

    await listing.promise

    // we are creating a new invitation here so that bob can collect payout.
    const houseSeat2 = await zoe.offer(creatorFacet.createSellerInvitation());

    const housePayout = houseSeat.getPayout('Money');

    t.deepEqual(
      await moolaIssuer.getAmountOf(housePayout),
      makeMoola(2),
      'house is paid',
    );
  };

  const alice = async (purse) => {
    const videoService = await webSite.promise;
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
    const [{ title, showTime }] = show2.value;
    const key = JSON.stringify([new Date(showTime).toISOString(), title]);

    const AliceListingOffer = harden({
      want: { Items: show2 },
      give: { Money: videoService.pricePerItem() },
    });

    const listingPayment = purse.withdraw(makeMoola(2));
    // the handler for this invite is buyListing
    const buyListingInvitation = videoService.makeListingInvitation();

    const aliceListerSeat = await zoe.offer(
      buyListingInvitation,
      AliceListingOffer,
      harden({ Money: listingPayment }),
    );

    const aliceItemsPayout = aliceListerSeat.getPayout('Items');
    t.deepEqual(
      await listingIssuer.getAmountOf(aliceItemsPayout),
      show2,
      `alice gets nothing of what she put in`,
    );

    const aliceAuctionSellOffer = harden({
      want: { Ask: makeMoola(9) }, // reserve price
      give: { Asset: show2 },
      // hm. https://github.com/Agoric/agoric-sdk/blob/master/packages/zoe/test/unitTests/contracts/test-secondPriceAuction.js#L49
      exit: { waived: null },
    });

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
    // alice caches the invitation maker.
    videoService.addInvitationMaker(key, makeBidInvitationObj);

    // share the listing
    listing.resolve({ show: show2, key });

    const aliceMoolaPayout = await E(aliceSellSeat).getPayout('Ask');
    t.deepEqual(
      await moolaIssuer.getAmountOf(aliceMoolaPayout),
      makeMoola(20),
      `alice didn't get any mool`,
    );
  };

  const eve = async (purse) => {
    const videoService = await webSite.promise;
    const { show, key } = await listing.promise;

    const eveBidInvitation = videoService.getBidInvitation(key);

    const eveBidOffer = harden({
      want: { Asset: show },
      give: { Bid: makeMoola(20) },
    });

    const eveBidPayment = purse.withdraw(makeMoola(20));

    const eveBidSeat = await zoe.offer(
      eveBidInvitation,
      eveBidOffer,
      harden({ Bid: eveBidPayment }),
    );
    bidPlaced.resolve();

    const listingIssuer = videoService.getIssuer();
    const eveItemsPayout = await E(eveBidSeat).getPayout('Asset');

    t.deepEqual(
      await listingIssuer.getAmountOf(eveItemsPayout),
      show,
      `eve gets nothing of what she put in`,
    );
  };

  const clock = async () => {
    await bidPlaced.promise;
    // time passes.
    timer.tick();
    timer.tick();
  };

  const fund = (n) => {
    const p = moolaIssuer.makeEmptyPurse();
    p.deposit(moolaMint.mintPayment(makeMoola(n)));
    return p;
  };
  //, , 
  return Promise.all([house(), alice(fund(2)), eve(fund(20)), clock()]);
});
