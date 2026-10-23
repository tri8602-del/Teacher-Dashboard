# Firestore rules for V4.8.0 online contracts (proposal, not deployed)

`calcAcks.rules` is the block to add to the live Firestore rules (Firebase console → Firestore → Rules).
Nothing else changes; the existing `users/{uid}` rules stay as they are.

- `calcAcks/{token}`: one record per printed contract. The token is a random 40-character code that is only in that contract's link and QR code.
- Public (no sign-in): can read one record **only** by its exact token, and can sign it **once** (name, "I agree", server time). It cannot list, create, or delete records, or change the contract text.
- Teacher (signed in): creates, reads, re-issues, and deletes her own records.
- Until this is deployed, printing still works (paper signatures); the online link shows "could not be loaded".

`test.rules` = example owner-only `users/{uid}` rules + this block, used only for the local emulator test.
