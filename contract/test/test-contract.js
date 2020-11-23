// eslint-disable-next-line import/no-extraneous-dependencies
import '@agoric/install-ses';
// eslint-disable-next-line import/no-extraneous-dependencies
import test from 'ava';

import bundleSource from '@agoric/bundle-source';
import { E } from '@agoric/eventual-send';
import { makeLocalAmountMath } from '@agoric/ertp';
import { makePromiseKit } from '@agoric/promise-kit';
import { setupMixed } from './setup';
import uuid4 from "uuid4";

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
      harden({ ListingFee: moolaIssuer, AuctionProceeds: moolaIssuer }),
      terms,
    );

    // share the public facet
    webSite.resolve(videoService);

    // This notifier updates with the current amount allocated to the
    // house seat.
    const feesAccumulatedNotifier = await E(
      creatorFacet,
    ).getFeesAccumulatedNotifier();

    const update = await feesAccumulatedNotifier.getUpdateSince();
    const amountAllocatedToHouse = update.value;

    // we are creating a new invitation here so that bob can collect payout.
    const houseSeat = await E(zoe).offer(
      E(creatorFacet).makeWithdrawFeesInvitation(),
      harden({ want: amountAllocatedToHouse }), // want everything allocated to house
    );

    const housePayout = E(houseSeat).getPayout('ListingFee');

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

    const reservePrice = 9;
    const billing = {
      title: 'Learn to build smart contracts',
      showTime: Date.parse('12/22/2020 12:34'),
      uuid: uuid4(),
      // these don't go in the amountmath, do they?
      auctionEndDate: Date.parse('2020-11-16 14:00:00'),
      reservePrice,
      startingBid: 3,
    };

    const show2 = listingMaker.make(
      harden([billing]),
    );

    const AliceListingOffer = harden({
      want: { AuctionProceeds: makeMoola(reservePrice) },
      give: { ListingFee: videoService.pricePerItem() },
    });

    const listingPayment = purse.withdraw(makeMoola(2));

    const timeAuthority = timer;
    const closesAfter = 2;
    const buyListingInvitation = videoService.makeListingInvitation(
      show2,
      timeAuthority,
      closesAfter,
    );

    const aliceListerSeat = await zoe.offer(
      buyListingInvitation,
      AliceListingOffer,
      harden({ ListingFee: listingPayment }),
    );

    const key = await E(aliceListerSeat).getOfferResult();   
    listing.resolve({ show: show2, key });

    const aliceAuctionProceedsPayoutP = E(aliceListerSeat).getPayout(
      'AuctionProceeds',
    );
    t.deepEqual(
      await moolaIssuer.getAmountOf(aliceAuctionProceedsPayoutP),
      makeMoola(20),
      `alice gets the auction sale money`,
    );
  };

  const eve = async (purse) => {
    const videoService = await webSite.promise;
    const { show, key } = await listing.promise;

    const eveBidInvitation = await videoService.getBidInvitation(key);
    console.log(eveBidInvitation);
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

  await Promise.all([house(), alice(fund(2)), eve(fund(20)), clock()]);
});
