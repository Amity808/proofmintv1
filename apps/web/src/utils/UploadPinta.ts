import { pinFileWithPinata, pinJsonWithPinata } from "./pinta";

export async function makeContractMetadata({
  imageFile,
  recipt,
  description,
  serial_number,
  spec,
  ens,
}: {
  imageFile: File;
  recipt: string;
  description?: string;
  serial_number?: string;
  spec?: string;
  ens?: string;
}) {
  // upload image to Pinata
  const imageFileIpfsUrl = await pinFileWithPinata(imageFile);

  // build contract metadata json
  const metadataJson = {
    description,
    image: imageFileIpfsUrl,
    recipt,
    serial_number,
    spec,
    ens,
    external_link: "https://proofmint.eth",
    properties: {
      category: "proof of ship",
    },
  };

  // upload token metadata json to Pinata and get ipfs uri
  const contractMetadataJsonUri = await pinJsonWithPinata(metadataJson);

  return contractMetadataJsonUri;
}
