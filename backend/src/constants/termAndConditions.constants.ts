// backend/src/constants/termAndConditions.constants.ts

import { UpdateTermsDTO } from "@/dtos/settings.dto";




export const SEED_TERMS_DATA: UpdateTermsDTO = {
  generalTerms: [
    `These Terms and Conditions ("Terms") govern your access to and use of the CrowdConnect platform, including the website, mobile application, and all associated services. By registering an account, creating an event, booking a ticket, or otherwise accessing any part of the platform, you agree to be bound by these Terms. If you do not agree, you must not use the platform.`,
    
    `**Introduction & Definitions**
**About CrowdConnect:** CrowdConnect is an online event management and ticketing platform that connects event organisers ("Hosts") with attendees ("Users"). The platform enables Hosts to create, publish, and manage events — both physical (offline) and virtual (online) — and allows Users to discover, book, and attend those events. CrowdConnect acts as an intermediary facilitating these transactions and is not itself the organiser of any event listed on the platform.

**Definitions:** 
- Platform: The CrowdConnect website, mobile application, and all related services, APIs, and tools.
- User: Any individual who creates an account on the Platform, regardless of role.
- Attendee: A User who books or attempts to book a ticket to an event.
- Host: A User who has been approved to create and manage events on the Platform.
- Admin: A CrowdConnect staff member or system with elevated administrative privileges.
- Event: Any event listed on the Platform, whether online or offline, free or paid.
- Booking: A confirmed reservation of one or more tickets for an event.
- QR Code / Token: A signed digital token (JWT) issued per booking that serves as proof of purchase and entry authorisation.
- Ticket: An individual unit of entry for one person, associated with a Booking.
- Hosting Fee: A one-time, non-refundable fee paid by a User to upgrade their account to Host status.
- Commission: A percentage of ticket revenue deducted by CrowdConnect from Host earnings.
- Payout: The transfer of ticket revenue (minus Commission) from CrowdConnect to the Host after event completion.
- Grace Period: A limited window during which an Attendee may cancel a Booking for a full refund following a major event change.`,

    `**Eligibility & Account Registration**
**Eligibility:** You must be at least 18 years of age to create an account and use the Platform. By using the Platform, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms. Use of the Platform is prohibited where such use would violate applicable laws or regulations.

**Account Creation:** Registration is free. You must provide accurate, current, and complete information during registration. Account verification is completed via One-Time Password (OTP) sent to your registered email address or mobile number. You are responsible for maintaining the confidentiality of your account credentials. You are responsible for all activity that occurs under your account. You must notify us immediately if you suspect unauthorised access to your account. Each person may only maintain one personal account. Creating multiple accounts to circumvent restrictions is prohibited.

**Account Roles:** All accounts are created with the default role of "User". Additional roles may be acquired as follows:
- User: can browse events, make bookings, write reviews, and use all standard platform features.
- Host: upgraded from User upon payment of the Hosting Fee and Admin approval. Can create, publish, and manage events.
- Admin: appointed internally by CrowdConnect. Not available to the public.

**Account Suspension & Termination:** We reserve the right to suspend or permanently terminate any account at our discretion if these Terms are violated, fraudulent activity is suspected, or behaviour is harmful to the Platform or its users. Upon termination, you lose access to all features, content, and wallet balances, subject to any required refund obligations. You may request account deletion by contacting us. Deletion may be delayed if outstanding transactions, disputes, or obligations are pending.`,

    `**Prohibited Conduct**
The following activities are strictly prohibited on the Platform. Violation may result in immediate account suspension, termination, and/or legal action:

**For All Users:** Creating multiple accounts or false identities. Providing false, misleading, or fraudulent information in any form. Hacking, scraping, crawling, or otherwise attempting to access the Platform by unauthorised means. Interfering with or disrupting the Platform's infrastructure, servers, or networks. Impersonating any person, organisation, or entity. Transmitting spam, unsolicited messages, or malware. Using the Platform for any unlawful purpose. Selling, transferring, or sublicensing your account or any bookings/tickets to third parties.

**For Hosts:** Creating events that promote illegal activities, hate speech, discrimination, violence, or exploitation. Publishing events that are fictitious, unplanned, or created solely to collect payments. Manipulating event metrics (e.g. fake bookings, inflated view counts). Discriminating against Attendees on the basis of religion, caste, race, gender, nationality, disability, or any other protected characteristic. Charging Attendees outside the Platform for events listed on the Platform.

**For Attendees:** Sharing, reselling, or transferring QR codes or entry tokens to others. Attempting to enter an event with an expired, duplicate, or fraudulently obtained QR code. Abusing the cancellation and refund system through repeated bookings and cancellations. Submitting fraudulent or false reviews.`,

    `**Intellectual Property**
**Platform Content:** All content on the Platform created by CrowdConnect — including the design, logo, branding, software, and documentation — is the exclusive property of CrowdConnect and protected by applicable intellectual property laws. You may not copy, reproduce, modify, distribute, or create derivative works from Platform content without our prior written consent.

**User-Generated Content:** By submitting any content to the Platform (event descriptions, event posters, organization logos, reviews, messages), you grant CrowdConnect a non-exclusive, worldwide, royalty-free licence to use, store, display, and distribute that content in connection with the Platform. You expressly warrant that you own or possess the necessary copyright and intellectual property rights for any Organization Logo or promotional imagery you upload. You represent that you own or have the right to submit all content you post, and that your content does not infringe the intellectual property rights of any third party. CrowdConnect reserves the right to remove any content that violates these Terms or is otherwise objectionable.

**AI-Generated Content:** Event posters generated using the Platform's AI tools may be uploaded and published by the Host. The Host takes full responsibility for the content of AI-generated images, including ensuring they do not infringe third-party rights. CrowdConnect makes no claim of ownership over AI-generated posters but does not warrant their originality or freedom from copyright claims.`,

    `**Privacy & Data**
Your use of the Platform is subject to our Privacy Policy, which is incorporated into these Terms by reference. By using the Platform, you consent to the collection, storage, and processing of your personal data as described in our Privacy Policy. CrowdConnect collects data including name, email, phone number, location, device information, and usage behaviour for the purpose of operating and improving the Platform. CrowdConnect does not sell your personal data to third parties for advertising purposes. Payment data is handled exclusively by Razorpay. CrowdConnect does not store payment card details. Location data (used for "Events Near Me") is only accessed with your explicit permission and is not stored persistently. You may request access to, correction of, or deletion of your personal data by contacting us through the Platform.`,

    `**Notifications & Communications**
By creating an account, you agree to receive transactional notifications (booking confirmations, QR codes, event updates, refund confirmations) via email, SMS, push notification, and/or WhatsApp. You may opt out of promotional or marketing communications at any time via your account settings. Opting out of transactional notifications may affect your ability to use the Platform effectively. CrowdConnect will send critical notifications — including Major Event Change alerts, Grace Period notices, and cancellation notices — regardless of your notification preferences, as these are essential to your use of the Platform.`,

    `**Disclaimers & Limitation of Liability**
**Platform Role:** CrowdConnect is a facilitating marketplace. We are not the organiser, promoter, or operator of any event listed on the Platform. We do not control the quality, safety, legality, or accuracy of events created by Hosts. Attendance at any event is at your own risk. CrowdConnect is not responsible for any injury, loss, damage, or harm arising from attending any event.

**No Warranties:** The Platform is provided "as is" and "as available" without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or uninterrupted availability. CrowdConnect does not guarantee that the Platform will be free from errors, bugs, or security vulnerabilities, or that events will always be available for booking.

**Limitation of Liability:** To the maximum extent permitted by applicable law, CrowdConnect's total liability to you for any claim arising out of or relating to these Terms or your use of the Platform will not exceed the amount you paid in the 12 months preceding the claim. CrowdConnect will not be liable for: indirect, incidental, consequential, or punitive damages; loss of profit, data, or goodwill; or any harm arising from third-party actions, including event cancellations, fraud by Hosts, or payment processor failures.

**Force Majeure:** CrowdConnect is not liable for any failure to perform its obligations under these Terms due to causes beyond its reasonable control, including natural disasters, pandemics, government orders, power failures, or internet outages.`,

    `**Indemnification**
You agree to defend, indemnify, and hold harmless CrowdConnect and its officers, directors, employees, and partners from and against any claims, damages, losses, liabilities, costs, and expenses (including legal fees) arising from: your use of the Platform, your violation of these Terms, your violation of any applicable law, any content you submit or event you create on the Platform, or your interaction with other users.`,

    `**Changes to These Terms**
CrowdConnect reserves the right to modify these Terms at any time. We will notify you of material changes via email and/or a prominent notice on the Platform. The effective date of the updated Terms will be displayed at the top of this document. Your continued use of the Platform after the effective date of any changes constitutes your acceptance of the updated Terms. If you do not agree to the updated Terms, you must discontinue use of the Platform and may request account deletion.`,

    `**Governing Law & Dispute Resolution**
These Terms are governed by and construed in accordance with the laws of India, without regard to conflict of law principles. Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in India. Before initiating formal legal proceedings, you agree to first contact CrowdConnect and attempt to resolve the dispute in good faith within 30 days. If the dispute cannot be resolved informally, it may be referred to arbitration under the Arbitration and Conciliation Act, 1996 (India), as amended from time to time.`,

    `**Contact Information**
For questions, complaints, or support related to these Terms or the Platform, please contact us at:
- Email: support@crowdconnect.com
- Website: www.crowdconnect.com

By creating an account, upgrading to Host, making a booking, or creating an event on CrowdConnect, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions in their entirety.
— CrowdConnect Team`
  ],

  hostTerms: [
    `**Host Role & Verification**
**Eligibility to Become a Host:** Any User may apply to become a Host by paying the one-time Hosting Fee via the Platform. The Hosting Fee amount is set by CrowdConnect and may be updated from time to time. The fee applicable at the time of your application will be communicated clearly before payment. The Hosting Fee is non-refundable under any circumstances, including if your application is rejected or your Host status is later revoked.

**Verification Process:** After paying the Hosting Fee, you must submit a Host Upgrade Request including: Organisation Name, Organization Description, Organization Logo, Registration Number (if applicable), and Official Business Document or Certificate. CrowdConnect Admin will review the submitted information and documents. Approval is at the sole discretion of CrowdConnect. We may request additional documentation or information. Providing false, misleading, or fraudulent information during verification will result in immediate rejection, account suspension, and no refund of the Hosting Fee. The verification process timeline is indicative only. CrowdConnect does not guarantee approval within any specific timeframe.

**Host Responsibilities:** Hosts are solely responsible for the accuracy, legality, and fulfilment of the events they create and publish. Hosts must ensure that all events comply with applicable laws and regulations, including those relating to public gatherings, health and safety, licensing, and intellectual property. Hosts must maintain the capability to host any event they publish. Publishing an event you do not intend to hold, or knowingly misrepresenting event details, is strictly prohibited. Hosts must promptly notify Attendees and update the Platform if event details change materially. Hosts agree that CrowdConnect may review, remove, or suspend any event that violates these Terms, our policies, or applicable law — without prior notice. 

**Public Profile & Ratings:** By upgrading to a Host account, you agree to make your Organization Name, Organization Description, Organization Logo, Business Address, and aggregated event ratings publicly visible on the Platform via a Public Organiser Profile. You understand that Attendee reviews and ratings are outside of CrowdConnect's direct control, and CrowdConnect is not liable for any impact these public ratings may have on your business.

**Revocation of Host Status:** CrowdConnect reserves the right to revoke Host status at any time for violations of these Terms, repeated or serious complaints, fraudulent activity, or any other reason at our discretion. Revocation of Host status does not entitle the Host to a refund of the Hosting Fee. Any pending payouts at the time of revocation will be reviewed and processed only after verification of event completion and compliance with these Terms.`,

    `**Event Creation & Listing**
**Event Information:** Hosts must provide accurate and complete information for every event, including: title, description, category, event format (online or offline), start and end date/time, venue/location details (for offline events), maximum attendee capacity, ticket type (free or paid), and ticket price (if paid). All event information must be truthful. Misleading descriptions, exaggerated claims, or false representations of any kind are prohibited. Event categories must reflect the actual nature of the event. Miscategorisation intended to increase visibility or mislead users is a violation of these Terms.

**Event Format:** Events may be created as "Offline" (in-person, at a physical location) or "Online" (virtual, via an integrated meeting link). Once any ticket has been sold for an event, the event format cannot be changed. The Host must cancel the event and create a new one to change the format. For online events, a meeting link (Jitsi Meet room) is automatically generated and stored when the event is published. This link is not disclosed to attendees until they validate their QR code at event entry time.

**Event Publishing:** Events are created in "Draft" status and are not visible to the public until the Host manually publishes them. No per-event Admin approval is required for publishing. Hosts publish at their own responsibility. CrowdConnect reserves the right to review any published event and suspend or cancel it if it violates these Terms or our community standards, without prior notice to the Host. Draft events may be edited freely. Once published, certain changes may trigger Attendee notification and grace period obligations.

**Capacity & Availability:** Hosts set the maximum number of attendees (capacity) for each event. Ticket availability decreases as bookings are confirmed. CrowdConnect does not guarantee that any event will reach its target attendance or sell any tickets. Hosts must not artificially inflate ticket demand, create fake bookings, or manipulate attendance figures.

**AI-Generated Posters:** The Platform offers an AI poster generation tool (powered by third-party AI APIs) to help Hosts create event banners. AI-generated images are uploaded to the Platform's storage on final event submission. The Host is responsible for reviewing the generated image before submitting. Hosts must not use AI generation to create images that are offensive, defamatory, infringing, or otherwise in violation of these Terms or applicable law. CrowdConnect does not guarantee the accuracy, originality, or appropriateness of AI-generated content and accepts no liability for issues arising from its use.`,
    
    `**Payout Requests**
**Eligibility for Payout:** Hosts become eligible to request a payout after the event's scheduled end date and time has passed and the event status is "Completed". Payouts are not available for events that are "Cancelled", "Suspended", or under active investigation. Hosts must have a valid, verified bank account or payment destination registered with the Platform to receive a payout.

**Payout Request Process:** The Host submits a Payout Request via the Host Dashboard after the event has completed. CrowdConnect Admin will review the request and verify that: the event was held as described, there are no outstanding complaints or disputes, and no active cancellation or refund requests are pending resolution. Upon successful verification, CrowdConnect will initiate the payout of the net amount (ticket revenue minus Platform Commission minus any processed refunds) to the Host's registered payment account. Payout processing time is typically 5–10 business days from Admin approval but may vary.

**Deductions from Payout:**
- Platform Commission: deducted at the agreed percentage from total ticket revenue.
- Refunds processed: any refunds paid to Attendees (including Grace Period refunds) are deducted from the payout.
- Chargebacks or disputes: if any payment is reversed by a payment processor or bank, the corresponding amount is deducted from the payout.
- Any other amounts owed to CrowdConnect under these Terms.

**Withheld Payouts:** CrowdConnect reserves the right to withhold, delay, or offset any payout in cases of: suspected fraud or misrepresentation, active disputes or complaints from Attendees, ongoing Admin review or investigation, or violation of these Terms. Withheld payouts will be resolved and released once the relevant issue is resolved, or forfeited in cases of confirmed fraud or serious violations.

**Unclaimed Payouts:** If a Host does not submit a payout request within 90 days of the event completion date, the unclaimed funds may be forfeited to CrowdConnect. Hosts will be notified in advance of this deadline.`
  ],

  bookingTerms: [
    `**Booking & Tickets**
**Making a Booking:** Bookings are made through the Platform. A booking is confirmed only after successful payment processing via Razorpay and receipt of a booking confirmation. You will receive a confirmation notification (email and in-app) containing your QR code/token upon confirmed booking. A booking confirmation does not guarantee entry if you violate these Terms, arrive outside the event time window, or present an invalid or used QR code.

**Booking Rules by Event Format:**
- Max tickets per booking: Online events are strictly 1 ticket per booking. Offline events allow up to 10 tickets per booking.
- Multiple bookings for same event: Online is strictly prohibited (one active booking per User per online event). Offline is permitted up to a combined maximum of 20 tickets per User per event.
- Reason for online limit: Each online attendee requires their own device and individual join link. Shared access defeats the purpose of individual ticketing.
- Reason for offline cap: Prevents ticket hoarding and scalping while allowing legitimate group bookings.

**QR Code / Entry Token:** Each confirmed booking is issued one QR code (a signed JWT token) regardless of the number of tickets in the booking. The QR code is proof of purchase and entry authorisation. You must present it at the event (offline) or use it via the in-app "Join Event" button (online). QR codes are valid only during the event time window, starting 30 minutes before the event start time and closing at the event end time. QR codes become permanently invalid once all tickets in the booking have been used (i.e. all attendees in the booking have entered the event). QR codes are non-transferable. The token is tied to your booking and account. Sharing or selling QR codes is prohibited. CrowdConnect is not responsible for loss, theft, or unauthorised use of your QR code. Treat your QR code as a confidential entry credential.

**Partial Group Entry (Offline Events):** For offline bookings with multiple tickets, the QR code supports incremental entry. Not all members of a group need to arrive simultaneously. The event guard will scan the QR code and record how many individuals are entering in each batch. The remaining unused tickets are tracked. The QR code remains valid until all tickets in the booking have been used. Once all tickets are used, the QR code is permanently invalid and cannot be used for re-entry or additional entry.

**Online Event Entry:** For online events, Attendees do not physically scan a QR code. Instead, the "Join Event" button in the Platform app becomes active 30 minutes before the event start time. Tapping "Join Event" triggers an automatic validation of your booking and, if successful, provides a unique join link to the event's virtual room. The join link is provided only once per booking upon successful validation. Attempting to join a second time will be declined as the booking will be marked as used. Sharing your join link with others who do not hold a valid booking may result in their removal from the event and your account being flagged.

**Booking Prices & Snapshots:** The ticket price at the time of booking confirmation is permanently locked to that booking. This price is stored as a snapshot and will never change, regardless of any subsequent price changes made by the Host. All refunds are calculated using the locked booking price, not the current event price. CrowdConnect is not obligated to offer price adjustments if the event price decreases after your booking (unless a Grace Period is applicable).`,

    `**Payments & Fee Structure**
**Payment Processing:** All payments on the Platform are processed by Razorpay, a third-party payment service provider. By making a payment, you agree to Razorpay's terms and conditions and privacy policy in addition to these Terms. CrowdConnect does not store full payment card details. All sensitive payment information is handled securely by Razorpay. Payments are denominated in Indian Rupees (₹) unless otherwise specified. All amounts displayed are inclusive of applicable taxes unless otherwise stated.

**Fee Structure:**
- Hosting Fee: A one-time, non-refundable fee paid by a User to upgrade to Host status. Amount displayed during the upgrade process.
- Ticket Price: Set by the Host for paid events. Paid by the Attendee at time of booking. Free events have no ticket price.
- Platform Commission: 5% to 10% of the total ticket price per booking. The exact percentage is configurable by CrowdConnect and will be displayed to the Host before event creation. Commission is deducted from Host payouts.
- Transaction Fees: Razorpay may apply transaction processing fees. These are absorbed by CrowdConnect and are not passed directly to Users or Hosts unless explicitly stated.

**Ticket Revenue Holding Model:** All ticket payments made by Attendees are received and held in CrowdConnect's account at the time of booking. CrowdConnect does not immediately transfer ticket revenue to Hosts. Revenue is held until the Host submits a payout request after the event has completed. This model protects Attendees from fraud involving events that are never held. Funds are released only after verification that the event took place. Hosts agree to this payment model as a condition of using the Platform.

**Free Events:** Hosts may create free events (no ticket price). No payment is required from Attendees for free events. No Platform Commission applies to free events. Free events require a booking confirmation and valid QR code for entry, the same as paid events.`,

    `**Wallet & Credits**
**Platform Wallet:** Each User account includes a digital wallet that may hold credits, refunds, referral rewards, and review incentives. Wallet credits may be applied toward future bookings on the Platform, subject to applicable terms. Wallet credits have no cash value and cannot be transferred to another user or withdrawn as cash unless explicitly stated otherwise. Wallet credits expire from the date of issuance unless otherwise specified.

**Referral Credits:** Users may earn referral credits by inviting new Users to the Platform through their unique referral link. Credits are awarded only when the referred User successfully completes a qualifying action (e.g. makes their first booking). Referral credits may not be earned through fraudulent means, including creating fake accounts or self-referral. CrowdConnect reserves the right to modify, suspend, or terminate the referral programme at any time.`
  ],

  cancellationTerms: [
    `**Event Modification**
**Permitted Modifications:** Hosts may edit event details at any time before the event ends. Minor corrections (e.g. fixing a typo, updating contact information) are permitted and do not require Attendee notification. Significant changes — defined below — will automatically trigger Attendee notifications and a refund grace period.

**Major Event Changes:**
The following are considered "Major Changes" that require automatic Attendee notification and trigger a Grace Period for full refunds: 
- Change to the event start date and/or time.
- Change to the event end date and/or time.
- Change to the venue name (for offline events).
- Change to the event location coordinates where the new location is more than 2 kilometres from the original location (haversine distance).
- Decrease in ticket price (new price is lower than the price at which existing Attendees booked).
- Change from a paid event to a free event (which constitutes a price decrease).

The following changes are NOT considered Major Changes and do not trigger a Grace Period: 
- Ticket price increase — existing Attendees retain their originally booked price. New Attendees pay the updated price.
- Change from a free event to a paid event — existing Attendees booked at no cost and will not be charged retroactively.
- Changes to title, description, or category — these do not affect the logistics of attendance.
- Increase in event capacity.
- Minor location correction of less than 2 km (e.g. changing the entry gate at the same venue).

**Grace Period for Major Changes:** When a Major Change is made to a published event with confirmed bookings, all confirmed Attendees will be notified via email, SMS, push notification, and/or WhatsApp (as per their notification preferences). Affected Attendees are granted a Grace Period during which they may cancel their booking and receive a 100% refund, regardless of the standard cancellation policy. Grace Period duration: the shorter of (a) the time remaining until the event start or (b) 48 hours from the time the change was made. Attendees who do not cancel within the Grace Period are deemed to have accepted the changed event terms and forfeit their right to a full refund under the Grace Period (standard cancellation policy applies thereafter). The Grace Period applies per Major Change event. Multiple simultaneous changes are treated as a single triggering event.

**Responsibility for Changes:** Hosts are solely responsible for any inconvenience, loss, or cost incurred by Attendees as a result of event modifications. CrowdConnect will process Grace Period refunds as described in our policies but reserves the right to recover the refunded amounts from the Host's pending or future payouts where applicable.`,
    
    `**Event Cancellation & Suspension**
**Host Cancellation:** Hosts may cancel a published event at any time before the event start time via the Host Dashboard. Upon host cancellation: all confirmed Attendees will receive a 100% refund of their ticket price. All Attendees will be notified immediately via all available notification channels. The event will be marked as "Cancelled" and no further bookings will be accepted. The Hosting Fee is non-refundable even if the Host cancels all their events. Repeated event cancellations without legitimate cause may result in suspension of Host privileges and/or additional verification requirements.

**Admin Suspension or Cancellation:** CrowdConnect Admin may suspend or cancel any event at any time for any of the following reasons: Fraud or misrepresentation by the Host; Violation of these Terms, community standards, or applicable law; Credible safety or security concerns; Intellectual property complaints; Regulatory or legal requirements; Any other reason at CrowdConnect's sole discretion. In the event of Admin cancellation: Attendees will receive a 100% refund. The Host will be notified. Any pending payouts may be withheld pending investigation. CrowdConnect is not liable to the Host for any loss of revenue, reputation, or business opportunity resulting from Admin cancellation of an event.

**Suspended Events:** An event may be placed in "Suspended" status during an ongoing review. While suspended: the event is not visible to new users, no new bookings are accepted, and existing confirmed bookings are held pending the outcome of the review. If the suspension results in cancellation, all confirmed Attendees will be refunded in full. If the suspension is lifted, the event is restored to its previous status.`,
    
    `**Cancellation & Refunds**
**Attendee Cancellation — Standard Policy:**
- 48 hours or more before event start: 100% refund of ticket price paid.
- Less than 48 hours before event start: 50% refund of ticket price paid.
- After event start time: No refund. The booking is considered used.
- After QR code has been fully used: No refund under any circumstances.

Cancellations must be initiated by the Attendee through the Platform (via their Profile or Booking History). Cancellations affect the individual booking only. Other Attendees' bookings for the same event are unaffected. Platform Commission is retained by CrowdConnect in all refund scenarios. Refunds are paid from the funds held by CrowdConnect (not from the Host directly). Refunds are processed via the original payment method through Razorpay. Processing time depends on your bank or payment provider (typically 5–10 business days).

**Grace Period Refunds (Following Major Event Changes):** If the Host makes a Major Change to a published event with confirmed bookings, affected Attendees are entitled to a 100% refund if they cancel within the Grace Period. Grace Period refunds override the standard cancellation policy. A 100% refund is issued regardless of how close to the event start time the cancellation is made, provided it is within the Grace Period window. Attendees who choose to keep their booking after receiving a Major Change notification accept the updated event details and waive their Grace Period refund right for that change.

**Host Cancellation Refunds:** If the Host cancels the event, all confirmed Attendees receive a 100% refund automatically, regardless of the time of cancellation or any other policy. These refunds are processed as promptly as possible and are subject to standard payment processing timelines.

**Admin Cancellation Refunds:** If CrowdConnect cancels an event due to policy violations, fraud, or other administrative reasons, all confirmed Attendees will receive a 100% refund. CrowdConnect will not be liable to the Host for any losses resulting from Admin cancellation.

**Non-Refundable Situations:**
- Failure to attend the event (no-show) — no refund.
- Cancellation requested after the event has started.
- Cancellation after the QR code has been fully used (all tickets entered).
- Cancellation due to personal reasons outside the Grace Period.
- Hosting Fee — non-refundable under any circumstances.
- Platform Commission — non-refundable in all scenarios.

**Dispute Resolution for Refunds:** If you believe a refund has been incorrectly calculated or denied, you may raise a dispute through the Platform's support system. CrowdConnect will review disputes on a case-by-case basis. Our decision is final. CrowdConnect is not responsible for delays caused by payment processors or banking institutions.`
  ],

  reviewTerms: [
    `**Reviews & Ratings**
**Platform Reviews:** The review and rating system on CrowdConnect allows Attendees to rate the quality of specific events they have attended. Users may submit a star rating (1–5) and written comment about their overall experience with the events. These event ratings are aggregated to generate an overall performance rating for the Host. Attendees may only submit one review per attended event. Reviews cannot be submitted for events that were cancelled, suspended, or not attended. Reviews are subject to moderation. CrowdConnect reserves the right to remove reviews that are: offensive, defamatory, factually false, spam, or irrelevant. By submitting a review, you grant CrowdConnect a non-exclusive, royalty-free, perpetual licence to display and use your review on the Platform.`
  ]
};