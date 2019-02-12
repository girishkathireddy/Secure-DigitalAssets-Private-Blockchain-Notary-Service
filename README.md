#  Securing Digital Assets on Private Blockchain
Star Registry Service that allows users to claim ownership of your favorite star in the night sky.
Project developed using Node.js Express Framework, LevelDB to interact with the private blockchain.

REST API has two endpoints
1. Validation request : http://localhost:8000/requestValidation
2. Proof of Existence/Signature Validation   : http://localhost:8000/message-signature/validate
3. Post Block/Star : http://localhost:8000/block
4. Get Block/Star by Hash :  http://localhost:8000/stars/hash/:hash
5. Get Block/Star by Wallet Address :  http://localhost:8000/stars/address/:address
6. Get Block/Star by Block height : http://localhost:8000/block/:height

## Setup 

To setup the project for review do the following:
1. Download the project.
2. Run command __npm install__ to install the project dependencies.
3. Run command __node app.js__ in the root directory.

## 

## Testing the project

Test the project using Postman. Observe an example below

### User Submits a Validation Request  http://localhost:8000/requestValidation

__Input__

```
{
"address": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN"
}
```
__Response__

```
{
    "walletAddress": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN",
    "requestTimeStamp": "1549934521",
    "message": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN:1549934521:starRegistry",
    "validationWindow": 300
}
```

### User will send a validation request for Proof of Existence http://localhost:8000/message-signature/validate

__Input__ 
```
{
"address": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN",
 "signature":"HL232ai6A1cwbubcsTNjjkzvNkOZlRL36MfQcQT8jskzGl26b/uoiwPeb6MJy8LiqaUBm++omHesg8AjKeBQ8Bc="
}
```
__Response__

```
{
    "registerStar": true,
    "status": {
        "address": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN",
        "requestTimeStamp": "1549934521",
        "message": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN:1549934521:starRegistry",
        "validationWindow": 453,
        "messageSignature": true
    }
}
```
### Post the Star http://localhost:8000/block

__Input__ 
```
{
    "address": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN",
    "star": {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "Found star  using https://www.google.com/sky/"
            }
}
```

__Response__

```
{
    "hash": "8a48932827f0e7af13127ad4634ed27fc692425ecbfe387efc42c9ab9e8ae9ae",
    "height": 1,
    "body": {
        "address": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.9",
            "story": "466f756e64207374617220207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star  using https://www.google.com/sky/"
        }
    },
    "time": "1549934779",
    "previousBlockHash": "95c3647073af1de807b16f33892d33a73241715ea40a536d00870abc2205ce05"
}
```
### Get Block by Hash http://localhost:8000/stars/hash/:hash

__Input__ 
```
http://localhost:8000/stars/hash/8a48932827f0e7af13127ad4634ed27fc692425ecbfe387efc42c9ab9e8ae9ae
```

__Response__

```
{
    "hash": "8a48932827f0e7af13127ad4634ed27fc692425ecbfe387efc42c9ab9e8ae9ae",
    "height": 1,
    "body": {
        "address": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.9",
            "story": "466f756e64207374617220207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star  using https://www.google.com/sky/"
        }
    },
    "time": "1549934779",
    "previousBlockHash": "95c3647073af1de807b16f33892d33a73241715ea40a536d00870abc2205ce05"
}
```
### Get Blocks by Wallet Address http://localhost:8000/stars/address/:address
__input__
```
http://localhost:8000/stars/address/1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN
```
__Response__

```
{
    "hash": "8a48932827f0e7af13127ad4634ed27fc692425ecbfe387efc42c9ab9e8ae9ae",
    "height": 1,
    "body": {
        "address": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.9",
            "story": "466f756e64207374617220207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star  using https://www.google.com/sky/"
        }
    },
    "time": "1549934779",
    "previousBlockHash": "95c3647073af1de807b16f33892d33a73241715ea40a536d00870abc2205ce05"
}
```
### Get Block by Height  http://localhost:8000/block/:height

__input__
```
http://localhost:8000/block/1
```
__Response__
```
{
    "hash": "8a48932827f0e7af13127ad4634ed27fc692425ecbfe387efc42c9ab9e8ae9ae",
    "height": 1,
    "body": {
        "address": "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.9",
            "story": "466f756e64207374617220207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star  using https://www.google.com/sky/"
        }
    },
    "time": "1549934779",
    "previousBlockHash": "95c3647073af1de807b16f33892d33a73241715ea40a536d00870abc2205ce05"
}
```
