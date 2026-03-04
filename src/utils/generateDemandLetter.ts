export interface DemandLetterProps {
  companyName: string; // ✅ Added
  customerName: string;
  demandAmount: number;
  flatNumber: string;
  floor: string;
  project: string;
  block?: string;
  tower?: string;
  projectAddress: string;
}

export function generateDemandLetter({
  companyName,
  customerName,
  demandAmount,
  flatNumber,
  floor,
  project,
  block,
  tower,
  projectAddress,
}: DemandLetterProps): string {
  const today = new Date().toLocaleDateString("en-IN");

  // ✅ Build Block/Tower only if provided
  let blockTowerPart = "";

  if (block) {
    blockTowerPart += ` Block ${block}`;
  }

  if (tower) {
    blockTowerPart += ` Tower ${tower}`;
  }

  return `
${companyName.toUpperCase()}                                   Phone: 9876543210

                              DEMAND LETTER

Date: ${today}

To,
${customerName}

We would like to request you to make the part payment of Rs. ${demandAmount.toLocaleString(
    "en-IN"
  )} only i.e. towards the purchase of Flat ${flatNumber}, Floor ${floor} of Project ${project}${blockTowerPart} situated at ${projectAddress}.

This demand letter is submitted as per mode of payment mentioned.

Upon receiving the demand letter, we would like you to feel obligated and make payment on an urgent basis to avoid any further late payment expenses.


-------------------------------------------------------------

Bank Account Details

Name of the A/c Holder: ${companyName.toUpperCase()}
Bank Name: INDUSIND BANK
Bank Address: Gariahat Branch
A/c No.: 259831918066
IFSC CODE: INDB0000029

-------------------------------------------------------------

Yours sincerely,

______________________
(Manager Post Sales)
`;
}