
import api from './core';
import { pingBackend } from './core';
import { initiateSquareOAuth, getMerchantInfo } from './square';
import { getMerchantProfile, updateMerchantProfile } from './profiles';
import { publishLocations, publishProducts } from './catalog';

export {
  api as default,
  pingBackend,
  initiateSquareOAuth,
  getMerchantProfile,
  updateMerchantProfile,
  getMerchantInfo,
  publishLocations,
  publishProducts
};
