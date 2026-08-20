import { db } from "../db";
import { accounts } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";

export type AccountInfo = {
  accountId: string;
  name: string;
  shortName: string;
  status: string;
  subscriptionType: string;
};

export const getAccountInfo = cache(
  async (accountId: string): Promise<AccountInfo | null> => {
    try {
      const [account] = await db
        .select({
          accountId: accounts.accountId,
          name: accounts.name,
          shortName: accounts.shortName,
          status: accounts.status,
          subscriptionType: accounts.subscriptionType,
        })
        .from(accounts)
        .where(eq(accounts.accountId, BigInt(accountId)))
        .limit(1);

      if (!account) {
        return null;
      }

      return {
        accountId: account.accountId.toString(),
        name: account.name,
        shortName: account.shortName?.trim() || account.name,
        status: account.status ?? "",
        subscriptionType: account.subscriptionType ?? "",
      };
    } catch (error) {
      console.error("Error fetching account info:", error);
      return null;
    }
  },
);

export type AccountLegalData = {
  name: string;
  legalName: string;
  accountType: "company" | "person";
  /** Label for tax ID: "CIF" for companies, "NIF" for persons */
  taxIdLabel: string;
  taxId: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  registryDetails: string;
  legalEmail: string;
  privacyEmail: string;
  dpoEmail: string;
  jurisdiction: string;
};

export const getAccountLegalData = cache(
  async (accountId: string): Promise<AccountLegalData | null> => {
    try {
      const [account] = await db
        .select({
          name: accounts.name,
          legalName: accounts.legalName,
          accountType: accounts.accountType,
          taxId: accounts.taxId,
          address: accounts.address,
          phone: accounts.phone,
          email: accounts.email,
          website: accounts.website,
          registryDetails: accounts.registryDetails,
          legalEmail: accounts.legalEmail,
          privacyEmail: accounts.privacyEmail,
          dpoEmail: accounts.dpoEmail,
          jurisdiction: accounts.jurisdiction,
        })
        .from(accounts)
        .where(eq(accounts.accountId, BigInt(accountId)))
        .limit(1);

      if (!account) {
        return null;
      }

      const isCompany = account.accountType === "company";
      const fallbackEmail = account.email?.trim() || "";

      return {
        name: account.name,
        legalName: account.legalName?.trim() || account.name,
        accountType: isCompany ? "company" : "person",
        taxIdLabel: isCompany ? "CIF" : "NIF",
        taxId: account.taxId?.trim() || "",
        address: account.address?.trim() || "",
        phone: account.phone?.trim() || "",
        email: fallbackEmail,
        website: account.website?.trim() || "",
        registryDetails: account.registryDetails?.trim() || "",
        legalEmail: account.legalEmail?.trim() || fallbackEmail,
        privacyEmail: account.privacyEmail?.trim() || fallbackEmail,
        dpoEmail: account.dpoEmail?.trim() || fallbackEmail,
        jurisdiction: account.jurisdiction?.trim() || "",
      };
    } catch (error) {
      console.error("Error fetching account legal data:", error);
      return null;
    }
  },
);
