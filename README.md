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

Jobs, customers, money, and capture tabs; color-coded job cards from the Housecall Pro import; a customer profile with equipment assets (furnace/air handler, coil, condenser/heat pump, and others); a New job button on the customer page that pre-fills the customer and assigns the next ReliaTech job number (starting at 25076); time tracking (clock in/out for Steve and independent techs, a running timer, manual timestamp edits with a required reason, and a Time on site block on the invoice); visit, maintenance, and scope note templates, including a nameplate prompt that saves to the customer’s equipment profile; a mic button that understands clock-in and clock-out commands (Safari’s Web Speech API, with a type-in fallback) and always asks you to confirm first; a three-step New call flow; cooling and heating readings; and a flat-rate price book and estimate preview. New jobs, equipment, time entries, notes, readings, and estimates you add in this mockup stay on this phone or browser only (localStorage). They are not uploaded to a shared server. If you clear Safari data or switch phones, they are gone.
