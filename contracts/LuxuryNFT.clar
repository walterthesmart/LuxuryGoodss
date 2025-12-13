;; title: LuxuryNFT
;; version: 1.0.0
;; summary: An NFT contract for luxury items that can be minted on purchase of a luxury item
;; description: This NFT acts as a Loyalty signature for customers who purchase luxury items,
;; enabling rewards and discounts on future purchases. Upgraded to Clarity 4.

(define-non-fungible-token luxurynfts uint)

;; Constants
(define-constant CONTRACT-NAME "LuxuryNFT")
(define-constant CONTRACT-SYMBOL "LUXE")
(define-constant EMPTY-BUFFER 0x000000000000000000000000000000000000000000000000000000000000000000)

;; Error codes
(define-constant ERR-OWNER-ONLY (err u100))
(define-constant ERR-NOT-TOKEN-OWNER (err u101))
(define-constant ERR-INVALID-SIGNATURE (err u102))
(define-constant ERR-CAP-REACHED (err u103))
(define-constant ERR-INVALID-SIGNER-KEY (err u104))
(define-constant ERR-NON-TRANSFERRABLE (err u105))
(define-constant ERR-INVALID-ADDRESS (err u106))
(define-constant ERR-NOT-APPROVED (err u107))
(define-constant ERR-TOKEN-NOT-FOUND (err u108))
(define-constant ERR-CANNOT-BURN (err u109))

;; State Variables
(define-data-var contract-owner principal tx-sender)
(define-data-var signer-public-key (buff 33) EMPTY-BUFFER)
(define-data-var last-token-id uint u0)
(define-data-var transferrable bool true)
(define-data-var base-uri (string-ascii 256) "")

;; Maps
(define-map nft-approvals uint principal)
(define-map minted-verify-ids uint bool)
(define-map campaign-minted uint uint)
(define-map nft-cids uint uint)

;; Private Functions
(define-private (validate-ownership (token-id uint) (user principal))
  (is-eq user (unwrap! (nft-get-owner? luxurynfts token-id) false))
)

(define-private (validate-approval (token-id uint) (user principal))
  (is-eq user (unwrap! (map-get? nft-approvals token-id) false))
)

(define-private (validate-ownership-or-approval (token-id uint) (user principal))
  (or 
    (validate-ownership token-id user)
    (validate-approval token-id user)
  )
)

(define-private (get-campaign-minted-count (cid uint))
  (default-to u0 (map-get? campaign-minted cid))
)

(define-private (check-under-cap (cid uint) (cap uint)) 
  (or 
    (is-eq cap u0)
    (< (get-campaign-minted-count cid) cap)
  )
)

(define-private (generate-claim-hash (cid uint) (verify-id uint) (cap uint) (owner principal)) 
  (sha256
    (concat 
      (concat 
        (concat 
          (concat 
            (sha256 chain-id)
            (unwrap-panic (to-consensus-buff? contract-caller))
          )
          (unwrap-panic (to-consensus-buff? cid))
        )
        (unwrap-panic (to-consensus-buff? verify-id))
      ) 
      (unwrap-panic (to-consensus-buff? owner))
    )
  )
)

(define-private (verify-signature (cid uint) (verify-id uint) (cap uint) (owner principal) (signature (buff 65))) 
  (secp256k1-verify 
    (generate-claim-hash cid verify-id cap owner)
    signature 
    (var-get signer-public-key)
  )
)

(define-private (generate-token-uri (token-id uint)) 
  (concat (var-get base-uri) (concat (int-to-ascii token-id) ".json"))
)

;; Public Functions
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (var-get transferrable) ERR-NON-TRANSFERRABLE)
    (asserts! (validate-ownership-or-approval token-id tx-sender) ERR-NOT-TOKEN-OWNER)
    (map-delete nft-approvals token-id)
    (nft-transfer? luxurynfts token-id sender recipient)
  )
)

(define-public (set-approval (token-id uint) (operator principal))
  (begin
    (asserts! (validate-ownership token-id tx-sender) ERR-NOT-TOKEN-OWNER)
    (map-set nft-approvals token-id operator)
    (print {event: "approval-granted", token: token-id, operator: operator})
    (ok true)
  )
)

(define-public (claim (cid uint) (verify-id uint) (cap uint) (recipient principal) (signature (buff 65))) 
  (begin
    (asserts! (is-standard recipient) ERR-INVALID-ADDRESS)
    (asserts! (check-under-cap cid cap) ERR-CAP-REACHED)
    (asserts! (not (default-to false (map-get? minted-verify-ids verify-id))) ERR-INVALID-SIGNATURE)
    ;; (asserts! (verify-signature cid verify-id cap recipient signature) ERR-INVALID-SIGNATURE)
    
    (let 
      (
        (new-token-id (+ (var-get last-token-id) u1))
        (new-minted-count (+ (get-campaign-minted-count cid) u1))
      )
      (map-set campaign-minted cid new-minted-count)
      (map-set minted-verify-ids verify-id true)
      (map-set nft-cids new-token-id cid)
      (var-set last-token-id new-token-id)
      (try! (nft-mint? luxurynfts new-token-id recipient))
      (print {
        event: "nft-claimed",
        token: new-token-id,
        campaign: cid,
        verify: verify-id,
        cap: cap,
        recipient: recipient
      })
      (ok new-token-id)
    )
  )
)

;; New Feature: Burn function to destroy tokens
(define-public (burn (token-id uint))
  (begin
    (asserts! (validate-ownership token-id tx-sender) ERR-NOT-TOKEN-OWNER)
    (map-delete nft-approvals token-id)
    (match (nft-burn? luxurynfts token-id tx-sender)
      success (begin
        (print {event: "nft-burned", token: token-id, burner: tx-sender})
        (ok true)
      )
      error ERR-CANNOT-BURN
    )
  )
)

;; Admin Functions
(define-public (set-transferrable (new-state bool)) 
  (begin 
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-OWNER-ONLY)
    (var-set transferrable new-state)
    (print {event: "transfer-state-changed", enabled: new-state})
    (ok true)
  )
)

(define-public (set-contract-owner (new-owner principal)) 
  (begin 
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-OWNER-ONLY)
    (asserts! (is-standard new-owner) ERR-INVALID-ADDRESS)
    (var-set contract-owner new-owner)
    (print {event: "owner-changed", new-owner: new-owner})
    (ok true)
  )
)

(define-public (set-signer-key (new-key (buff 33))) 
  (begin 
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-OWNER-ONLY)
    (asserts! (not (is-eq new-key EMPTY-BUFFER)) ERR-INVALID-SIGNER-KEY)
    (var-set signer-public-key new-key)
    (print {event: "signer-key-updated", new-key: new-key})
    (ok true)
  )
)

;; New Feature: Set base URI for token metadata
(define-public (set-base-uri (new-uri (string-ascii 256)))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-OWNER-ONLY)
    (var-set base-uri new-uri)
    (print {event: "base-uri-updated", new-uri: new-uri})
    (ok true)
  )
)

;; Read-Only Functions
(define-read-only (get-token-count)
  (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (token-id uint))
  (ok
    (match (nft-get-owner? luxurynfts token-id)
      owner (some (generate-token-uri token-id))
      none
    )
  )
)

(define-read-only (get-name) 
  (ok CONTRACT-NAME)
)

(define-read-only (get-symbol) 
  (ok CONTRACT-SYMBOL)
)

(define-read-only (is-transferrable) 
  (ok (var-get transferrable))
)

(define-read-only (get-token-owner (token-id uint))
  (match (nft-get-owner? luxurynfts token-id)
    owner (ok (some owner))
    (err ERR-TOKEN-NOT-FOUND)
  )
)

(define-read-only (get-token-operator (token-id uint))
  (ok (map-get? nft-approvals token-id))
)

(define-read-only (get-signer) 
  (ok (var-get signer-public-key))
)

(define-read-only (get-token-campaign (token-id uint))
  (ok (map-get? nft-cids token-id))
)

(define-read-only (get-campaign-stats (cid uint))
  (ok (get-campaign-minted-count cid))
)

(define-read-only (is-verify-id-used (verify-id uint)) 
  (ok (default-to false (map-get? minted-verify-ids verify-id)))
)

(define-read-only (get-contract-address) 
  (ok contract-caller)
)

(define-read-only (get-base-uri)
  (ok (var-get base-uri))
)
