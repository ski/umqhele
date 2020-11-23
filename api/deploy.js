// @ts-check
// Agoric Dapp api deployment script

import fs from 'fs';
import { E } from '@agoric/eventual-send';
import '@agoric/zoe/exported';
import { makeLocalAmountMath } from '@agoric/ertp';
import installationConstants from '../ui/public/conf/installationConstants';

// deploy.js runs in an ephemeral Node.js outside of swingset. The
// spawner runs within ag-solo, so is persistent.  Once the deploy.js
// script ends, connections to any of its objects are severed.

/**
 * @typedef {Object} DeployPowers The special powers that `agoric deploy` gives us
 * @property {(path: string) => Promise<{ moduleFormat: string, source: string }>} bundleSource
 * @property {(path: string) => string} pathResolve
 * @property {(path: string, opts?: any) => Promise<any>} installUnsafePlugin
 *
 * @typedef {Object} Board
 * @property {(id: string) => any} getValue
 * @property {(value: any) => string} getId
 * @property {(value: any) => boolean} has
 * @property {() => [string]} ids
 */

const API_PORT = process.env.API_PORT || '8000';

/**
 * @typedef {{ zoe: ZoeService, board: Board, spawner, wallet,
 * uploads, http, chainTimerService,localTimerService }} Home
 * @param {Promise<Home>} homePromise
 * A promise for the references available from REPL home
 * @param {DeployPowers} powers
 */
export default async function deployApi(
  homePromise,
  { bundleSource, pathResolve },
) {
  const home = await homePromise;
  const { spawner, zoe, http, board, wallet, chainTimerService, localTimerService } = home;

  const {
    INSTALLATION_BOARD_ID,
    AUCTION_INSTALLATION_BOARD_ID,
    CONTRACT_NAME,
  } = installationConstants;
  const auctionHouseInstallation = await E(board).getValue(
    INSTALLATION_BOARD_ID,
  );
  const secondPriceAuctionInstallation = await E(board).getValue(
    AUCTION_INSTALLATION_BOARD_ID,
  );

  const moneyIssuer = await E(wallet).getIssuer('moola');
  const moneyBrand = await E(moneyIssuer).getBrand();
  const moneyMath = await makeLocalAmountMath(moneyIssuer);
  const pricePerListing = moneyMath.make(2);
  const moneyPurse = await E(wallet).getPurse('Fun budget');

  const terms = harden({
    listingPrice: pricePerListing,
    auctionInstallation: secondPriceAuctionInstallation,
  });
  const { creatorFacet, instance, publicFacet: videoService } = await E(
    zoe,
  ).startInstance(
    auctionHouseInstallation,
    harden({ AuctionProceeds: moneyIssuer, ListingFee: moneyIssuer }),
    terms,
  );

  console.log('- SUCCESS! contract instance is running on Zoe');
  console.log('Retrieving Board IDs for issuers and brands');
  const invitationIssuerP = E(zoe).getInvitationIssuer();
  const invitationBrandP = E(invitationIssuerP).getBrand();

  const auctionIssuerP = await E(videoService).getIssuer();
  const auctionBrand = await E(auctionIssuerP).getBrand();
  const auctionIssuer = await auctionIssuerP;
  const invitationIssuer = await invitationIssuerP;
  const itemMath = await makeLocalAmountMath(auctionIssuer);

  const [
    INSTANCE_BOARD_ID,
    AUCTION_BRAND_BOARD_ID,
    AUCTION_ISSUER_BOARD_ID,
    MONEY_BRAND_BOARD_ID,
    MONEY_ISSUER_BOARD_ID,
  ] = await Promise.all([
    E(board).getId(instance),
    E(board).getId(auctionBrand),
    E(board).getId(auctionIssuer),
    E(board).getId(moneyBrand),
    E(board).getId(moneyIssuer),
  ]);

  console.log(`-- Contract Name: ${CONTRACT_NAME}`);
  console.log(`-- INSTANCE_BOARD_ID: ${INSTANCE_BOARD_ID}`);
  console.log(`-- AUCTION_ISSUER_BOARD_ID: ${AUCTION_ISSUER_BOARD_ID}`);
  console.log(`-- AUCTION_BRAND_BOARD_ID: ${AUCTION_ISSUER_BOARD_ID}`);

  const timeAuthority = chainTimerService;
  //const timeAuthority = localTimerService;

  const installURLHandler = async () => {
    const bundle = await bundleSource(pathResolve('./src/handler.js'));
    const handlerInstall = E(spawner).install(bundle);
    const handler = E(handlerInstall).spawn({
      creatorFacet,
      moneyPurse,
      itemMath,
      timeAuthority,
      videoService,
      board,
      http,
      invitationIssuer,
      auctionIssuer,
      zoe,
    });

    // Have our ag-solo wait on ws://localhost:8000/api/card-store for
    // websocket connections.
    await E(http).registerURLHandler(handler, '/api/videotokenizer');
  };

  await installURLHandler();

  const invitationBrand = await invitationBrandP;
  const INVITE_BRAND_BOARD_ID = await E(board).getId(invitationBrand);
  const API_URL = process.env.API_URL || `http://127.0.0.1:${API_PORT || 8000}`;

  const dappConstants = {
    INSTANCE_BOARD_ID,
    INSTALLATION_BOARD_ID,
    INVITE_BRAND_BOARD_ID,
    // BRIDGE_URL: 'agoric-lookup:https://local.agoric.com?append=/bridge',
    brandBoardIds: {
      Auction: AUCTION_BRAND_BOARD_ID,
      AuctionProceeds: MONEY_BRAND_BOARD_ID,
      ListingFee: MONEY_BRAND_BOARD_ID,
    },
    issuerBoardIds: {
      Auction: AUCTION_ISSUER_BOARD_ID,
      AuctionProceeds: MONEY_ISSUER_BOARD_ID,
      ListingFee: MONEY_ISSUER_BOARD_ID,
    },
    BRIDGE_URL: 'http://127.0.0.1:8000',
    API_URL,
  };
  const defaultsFile = pathResolve(`../ui/public/conf/defaults.js`);
  console.log('writing', defaultsFile);
  const defaultsContents = `\
// GENERATED FROM ${pathResolve('./deploy.js')}
export default ${JSON.stringify(dappConstants, undefined, 2)};
`;
  await fs.promises.writeFile(defaultsFile, defaultsContents);
}
