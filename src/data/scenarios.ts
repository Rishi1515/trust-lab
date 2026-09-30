import type { ScenarioRecord } from '../types/scenario';

/**
 * Scenario bank. Frozen at the version below; any change to facts, actions, correct actions
 * or advice text must bump the version and be recorded in docs/scenario_review_log.md.
 *
 * Every scenario is fictional. Each record holds the ground truth (correctActionId) and two
 * advice variants written from the same facts: one that recommends the documented action and
 * one that recommends a plausible wrong action with a traceable reasoning error.
 */
export const SCENARIO_BANK_VERSION = '1.0.0';

export const WARMUP: ScenarioRecord = {
  id: 'WARM-00',
  domain: 'expense-review',
  title: 'Stationery reimbursement',
  brief: 'An employee claims back the cost of printer paper bought for the office.',
  facts: [
    { label: 'Claim', value: '$38.40 for 4 reams of printer paper' },
    { label: 'Receipt', value: 'Itemised store receipt attached, dated 6 days ago' },
    {
      label: 'Policy',
      value: 'Office purchases under $50 need no pre-approval if an itemised receipt is attached and the claim is filed within 30 days.',
    },
    { label: "Employee's claims this month", value: 'This is the first' },
  ],
  actions: [
    { id: 'approve', label: 'Approve the claim', investigative: false, outcome: 'The employee is reimbursed $38.40. The claim meets every condition in the policy.' },
    { id: 'reject', label: 'Reject the claim', investigative: false, outcome: 'A valid claim is refused, and the employee has to escalate it. Both of you lose time.' },
    { id: 'ask', label: 'Hold and ask for more information', investigative: true, outcome: 'The claim waits a week to confirm what the claims record already shows: there is no other claim.' },
  ],
  correctActionId: 'approve',
  advice: {
    correct: {
      actionId: 'approve',
      explanation: 'The amount is under $50, the receipt is itemised and the claim is inside the 30-day window, so no pre-approval is needed.',
    },
    incorrect: {
      actionId: 'ask',
      explanation: 'Paper purchases are easy to split across several claims, so confirming there is no second claim for the same purchase is a sensible precaution.',
      reasoningError: "There is no sign of a split purchase: this is the employee's first claim this month and the total is under the limit.",
    },
  },
  consequence: 'Small, well-documented claims are the easy case. Approving promptly is the control working as designed.',
  learningNote: 'Check the claim against each condition in the policy, then decide. Here every condition is visibly met.',
  difficulty: 1,
};

export const SCENARIOS: ScenarioRecord[] = [
  {
    id: 'EXP-01',
    domain: 'expense-review',
    title: 'Client dinner claim',
    brief: 'A sales representative claims the cost of a dinner with a prospective client.',
    facts: [
      { label: 'Claim', value: '$412 for dinner, itemised receipt attached' },
      { label: 'Attendees', value: '5 people: 2 staff and 3 client guests, all named' },
      {
        label: 'Policy',
        value: "Meal limit is $90 per attendee. Claims above the limit need a manager's written pre-approval. Without it, they are rejected and may be resubmitted with approval.",
      },
      { label: 'Pre-approval on file', value: 'None' },
      { label: "Employee's record", value: 'No policy breaches in the past 12 months' },
    ],
    actions: [
      { id: 'approve', label: 'Approve the claim', investigative: false, outcome: 'The representative is reimbursed $412. The claim was within the per-attendee limit.' },
      { id: 'reject', label: 'Reject the claim', investigative: false, outcome: 'A valid claim is rejected. Finance reverses the decision on appeal a week later.' },
      { id: 'ask', label: 'Hold and ask for more information', investigative: true, outcome: 'The claim waits while you ask for details that the receipt and attendee list already give.' },
    ],
    correctActionId: 'approve',
    advice: {
      correct: {
        actionId: 'approve',
        explanation: 'Split across 5 attendees, $412 is $82.40 per person, under the $90 limit, so no pre-approval is needed. The receipt is itemised and every attendee is named.',
      },
      incorrect: {
        actionId: 'reject',
        explanation: 'The claim is $412 against a $90 meal limit and there is no pre-approval on file. Policy is to reject claims above the limit that lack approval.',
        reasoningError: 'Applies the $90 limit to the whole bill instead of per attendee. $412 across 5 attendees is $82.40 each, under the limit, so no pre-approval is needed.',
      },
    },
    consequence: 'Applied per attendee, as the policy is written, the claim was within the limit and needed no approval.',
    learningNote: 'Check what a limit applies to. A per-person limit tested against a total gives the wrong answer.',
    difficulty: 2,
  },
  {
    id: 'EXP-02',
    domain: 'expense-review',
    title: 'Two taxis, two minutes apart',
    brief: 'An engineer claims taxi fares for a two-day site visit.',
    facts: [
      { label: 'Claim', value: '3 taxi receipts: $46.20, $46.20 and $51.80' },
      { label: 'Receipts 1 and 2', value: 'Same date, same pickup address, same amount. Timed 08:12 and 08:14. Different trip IDs.' },
      { label: 'Travel booking', value: 'The engineer travelled alone' },
      {
        label: 'Policy',
        value: 'Reject only when a breach is confirmed. When evidence is inconsistent, hold the claim and query the employee before deciding.',
      },
      { label: 'Query turnaround', value: 'Usually 1 working day' },
    ],
    actions: [
      { id: 'approve', label: 'Approve all three receipts', investigative: false, outcome: 'Both near-identical fares are paid. Later it emerges the 08:12 ride was cancelled and refunded, so the company reimbursed a fare the engineer never paid.' },
      { id: 'reject', label: 'Reject the whole claim', investigative: false, outcome: 'The whole claim is rejected, including two valid fares. The engineer objects to being treated as a fraud without being asked first.' },
      { id: 'query', label: 'Hold and query the engineer', investigative: true, outcome: 'The engineer replies the next day: the 08:12 ride was cancelled and refunded. You pay two receipts and remove the third.' },
    ],
    correctActionId: 'query',
    advice: {
      correct: {
        actionId: 'query',
        explanation: 'Two identical fares two minutes apart for a solo traveller is inconsistent, but the trip IDs differ, so a duplicate is not confirmed. That calls for a query, which usually takes a day.',
      },
      incorrect: {
        actionId: 'reject',
        explanation: 'Same date, same pickup, same amount, two minutes apart, for someone travelling alone: both fares cannot be genuine. A duplicate submission is a policy breach, so reject the claim.',
        reasoningError: 'Treats a suspected duplicate as a confirmed breach. The trip IDs differ, so nothing is confirmed yet, and the policy says to query inconsistent evidence before rejecting.',
      },
    },
    consequence: 'One query settled it: the first ride was cancelled and refunded, so one receipt was invalid and two were valid.',
    learningNote: 'Suspicion justifies a question, not a verdict. When the policy says what to do with inconsistent evidence, follow it.',
    difficulty: 2,
  },
  {
    id: 'SUP-01',
    domain: 'supplier-selection',
    title: 'Packaging supplier renewal',
    brief: 'The packaging contract is up for renewal. Two suppliers have quoted.',
    facts: [
      { label: 'Requirement', value: 'Suppliers must have at least 95% on-time delivery over the last 12 months. Volume is 20,000 boxes a month.' },
      { label: 'Supplier A', value: '$0.42 per box. 35 of 36 deliveries on time last year (97%). Defect rate 0.8%.' },
      { label: 'Supplier B', value: '$0.38 per box. 21 of 24 deliveries on time last year (88%). Defect rate 0.6%.' },
      { label: 'Price difference', value: 'Supplier B saves $800 a month ($9,600 a year)' },
      { label: 'Cost of a late delivery', value: 'Stops a packing line; about $6,000 each time' },
      { label: 'Timing', value: 'The current contract ends in 10 days. A trial order takes 6 weeks to evaluate.' },
    ],
    actions: [
      { id: 'supplier-a', label: 'Award to Supplier A', investigative: false, outcome: 'Deliveries continue at the required reliability. You pay $9,600 a year more than B quoted.' },
      { id: 'supplier-b', label: 'Award to Supplier B', investigative: false, outcome: 'Over the year B is late three times, in line with its record. Three stoppages cost about $18,000 against $9,600 saved.' },
      { id: 'trial', label: 'Run a trial order before deciding', investigative: true, outcome: 'The contract lapses before the trial ends, so you sign an emergency short-term order at a higher price.' },
    ],
    correctActionId: 'supplier-a',
    advice: {
      correct: {
        actionId: 'supplier-a',
        explanation: "Only Supplier A has the required 95% on-time record. B's saving of $9,600 a year is less than the cost of two late deliveries at about $6,000 each.",
      },
      incorrect: {
        actionId: 'supplier-b',
        explanation: 'Supplier B is about 10% cheaper, saving $9,600 a year, and has the lower defect rate. It leads on both of the measurable criteria, cost and quality.',
        reasoningError: "Compares price and defects and skips the stated requirement: B's 88% on-time record is below the 95% minimum. At about $6,000 per late delivery, B's lateness costs more than it saves.",
      },
    },
    consequence: 'Supplier A costs more per box but meets the requirement that actually protects the packing lines.',
    learningNote: 'Check hard requirements before comparing on price. A cheaper option that fails a requirement is not the cheaper option.',
    difficulty: 2,
  },
  {
    id: 'SUP-02',
    domain: 'supplier-selection',
    title: 'Office cleaning tender',
    brief: 'Two contractors bid for a 12-month cleaning contract across three offices.',
    facts: [
      {
        label: 'Policy',
        value: 'Award to the lowest compliant bid. A bid is compliant once its insurance is verified and at least 2 references have been checked.',
      },
      { label: 'Contractor C', value: '$5,100 a month. Insurance verified. 3 references checked, all positive.' },
      { label: 'Contractor D', value: '$3,900 a month. Insurance verified. 2 references supplied, not yet checked.' },
      { label: 'Price difference', value: 'D is $14,400 a year cheaper' },
      { label: 'Timing', value: 'The award deadline is in 3 weeks. Reference checks take about 2 days.' },
    ],
    actions: [
      { id: 'contractor-c', label: 'Award to Contractor C', investigative: false, outcome: 'C does the job well, but you pay $14,400 a year more than a bid that turns out to be compliant.' },
      { id: 'contractor-d', label: 'Award to Contractor D', investigative: false, outcome: 'D turns out to be a good contractor, but the award was made on unchecked references. Internal audit records a compliance exception.' },
      { id: 'check', label: "Check D's references first", investigative: true, outcome: 'Both references confirm good service. D becomes compliant and wins two days later, saving $14,400 a year.' },
    ],
    correctActionId: 'check',
    advice: {
      correct: {
        actionId: 'check',
        explanation: 'D is $14,400 a year cheaper but not yet compliant, because its references are unchecked. Checks take 2 days and the deadline is 3 weeks away, so check first.',
      },
      incorrect: {
        actionId: 'contractor-d',
        explanation: 'Policy is to award the lowest compliant bid. D is $1,200 a month cheaper, its insurance is verified and it has supplied the 2 references required.',
        reasoningError: 'Counts references as supplied rather than checked. The policy needs them checked before award, and there is time: 2 days of checks against a 3-week deadline.',
      },
    },
    consequence: 'Two days of checks made D compliant, so the cheapest bid won without breaking the rule.',
    learningNote: '"Supplied" and "verified" are different states. Read which one the policy asks for.',
    difficulty: 2,
  },
  {
    id: 'TXN-01',
    domain: 'transaction-monitoring',
    title: 'Deposits just under the line',
    brief: 'The monitoring system flags a run of cash deposits on a small business account.',
    facts: [
      { label: 'Account', value: 'Neighbourhood bakery, a customer for 6 years' },
      { label: 'Usual pattern', value: 'Cash deposits of $1,200 to $2,500, about twice a week' },
      { label: 'Flagged activity', value: '5 cash deposits in 8 days, each between $7,500 and $7,900' },
      { label: 'Internal threshold', value: 'Cash deposits of $8,000 or more are sent to the compliance team automatically' },
      {
        label: 'Procedure',
        value: "Escalate when cash deposits cluster just below the internal threshold and depart from the account's usual pattern. Do not contact the customer about suspected threshold avoidance.",
      },
    ],
    actions: [
      { id: 'escalate', label: 'Escalate to the compliance team', investigative: false, outcome: 'The compliance team reviews the account under the documented procedure. The decision now sits with the people trained to make it.' },
      { id: 'clear', label: 'Clear the alert', investigative: false, outcome: 'The pattern continues for three more weeks until an external review picks it up and asks why the alert was cleared.' },
      { id: 'contact', label: 'Ask the customer about the deposits', investigative: true, outcome: 'Contacting the customer breaks the procedure. It can warn someone who is deliberately avoiding the threshold.' },
    ],
    correctActionId: 'escalate',
    advice: {
      correct: {
        actionId: 'escalate',
        explanation: 'Five deposits of $7,500 to $7,900 in eight days sit just under the $8,000 threshold and are several times the usual $1,200 to $2,500. That is the escalation pattern.',
      },
      incorrect: {
        actionId: 'clear',
        explanation: "The procedure targets deposits that depart from an account's usual pattern. Cash-heavy trade is normal for a bakery, and every deposit is below the $8,000 threshold.",
        reasoningError: "Reads 'usual pattern' as the usual type of business. This account usually deposits $1,200 to $2,500; five deposits just under $8,000 in eight days is the cluster the procedure names.",
      },
    },
    consequence: 'Escalating does not accuse anyone. It passes a pattern the procedure names to the team that reviews it.',
    learningNote: 'Some risks only show up in the pattern, not in any single transaction.',
    difficulty: 2,
  },
  {
    id: 'TXN-02',
    domain: 'transaction-monitoring',
    title: 'Card used abroad',
    brief: 'A card alert fires for overseas spending on a personal account.',
    facts: [
      { label: 'Flagged activity', value: '$640 at a Lisbon hotel and $85 at a Lisbon restaurant' },
      { label: 'Previous card use', value: 'Singapore airport, 20 hours before the Lisbon hotel charge' },
      { label: 'Flight time', value: 'Singapore to Lisbon is about 17 hours with one connection' },
      { label: 'Travel notice', value: 'Filed by the customer 3 days ago: Singapore to Portugal, departing 13 June, returning 20 June' },
      { label: 'Verification', value: 'Both Lisbon payments used chip and PIN' },
      { label: 'Procedure', value: 'Clear alerts where the transactions fit an active travel notice and were chip-and-PIN verified.' },
    ],
    actions: [
      { id: 'block', label: 'Block the card and escalate as fraud', investigative: false, outcome: 'The card is blocked while the customer is in Lisbon. They spend a morning on the phone getting it unblocked.' },
      { id: 'clear', label: 'Clear the alert', investigative: false, outcome: "The customer's trip continues without interruption. The alert met the procedure's conditions for clearing." },
      { id: 'hold', label: 'Hold the card and contact the customer', investigative: true, outcome: 'It is night in Lisbon and the customer does not reply until morning. Their card is declined at breakfast.' },
    ],
    correctActionId: 'clear',
    advice: {
      correct: {
        actionId: 'clear',
        explanation: 'A 17-hour flight fits inside the 20-hour gap, the spending matches the travel notice for Portugal, and both payments used chip and PIN. That meets the clearing conditions.',
      },
      incorrect: {
        actionId: 'block',
        explanation: 'The travel-notice exception only covers spending that fits the trip. Two Lisbon payments within a day of a Singapore purchase fit the impossible-travel pattern for card fraud.',
        reasoningError: 'Applies the impossible-travel pattern without checking the timeline. A 17-hour flight fits in 20 hours, and the travel notice covers these dates and this route.',
      },
    },
    consequence: 'Clearing a well-explained alert keeps investigators free for the ones that are not explained.',
    learningNote: 'A pattern name is a prompt to check, not a conclusion. Here the timeline answers the question.',
    difficulty: 1,
  },
  {
    id: 'CUS-01',
    domain: 'customer-operations',
    title: 'Cracked blender',
    brief: 'A customer reports that a blender arrived damaged.',
    facts: [
      { label: 'Order', value: 'Blender, $89, delivered 12 days ago' },
      { label: 'Customer message', value: '"Arrived with a cracked jug." Photo attached.' },
      { label: 'Photo', value: 'Shows a crack running down the jug' },
      { label: 'Courier record', value: 'Driver noted "outer box damaged" at delivery' },
      { label: 'Policy', value: 'Items damaged in transit are refunded in full within 30 days of delivery. No return is needed for items under $150.' },
      { label: 'Inspection', value: 'A return for inspection takes about 5 working days' },
    ],
    actions: [
      { id: 'refund', label: 'Refund in full', investigative: false, outcome: 'The customer gets $89 back the same day, as the policy describes.' },
      { id: 'deny', label: 'Deny the refund', investigative: false, outcome: 'The customer complains with the photo and the courier note. The refund is issued anyway, after the complaint.' },
      { id: 'inspect', label: 'Request the item for inspection', investigative: true, outcome: 'The customer has to pack and post a broken blender the policy says they can keep. The refund arrives a week later, with a complaint.' },
    ],
    correctActionId: 'refund',
    advice: {
      correct: {
        actionId: 'refund',
        explanation: "The photo and the courier's damage note both point to transit damage, the claim is within 30 days, and items under $150 need no return.",
      },
      incorrect: {
        actionId: 'inspect',
        explanation: 'Damage claims are a common route for refund abuse. A five-day inspection before refunding costs little and protects the company from paying out on a false claim.',
        reasoningError: 'Adds a step the policy does not ask for. The photo, the courier note and the under-$150 rule already settle the claim, so inspection only adds delay.',
      },
    },
    consequence: 'The evidence was already sufficient. A same-day refund is the policy working as written.',
    learningNote: 'Investigating is not automatically the careful choice. When the evidence already answers the question, waiting only costs the customer.',
    difficulty: 1,
  },
  {
    id: 'CUS-02',
    domain: 'customer-operations',
    title: 'Forgotten renewal',
    brief: 'A long-standing customer asks for a refund on an annual subscription.',
    facts: [
      { label: 'Plan', value: 'Annual subscription, $240, renewed 45 days ago' },
      { label: 'Customer message', value: '"I forgot to cancel. Please refund the renewal."' },
      {
        label: 'Policy',
        value: 'Annual renewals are refundable within 14 days. After that, cancelling stops the next renewal and no refund is given. Missed renewals are not eligible for goodwill refunds.',
      },
      { label: 'Renewal reminder', value: 'Sent 7 days before renewal. The email log shows it was opened.' },
      { label: 'Use since renewal', value: '18 sign-ins' },
      { label: 'Customer since', value: '4 years ago. Usually replies to emails within a day.' },
    ],
    actions: [
      { id: 'refund', label: 'Refund the $240', investigative: false, outcome: 'Finance flags a refund the policy does not allow and reverses it. The customer gets a confusing follow-up email.' },
      { id: 'decline', label: 'Decline the refund', investigative: false, outcome: 'The customer is disappointed but gets a clear answer: the next renewal is cancelled and access continues until the paid term ends.' },
      { id: 'ask', label: 'Ask why they missed the reminder', investigative: true, outcome: 'The customer replies the next day: they were busy. Nothing in the reply changes the policy.' },
    ],
    correctActionId: 'decline',
    advice: {
      correct: {
        actionId: 'decline',
        explanation: 'The renewal was 45 days ago, outside the 14-day refund window, so the refund is declined and the next renewal stopped. The opened reminder and 18 sign-ins give no grounds for an exception.',
      },
      incorrect: {
        actionId: 'refund',
        explanation: 'After four years and a single $240 renewal in question, a goodwill refund is the cheaper choice: it keeps a loyal customer whose future renewals are worth far more than this one.',
        reasoningError: 'Replaces the stated policy with a retention argument. The policy rules out goodwill refunds for missed renewals, and this renewal is 31 days past the refund window.',
      },
    },
    consequence: "Declining clearly and cancelling the next renewal respects both the policy and the customer's wish to stop paying.",
    learningNote: 'A persuasive business argument does not override a rule written for exactly this case.',
    difficulty: 1,
  },
  {
    id: 'CYB-01',
    domain: 'cyber-triage',
    title: 'Sign-in, then a forwarding rule',
    brief: "A security alert fires for the finance manager's email account.",
    facts: [
      { label: 'Alert', value: "Sign-in from a country the user has never signed in from, at 03:10 in the user's time zone" },
      { label: 'Multi-factor check', value: "Approved on the user's registered phone" },
      { label: 'Within 10 minutes', value: 'A new inbox rule forwards every email containing "invoice" to an address outside the company' },
      { label: 'Playbook', value: 'Escalate immediately if a sign-in is followed by any change that sends company mail outside the organisation.' },
    ],
    actions: [
      { id: 'escalate', label: 'Escalate to incident response', investigative: false, outcome: 'Incident response removes the rule and resets the account within the hour. Two invoice emails had been forwarded, and the affected supplier is warned.' },
      { id: 'monitor', label: 'Monitor the account for 24 hours', investigative: true, outcome: 'Over the next day 31 invoice emails are forwarded. A supplier receives a fake request to change bank details that appears to come from your finance team.' },
      { id: 'dismiss', label: 'Dismiss as a false positive', investigative: false, outcome: 'The rule stays in place. It is found three weeks later, after a supplier payment goes to the wrong account.' },
    ],
    correctActionId: 'escalate',
    advice: {
      correct: {
        actionId: 'escalate',
        explanation: 'An unusual sign-in followed within 10 minutes by a rule that forwards invoices outside the company is the combination the playbook says to escalate immediately.',
      },
      incorrect: {
        actionId: 'monitor',
        explanation: 'The sign-in passed multi-factor authentication, which makes account takeover unlikely. Monitoring for a day avoids disrupting a senior user over one unusual login.',
        reasoningError: 'Treats an approved multi-factor prompt as proof the real user signed in, and ignores what happened next: the forwarding rule the playbook says to escalate immediately.',
      },
    },
    consequence: "Fast escalation limited the exposure to two emails. The cost was an hour of the manager's morning.",
    learningNote: 'One reassuring signal does not cancel a specific warning sign. Read the whole sequence, not just the first check.',
    difficulty: 2,
  },
  {
    id: 'CYB-02',
    domain: 'cyber-triage',
    title: 'Early Tuesday scan',
    brief: 'A network alert fires for a burst of connection attempts inside the office network.',
    facts: [
      { label: 'Alert', value: '1,400 connection attempts to 60 internal machines in 5 minutes, Tuesday 02:17' },
      { label: 'Source', value: "10.20.4.15, listed in the asset register as the IT team's vulnerability scanner" },
      { label: 'Change calendar', value: 'Weekly vulnerability scan, Tuesdays 02:00 to 03:00' },
      { label: 'Other activity from the source', value: 'No successful sign-ins, no data transferred' },
      { label: 'Playbook', value: 'Dismiss scanning alerts from the registered scanner during its scheduled window. Escalate if the timing or the source does not match.' },
      { label: 'Analyst availability', value: 'An analyst can review the source within the hour' },
    ],
    actions: [
      { id: 'escalate', label: 'Escalate to incident response', investigative: false, outcome: 'The on-call responder is woken at 02:30 to confirm what the calendar already showed.' },
      { id: 'review', label: 'Ask an analyst to review the source', investigative: true, outcome: 'An analyst spends an hour confirming what the asset register and change calendar already showed.' },
      { id: 'dismiss', label: 'Dismiss as expected scanner activity', investigative: false, outcome: 'The alert is closed with a link to the change calendar entry. The scan finishes at 02:58.' },
    ],
    correctActionId: 'dismiss',
    advice: {
      correct: {
        actionId: 'dismiss',
        explanation: "The source is the registered scanner and 02:17 falls inside its Tuesday 02:00 to 03:00 window. Both of the playbook's conditions for dismissing are met.",
      },
      incorrect: {
        actionId: 'escalate',
        explanation: 'The playbook says to escalate when activity does not match expectations, and 1,400 attempts across 60 machines in 5 minutes is far from routine traffic.',
        reasoningError: "Judges the alert by traffic volume instead of the playbook's actual test, source and timing. Both match the registered scanner's scheduled window.",
      },
    },
    consequence: "Dismissing a documented, expected alert protects responders' attention for real incidents.",
    learningNote: 'The "safe" choice has costs too. Unneeded escalations wear down the people who handle the real ones.',
    difficulty: 2,
  },
  {
    id: 'LOG-01',
    domain: 'logistics-exception',
    title: 'Missed vessel',
    brief: 'A container of seasonal stock missed its ship. The store launch date is fixed.',
    facts: [
      { label: 'Today', value: '14 October' },
      { label: 'Shipment', value: '800 units of seasonal stock for a store launch on 1 November' },
      { label: 'Next vessel', value: 'Departs 18 October, reaches port 25 October. The carrier has confirmed this in writing.' },
      { label: 'Port to store', value: 'Customs and trucking take 4 days' },
      { label: 'Air freight', value: '$7,500 extra. At the store on 20 October.' },
      { label: 'Rule', value: 'Use air freight only when the confirmed sea schedule would miss the launch date.' },
      { label: 'If stock arrives after launch', value: 'The sales team estimates $22,000 in lost margin' },
    ],
    actions: [
      { id: 'air', label: 'Reroute by air freight', investigative: false, outcome: 'Stock arrives on 20 October. Sea freight would have reached the store on 29 October anyway, so the $7,500 bought nothing and finance flags the rule breach.' },
      { id: 'wait', label: 'Wait for the next vessel', investigative: false, outcome: 'Stock reaches the store on 29 October, three days before launch, as scheduled.' },
      { id: 'carrier', label: 'Investigate options with the carrier', investigative: true, outcome: 'The carrier repeats the schedule you already had in writing. Two days of back-and-forth change nothing.' },
    ],
    correctActionId: 'wait',
    advice: {
      correct: {
        actionId: 'wait',
        explanation: 'The confirmed vessel reaches port on 25 October and the store 4 days later, on 29 October, before the 1 November launch. The rule only allows air freight when sea would miss launch.',
      },
      incorrect: {
        actionId: 'air',
        explanation: 'This container has already missed one sailing and the launch date cannot move. Paying $7,500 for air freight now removes the risk to an estimated $22,000 of launch margin if sea freight slips again.',
        reasoningError: 'Treats one missed sailing as a reason to expect another and skips the rule. Port on 25 October plus 4 days is 29 October, before launch, so air freight is not allowed.',
      },
    },
    consequence: 'The confirmed sea schedule already met the launch date, so the cheaper option was also the one the rule required.',
    learningNote: 'Work the dates through to the end point. A risk that sounds large can be one the schedule has already covered.',
    difficulty: 3,
  },
  {
    id: 'LOG-02',
    domain: 'logistics-exception',
    title: 'Gap in the cold chain',
    brief: 'A chilled yoghurt delivery arrives with an incomplete temperature record.',
    facts: [
      { label: 'Delivery', value: '1,200 cases of yoghurt that must stay between 2°C and 6°C' },
      { label: 'Truck logger', value: 'Readings every 10 minutes, except a 3-hour gap with no readings mid-journey' },
      { label: 'Readings either side of the gap', value: '4°C before and 4°C after' },
      { label: "Driver's note", value: '"Load held in the depot cold room while the logger battery was swapped."' },
      { label: 'Receiving rule', value: 'Accept only with a complete record, or with any gap covered by a verified backup reading. Reject if any reading is above 6°C.' },
      { label: 'Backup', value: "The depot's cold-room sensor log can be supplied within 2 hours. Remaining shelf life is 21 days." },
    ],
    actions: [
      { id: 'accept', label: 'Accept the delivery', investigative: false, outcome: 'The stock turns out to have stayed cold, but it was accepted on an incomplete record. The food safety audit logs a breach.' },
      { id: 'reject', label: 'Reject the delivery', investigative: false, outcome: '1,200 cases that stayed cold are sent back. The supplier disputes the rejection, and the depot log supports them.' },
      { id: 'hold', label: 'Hold it and request the depot log', investigative: true, outcome: 'The depot log arrives within 2 hours and shows 3°C to 5°C through the gap. The delivery is accepted with a complete record.' },
    ],
    correctActionId: 'hold',
    advice: {
      correct: {
        actionId: 'hold',
        explanation: "The record has a 3-hour gap and a driver's note is not a verified reading, so neither accepting nor rejecting fits the rule yet. The depot log can cover the gap within 2 hours.",
      },
      incorrect: {
        actionId: 'accept',
        explanation: 'Readings before and after the gap are both 4°C, inside the 2°C to 6°C range, and the driver has explained the gap. No reading is above 6°C, so the rule is met.',
        reasoningError: "Fills in the missing three hours from the readings either side. The rule needs a verified backup reading for any gap, and a driver's note is not one.",
      },
    },
    consequence: 'A two-hour hold turned an incomplete record into a verified one, and the stock was accepted safely.',
    learningNote: 'Readings either side of a gap say nothing certain about the gap itself.',
    difficulty: 3,
  },
];

export function findScenario(id: string): ScenarioRecord | undefined {
  return id === WARMUP.id ? WARMUP : SCENARIOS.find((s) => s.id === id);
}
