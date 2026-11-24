# ReliaTech

A phone-app mockup for ReliaTech Services (Long Beach HVAC). Job, customer, invoice, and estimate records are loaded from Housecall Pro exports. Prices in the picker come from ReliaTech Price Books (confirmed diagnostic / maintenance / labor rates, plus draft and planning flat rates). The page is public — treat the link accordingly.

Open this on an iPhone in Safari (no account or sign-in):

**https://tempmaster-1968.github.io/reliatech-app-mockup/**

This is the permanent address. Future updates are published to the same URL.

## Add to Home Screen (iPhone)

1. Open the link in Safari (not Chrome).
2. Tap the Share button.
3. Tap **Add to Home Screen**.
4. Tap **Add**. The app opens full screen with the ReliaTech icon.

## What’s in the app

Jobs, customers, money, and capture tabs; color-coded job cards from the Housecall Pro import; a Jobs tab that shows in-progress work plus scheduled jobs in the next 14 days, with a Plan visits due preview limited to overdue or due within 14 days, a See all plan visits link, a Show all link for everything else (still in search and on customer pages), and an Unpaid balances link for jobs with a balance but no recent activity; a customer profile with equipment assets (furnace/air handler, coil, condenser/heat pump, and others) and a service plan card (visits marked due, scheduled, done, or overdue); a Plan visits due list on the Jobs tab; a New job button on the customer page that pre-fills the customer and assigns the next ReliaTech job number (starting after reserved plan-visit jobs, currently 25076–25085); time tracking (clock in/out for Steve and independent techs, a running timer, an Acting as tech selector with Steve as admin, a Can edit own times setting that defaults to off, correction requests that Steve approves or rejects with an audit trail, and a Time on site block on the invoice); visit, maintenance, and scope note templates, including a nameplate prompt that saves to the customer’s equipment profile; a mic button that understands clock-in and clock-out commands (Safari’s Web Speech API, with a type-in fallback) and always asks you to confirm first; a three-step New call flow; cooling and heating readings; and a flat-rate price book and estimate preview.

Customer booking links use `book.html?v=<token>`. A customer only sees open weekday-evening and Saturday slots from the published `slots.json` file (free/busy blocks, no event titles or customer details). The customer picks a weekday-evening or Saturday opening, enters a name and phone, and reviews a prefilled text or email to Steve; a copy is saved on that phone. It is not booked until Steve confirms and asks the assistant to put it on his calendar. The Acting as switch and time-edit permissions are not a login and are not secure until there is a shared backend with sign-in.

New jobs, equipment, time entries, notes, readings, estimates, plan-visit times, and booking requests you add in this mockup stay on this phone or browser only (localStorage). They are not uploaded to a shared server. If you clear Safari data or switch phones, they are gone. Rebuild public booking hours with `/workspace/reliatech-setup/scripts/update_slots.py`.
