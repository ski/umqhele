
import { makeIssuerKit, MathKind, makeLocalAmountMath } from '@agoric/ertp';
import { makeFakeVatAdmin } from '@agoric/zoe/src/contractFacet/fakeVatAdmin';
import { makeZoe } from '@agoric/zoe/src/zoeService/zoe';

const setupMixed = () => {
  const moolaBundle = makeIssuerKit('moola');
  const itemsBundle = makeIssuerKit('items', MathKind.SET);
  const allBundles = { items: itemsBundle, moola: moolaBundle };

  const mints = new Map();
  const issuers = new Map();
  const amountMaths = new Map();
  const brands = new Map();

  for (const k of Object.getOwnPropertyNames(allBundles)) {
    mints.set(k, allBundles[k].mint);
    issuers.set(k, allBundles[k].issuer);
    amountMaths.set(k, allBundles[k].amountMath);
    brands.set(k, allBundles[k].brand);
  }

  const itemsIssuer = issuers.get('items');
  const moolaIssuer = issuers.get('moola');
  const itemsMint = mints.get('items');
  const moolaMint = mints.get('moola');
  const makeItems = allBundles.items.amountMath.make;
  const makeMoola = allBundles.moola.amountMath.make;
  
  const zoe = makeZoe(makeFakeVatAdmin().admin);
  return {
    zoe,
    itemsIssuer,
    moolaIssuer,
    itemsMint,
    moolaMint,
    makeItems,
    makeMoola,
    amountMaths,
    brands,    
  }
}

harden(setupMixed);
export { setupMixed };