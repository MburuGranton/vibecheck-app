// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract VibeSplitter is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("VIBE", "VIBE") Ownable(msg.sender) {}

    function buyVibe(address influencer, address merchant, uint256) external payable {
        require(msg.value > 0, "Must send ETH");

        uint256 total = msg.value;
        uint256 merchantAmount = total * 90 / 100;
        uint256 influencerAmount = total * 7 / 100;
        uint256 platformAmount = total * 3 / 100;

        // Transfer ETH to recipients
        (bool successMerchant,) = payable(merchant).call{value: merchantAmount}("");
        require(successMerchant, "Merchant transfer failed");

        (bool successInfluencer,) = payable(influencer).call{value: influencerAmount}("");
        require(successInfluencer, "Influencer transfer failed");

        (bool successPlatform,) = payable(owner()).call{value: platformAmount}("");
        require(successPlatform, "Platform transfer failed");

        // Mint VIBE NFT receipt to buyer
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _mint(msg.sender, tokenId);
    }
}
