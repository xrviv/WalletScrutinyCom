---
wsId: 
title: 'Bitcoin Wallet: Blockchain NFT'
altTitle: (Fake) Bitcoin Wallet Blockchain
authors:
- leo
users: 100000
appId: com.bitcoin.wallet.btc
appCountry: 
released: 2019-05-01
updated: 2023-06-29
version: 3.0.7
stars: 4.4
ratings: 6495
reviews: 304
website: https://coinhub8899.web.app
repository: https://github.com/hoanghiephui/Bitcoin-Wallet
issue: https://github.com/hoanghiephui/Bitcoin-Wallet/issues/15
icon: com.bitcoin.wallet.btc.png
bugbounty: 
meta: removed
verdict: fake
appHashes: []
date: 2024-02-05
signer: 
twitter: 
social: 
redirect_from: 
developerName: InvoVN Solutions
features: 

---

**Update 2021-07-26**: The provider features several apps that either through
their logo or the name try to resemble trusted wallets like
{% include walletLink.html wallet='android/de.schildbach.wallet' %}
or
{% include walletLink.html wallet='android/piuk.blockchain.android' %}.
Given other issues with the products, we assume they are fakes.

**Update 2021-06-04**: The provider
[promised to "check soon" back in 2019](https://github.com/hoanghiephui/Bitcoin-Wallet/issues/15#issuecomment-557786905)
but several later attempts to get an update failed.

We list the following apps of this provider:

* {% include walletLink.html wallet='android/com.bitcoin.wallet.btc' verdict=true %}
* {% include walletLink.html wallet='android/com.blockchain.wallet.btc' verdict=true %}
* {% include walletLink.html wallet='android/com.blockchain.bitcoin.wallet' verdict=true %}
* {% include walletLink.html wallet='android/com.blockchain.explorer' verdict=true %}
* {% include walletLink.html wallet='android/com.blockchain.btc.coinhub' verdict=true %}

Something shady is going on here. This wallet looked like a wallet when we
tried to reproduce it from the provided source in 2019 and we failed to
do that. Check "Older reviews" above for details. Now (ok, a while ago:
2020-09-16), user "alex Kijvanit" commented on the wallet:

> What a crazy app! I install then open the app. First thing came up was "we no
  longer support this app. Please backup". What the hell!!

We tried to start the app as it is installed on our device (after all it might
contain funds) and do not even get this message. Just an instant close or crash.

Other users report the same.

After deleting the app's data (or re-installing it), the app starts without any
such symptoms but for example the backup appears to not get written to the
sdcard.

Upon further investigation of their app, we find it is obfuscated. This is a big
red flag for a wallet that claims to be open source. We put those wallets in
their own category as they clearly are worse than closed source. **Do not trust
this wallet!**
