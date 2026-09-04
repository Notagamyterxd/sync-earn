# EarnSync Hub

# Project: SyncEarn – Professional GPT & Creator Platform



Build a high-performance "Get Paid To" (GPT) and Video Creator website similar to rbxrise.com. The site should have a dark, modern, gaming-inspired UI (Tailwind CSS) and be fully mobile-responsive.



### 1. Database & User System

- **Simple Auth:** Users register and login with just a **Username** and **Password**.

- **User Schema:** Store balance (Robux), Diamonds, referral count, total earned, and account status (Active/Banned).

- **Admin Account:** Create a special administrative check for the username `SyncStation` with password `Arshan&2013` to grant full access to the admin dashboard.



### 2. Earning & Offerwalls

- **Offerwall Integration:** Create a dashboard featuring integrated walls for **Torox**, **Bitcotask**, and **CPX Research**. 

- **Postback Logic:** Set up secure API endpoints to receive postbacks from these providers to automatically credit the user's "Robux" balance upon completion.

- **Promo Codes:** A section in the user dashboard to enter strings for instant Robux or Diamonds. Admin has the power to create and manage these codes.



### 3. The Diamond & Box System

- **Daily Milestone:** If a user earns 100 Robux within a 24-hour window, automatically reward them with **1 Diamond**.

- **Mystery Boxes:** A rewards page where users can spend Diamonds to open boxes. The box should trigger a random reward (e.g., a range between 1–10 Robux) using a weighted probability script.



### 4. Creator Center (Video Rewards)

- **Video Section:** A dedicated page where users can upload or link their videos.

- **Monetization by Views:** Users earn Robux based on views (e.g., a rate of 1 Robux per 100 views). 

- **Admin Moderation:** All uploaded videos must be approved by the Admin in the backend before they are visible or eligible for earnings.



### 5. Withdrawal & Transactions

- **Withdrawal Options:** Create a withdrawal page with buttons for **Robux**, **Litecoin (LTC)**, and **Solana (SOL)**. Add a clear notice that "All other Cryptos are handled via Discord."

- **Manual Approval:** When a user requests a withdrawal, the status is set to "Pending." No funds are moved automatically; the Admin must approve them manually.

- **Transaction History:** A clean table for users to track their withdrawals, showing amount, date, method, and current status (Pending / Approved / Denied).



### 6. Referral & Social Features

- **Multi-Tier Referrals:** 

    - Tier 1: User gets 5% of their direct referral's earnings.

    - Tier 2 & 3: Include smaller percentages for secondary and tertiary referrals.

- **In-Site Chat:** A real-time global chat sidebar or window for all logged-in users.

- **Support Tickets:** A system where users can open a support ticket to communicate with the admin team regarding account or payment issues.



### 7. Admin Panel (SyncStation Only)

- **User Management:** Ability to search for users, ban/unban by IP or Username, and manually add or remove balance (Robux/Diamonds).

- **Withdrawal Queue:** A central list of all pending requests where the admin can click "Approve" (and mark as paid) or "Deny" (with a reason).

- **Site Controls:** Ability to edit page text, manage the video moderation queue, and view site-wide earning statistics.



### Tech Stack Preferences:

- **Frontend:** React, Tailwind CSS, Lucide Icons.

- **Backend:** Node.js/Express.

- **Database:** Supabase or PostgreSQL.



***



Make SyncEarn then A Money Logo with SE

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sync-earn.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c31a9fa5-8366-4348-9070-726631b03ea0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
