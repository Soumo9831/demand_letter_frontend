import { companyLogos } from "@/assets/CompanyLogos";
import type { Demand } from "@/types/DemandType";
import React from "react";

interface Props {
  demand: Demand;
}

/* =========================
   Helpers
========================= */

const formatCurrency = (amount: number) =>
  `₹ ${Number(amount).toLocaleString("en-IN")}`;

const formatDate = (iso: string) => {
  const [year, month, day] = iso.split("T")[0].split("-");
  return `${parseInt(day)}-${month}-${year}`;
};

/* =========================
   Component
========================= */

import { useLocation } from "react-router-dom";

const DemandLetterPage = () => {
  const location = useLocation();
  const demand = location.state?.demand;

  if (!demand) {
    return <div>No Demand Data</div>;
  }

  return <DemandLetter demand={demand} />;
};

export default DemandLetterPage;

const DemandLetter: React.FC<Props> = ({ demand }) => {
  const {
    createdAt,
    demandAmount,
    demandPercentage,
    _id,

    flatNumber,
    floor,
    block,
    tower,
    project,
    projectAddress,
    companyName,

    bankDetails,

    invoiceSnapshot: { advance, customer },
  } = demand;

  const handlePrint = () => window.print();

  const customerName = customer?.name || "Customer";

  return (
    <>
      {/* PRINT FIX */}
      <style>
        {`
        @media print {

          body{
            background:white;
          }

          .demand-letter{
            border:none !important;
            box-shadow:none !important;
          }

          .actions{
            display:none !important;
          }

        }
        `}
      </style>

      <div style={styles.wrapper}>
        <div className="demand-letter" style={styles.letter}>
          {/* HEADER */}

          <div style={styles.header}>
            {/* Left Logo */}
            <div style={styles.logoContainer}>
              <img
                src={
                  companyLogos[companyName as string] ||
                  "/assets/default-logo.png"
                }
                alt="Company Logo"
                style={styles.logo}
              />
            </div>

            {/* Center Company Info */}
            <div style={styles.companyInfo}>
              <h1 style={styles.companyName}>
                {companyName || "UNIQUE REALCON"}
              </h1>

              <div style={styles.address}>
                3002, Plot EB-46 Rajdanga Main Road, Kolkata – 700107
              </div>
            </div>

            {/* Right Phone */}
            <div style={styles.phone}>📞 033-4502 5892</div>
          </div>

          {/* TITLE */}

          <h3 style={styles.title}>Demand Letter</h3>

          {/* DATE + REF */}

          <div style={styles.row}>
            <div>Date: {formatDate(createdAt)}</div>

            <div>Ref No: {_id}</div>
          </div>

          {/* TO */}

          <div style={{ marginTop: 20 }}>
            <strong>To</strong>

            <div>Name: {customerName}</div>
          </div>

          {/* BODY */}

          <div style={styles.body}>
            <p>Dear Sir/Madam,</p>

            <p>
              This is to inform you that, as per the payment schedule mentioned
              in the Agreement for the purchase of Flat No. {flatNumber}{" "}
              {floor ? `, Floor ${floor}` : ``}{" "}
              {block ? `, Block-${block}` : ``}{" "}
              {tower ? `, Tower-${tower}` : ``} {project}, situated at{" "}
              {projectAddress}, a payment of {formatCurrency(demandAmount)} has
              become due.
            </p>
            <br />

            <p>
              We would like to confirm that you have already made a payment of
              {formatCurrency(advance)} towards the said flat. Therefore, the
              outstanding balance payable is{" "}
              {formatCurrency(demandAmount - advance)}, which we kindly request
              you to pay at the earliest as per the agreed payment terms.
            </p>
            <br />

            <p>
              You are requested to make the payment upon receipt of this demand
              letter to avoid any late payment charges or penalties as per the
              terms of the agreement.
            </p>
            <br />
          </div>

          <div style={styles.bankSection}>
            <h4 style={styles.bankTitle}>Bank Account Details</h4>

            <table style={styles.bankTable}>
              <tbody>
                <tr>
                  <td style={styles.bankLabel}>Name of the A/c Holder</td>
                  <td>: {companyName?.toUpperCase()}</td>
                </tr>

                <tr>
                  <td style={styles.bankLabel}>Bank Name</td>
                  <td>: {bankDetails?.bankName}</td>
                </tr>

                <tr>
                  <td style={styles.bankLabel}>Bank Branch</td>
                  <td>: {bankDetails?.bankAddress}</td>
                </tr>

                <tr>
                  <td style={styles.bankLabel}>A/c No.</td>
                  <td>: {bankDetails?.accountNumber}</td>
                </tr>

                <tr>
                  <td style={styles.bankLabel}>IFSC CODE</td>
                  <td>: {bankDetails?.ifscCode}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* STATUS */}

          <div style={styles.status}>
            <strong>Current Status of the Flat:</strong>{" "}
            {demandPercentage < 100 ? "UNDER CONSTRUCTION " : "CONSTRUCTION "}
            {demandPercentage}% COMPLETED
          </div>

          {/* SIGNATURE */}

          <div style={styles.signature}>
            Yours sincerely,
            <br />
            <br />
            <br />
            <p>----------------------------</p>
            <br />
            (Manager Post Sales)
            <br />
          </div>
        </div>

        {/* ACTIONS */}

        <div className="actions" style={styles.actions}>
          <button style={styles.printBtn} onClick={handlePrint}>
            Print / Download
          </button>
        </div>
      </div>
    </>
  );
};

/* =========================
   Styles
========================= */

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    background: "#fff",
    padding: 20,
    fontWeight: 500,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "2px solid #ccc",
    paddingBottom: 10,
    marginBottom: 20,
  },

  logoContainer: {
    flex: 1,
  },

  logo: {
    height: 55,
  },

  companyInfo: {
    flex: 3,
    textAlign: "center",
  },

  companyName: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: 1,
  },

  address: {
    fontSize: 12,
    color: "#444",
  },

  phone: {
    flex: 1,
    textAlign: "right",
    fontSize: 12,
  },

  letter: {
    maxWidth: 820,
    margin: "auto",
    padding: 30,
    fontSize: 13,
    lineHeight: 1.6,
    border: "1px dashed #999",
  },

  companyAddress: {
    fontSize: 12,
  },

  title: {
    textAlign: "center",
    textDecoration: "underline",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 20,
  },

  subject: {
    marginTop: 20,
  },

  body: {
    marginTop: 10,
  },

  status: {
    marginTop: 20,
  },

  signature: {
    marginTop: 40,
  },

  actions: {
    maxWidth: 820,
    margin: "20px auto",
    display: "flex",
    justifyContent: "flex-end",
  },

  printBtn: {
    padding: "10px 18px",
    border: "none",
    background: "#2c3e50",
    color: "#fff",
    cursor: "pointer",
  },
  bankSection: {
    marginTop: 25,
  },

  bankTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
  },

  bankTable: {
    borderCollapse: "collapse",
    fontSize: 13,
  },

  bankLabel: {
    fontWeight: 500,
    paddingRight: 20,
    paddingBottom: 4,
  },
};
