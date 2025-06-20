---
title: CoolWallet Pro
appId: coolwalletpro
authors:
- kiwilamb
- leo
released: 
discontinued: 
updated: 
version: 
binaries: 
dimensions:
- 54
- 85
- 0.8
weight: 6
provider: CoolBitX
providerWebsite: https://coolbitx.com/
website: https://www.coolwallet.io/product/coolwallet-pro/
shop: https://www.coolwallet.io/product/coolwallet-pro/
country: TW
price: 149USD
repository: 
issue: 
icon: coolwalletpro.png
bugbounty: 
meta: ok
verdict: nosource
appHashes: 
date: 2024-12-08
signer: 
twitter: coolwallet
social:
- https://www.facebook.com/coolwallet
features: 

---

**Update 2024-12-08:** This product remains available and not verifiable.

This device, running weeks on a single charge connects to its companion app on

* Android {% include walletLink.html wallet='android/com.coolbitx.cwsapp' %}
* iPhone {% include walletLink.html wallet='iphone/com.coolbitx.coolwallets' %}

via Bluetooth. It features a display and a button to confirm actions.

Searching for the firmware, latest updates thereof and the source code, we find
[this FAQ question](https://help.coolwallet.io/article/77-which-operating-system-is-coolwallet-using):

> **Which Operating System Is CoolWallet Using?**<br>
  The core of CoolWallet is an ARM-based secure element. We developed the native
  card operating system with cryptocurrencies capability and enhanced security
  features.

which sounds like the firmware probably is closed source.

The device
[uses open standards](https://help.coolwallet.io/article/58-can-i-recover-my-coolwallet-seed-to-another-wallet)
<a href='https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki'>BIP 039</a>,
<a href='https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki'>BIP 044</a> and
<a href='https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki'>BIP 141</a> for SegWit and not
<a href='https://github.com/bitcoin/bips/blob/master/bip-0049.mediawiki'>BIP 049</a>.

As suspected though ...

> **Why Is The Firmware Not Open Sourced?**<br>
  We have ongoing Black-Box test teams working to perfecting our codes and we can provide source codes of the Micro-Controller-Unit code and the firmware. However, only the trusted members of the cryptocurrency communities and/or security industry are welcomed to evaluate and audit all of our code and libraries. Thus, if you are interested to see our code, please contact us at support@coolbitx.com for more details. *An NDA (Non-disclosure Agreement) will need to be signed between you and us. This is to ensure that the shared codes are used solely for personal review.

so as we do not claim or want to be the authority and keep all our analysis
transparent, we have to stop here and conclude this product is **not verifiable**.
