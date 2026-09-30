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
    { id: 'ask', label: 'Hold and ask for more information', investigative: true, outcome: 'The claim waits a week for an answer the receipt already gives.' },
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
    brief: 'A sales manager claims the cost of a dinner with a prospective client.',
    facts: [
      { label: 'Claim', value: '$412 for dinner, itemised receipt attached' },
      { label: 'Attendees', value: '4 people: 2 staff and 2 client guests, all named' },
      {
        label: 'Policy',
        value: "Meal limit is $90 per attendee. Claims above the limit need a manager's written pre-approval. Without it, the claim is rejected and may be resubmitted with approval.",
      },
      { label: 'Pre-approval on file', value: 'None' },
      { label: "Employee's record", value: 'No policy breaches in the past 12 months' },
    ],
    actions: [
      { id: 'approve', label: 'Approve the claim', investigative: false, outcome: 'The company pays $412 on a claim that breaks the meal limit without approval. Internal audit flags it in the quarterly sample.' },
      { id: 'reject', label: 'Reject the claim', investigative: false, outcome: 'The claim goes back with the reason. The manager gets written approval and resubmits the next day.' },
      { id: 'ask', label: 'Hold and ask for more information', investigative: true, outcome: 'The claim waits while you ask for details. The answer changes nothing: the limit was exceeded and no approval exists.' },
    ],
    correctActionId: 'reject',
    advice: {
      correct: {
        actionId: 'reject',
        explanation: 'At $103 per attendee ($412 / 4), the claim is above the $90 limit and no pre-approval is on file. Policy says reject; the employee can resubmit with approval.',
      },
      incorrect: {
        actionId: 'approve',
        explanation: 'The receipt is itemised, the attendees are named and the employee has a clean 12-month record. This is a low-risk, well-documented claim.',
        reasoningError: 'Treats good documentation and a clean history as enough and never checks the limit: $412 / 4 = $103 per attendee, above the $90 limit, with no pre-approval.',
      },
    },
    consequence: 'Rejecting with a clear reason keeps the control intact and costs the employee one day, since they can resubmit with approval.',
    learningNote: 'A clean record lowers suspicion, not policy limits. Do the arithmetic the policy asks for.',
    difficulty: 1,
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
      { id: 'approve', label: 'Approve all three receipts', investigative: false, outcome: 'Both near-identical fares are paid. Later it emerges the 08:12 ride was cancelled and refunded to the engineer, so the company paid for it anyway.' },
      { id: 'reject', label: 'Reject the claim as a duplicate', investigative: false, outcome: 'The whole claim is rejected, including two valid fares. The engineer objects to being treated as a fraud without being asked first.' },
      { id: 'query', label: 'Hold and query the engineer', investigative: true, outcome: 'The engineer replies the next day: the 08:12 ride was cancelled and refunded. You pay two receipts and remove the third.' },
    ],
    correctActionId: 'query',
    advice: {
      correct: {
        actionId: 'query',
        explanation: 'Two identical fares two minutes apart for a solo traveller is inconsistent, but the trip IDs differ, so a duplicate is not confirmed. Policy says hold and query; a reply usually takes a day.',
      },
      incorrect: {
        actionId: 'reject',
        explanation: 'Same date, same pickup, same amount, two minutes apart: this is a duplicate submission, which breaches the expenses policy.',
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
      { label: 'Requirement', value: '20,000 boxes a month. The contract requires at least 95% on-time delivery.' },
      { label: 'Supplier A', value: '$0.42 per box. 97% on time over the last 12 months (36 deliveries). Defect rate 0.8%.' },
      { label: 'Supplier B', value: '$0.38 per box. 88% on time over the last 12 months (24 deliveries). Defect rate 0.6%.' },
      { label: 'Price difference', value: 'Supplier B saves $800 a month' },
      { label: 'Cost of a late delivery', value: 'Stops a packing line; about $6,000 each time' },
      { label: 'Timing', value: 'The current contract ends in 10 days. A trial order takes 6 weeks to evaluate.' },
    ],
    actions: [
      { id: 'supplier-a', label: 'Award to Supplier A', investigative: false, outcome: 'Deliveries continue at the required reliability. You pay $800 a month more than B quoted.' },
      { id: 'supplier-b', label: 'Award to Supplier B', investigative: false, outcome: 'Over six months B is late twice, in line with its record. Two stoppages cost about $12,000 against $4,800 saved.' },
      { id: 'trial', label: 'Run a trial order before deciding', investigative: true, outcome: 'The contract lapses before the trial ends, so you sign an emergency short-term order at a higher price.' },
    ],
    correctActionId: 'supplier-a',
    advice: {
      correct: {
        actionId: 'supplier-a',
        explanation: "Only Supplier A meets the 95% on-time requirement. B's $800 monthly saving is erased by a single extra late delivery at about $6,000.",
      },
      incorrect: {
        actionId: 'supplier-b',
        explanation: 'Supplier B is about 10% cheaper, saving $800 a month, and has the lower defect rate. It leads on both cost and quality.',
        reasoningError: "Compares only price and defects and skips the stated requirement. B's 88% on-time rate fails the 95% minimum, and one extra late delivery costs about seven months of savings.",
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
      { label: 'Policy', value: 'Award to the lowest compliant bid. A bid is compliant once its insurance is verified and its references are checked.' },
      { label: 'Contractor C', value: '$5,100 a month. Insurance verified. 3 references checked, all positive.' },
      { label: 'Contractor D', value: '$3,900 a month. Insurance verified. 2 references supplied, not yet checked.' },
      { label: 'Saving if D is compliant', value: '$14,400 a year' },
      { label: 'Timing', value: 'The award deadline is in 3 weeks. Reference checks take about 2 days.' },
    ],
    actions: [
      { id: 'contractor-c', label: 'Award to Contractor C', investigative: false, outcome: 'C does the job well, but you pay $14,400 a year more than a bid that turns out to be compliant.' },
      { id: 'contractor-d', label: 'Award to Contractor D', investigative: false, outcome: "D turns out to be a good contractor, but the award was made on unchecked references. Internal audit records a compliance exception." },
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
        explanation: 'D is $1,200 a month cheaper, its insurance is verified and it has supplied references. It is the lowest bid that meets the requirements.',
        reasoningError: 'Counts references as supplied rather than checked. The policy needs them checked before award, and there is time: 2 days of checks against a 3-week deadline.',
      },
    },
    consequence: 'Two days of checks made D compliant, so the cheapest bid won without breaking the rule.',
    learningNote: '"Supplied" and "verified" are different states. When verification is cheap and there is time, verify first.',
    difficulty: 3,
  },
  {
    id: 'TXN-01',
    domain: 'transaction-monitoring',
    title: 'Deposits just under the line',
    brief: 'The monitoring system flags a run of cash deposits on a small business account.',
    facts: [
      { label: 'Account', value: 'Neighbourhood bakery, a customer for 6 years' },
      { label: 'Usual pattern', value: 'Cash deposits of $1,200 to $2,500, about twice a week' },
      { label: 'Flagged activity', value: '5 cash deposits in 8 days, each between $9,500 and $9,900' },
      { label: 'Reporting threshold', value: 'Cash deposits of $10,000 or more are reported automatically' },
      {
        label: 'Procedure',
        value: "Escalate repeated deposits just under the threshold that break the account's usual pattern. Do not contact the customer about suspected threshold avoidance.",
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
        explanation: 'Five deposits just under $10,000 in eight days, against a usual size of $1,200 to $2,500, is the pattern the procedure says to escalate.',
      },
      incorrect: {
        actionId: 'clear',
        explanation: 'Cash-heavy trade is normal for a bakery, and every deposit is below the $10,000 reporting threshold, so none of them needs a report.',
        reasoningError: "Checks each deposit against the threshold one at a time and misses the pattern: five deposits just under the line in eight days, several times the account's normal size.",
      },
    },
    consequence: 'Escalating does not accuse anyone. It passes a pattern the procedure names to the team that reviews it.',
    learningNote: 'Some risks only show up in the pattern, not in any single transaction. Read the rule for what it actually targets.',
    difficulty: 2,
  },
  {
    id: 'TXN-02',
    domain: 'transaction-monitoring',
    title: 'Card used abroad',
    brief: 'A card alert fires for overseas spending on a personal account.',
    facts: [
      { label: 'Today', value: '14 June' },
      { label: 'Flagged activity', value: '$640 at a Lisbon hotel and $85 at a Lisbon restaurant' },
      { label: 'Previous card use', value: 'Singapore airport, 20 hours before the Lisbon hotel charge' },
      { label: 'Travel notice', value: 'Filed by the customer 3 days ago: Portugal, 12 to 20 June' },
      { label: 'Verification', value: 'Both Lisbon payments used chip and PIN' },
      { label: 'Procedure', value: 'Clear alerts where the transactions match an active travel notice and were chip-and-PIN verified.' },
    ],
    actions: [
      { id: 'block', label: 'Block the card and escalate as fraud', investigative: false, outcome: 'The card is blocked while the customer is in Lisbon. They spend a morning on the phone getting it unblocked.' },
      { id: 'clear', label: 'Clear the alert', investigative: false, outcome: "The customer's trip continues without interruption. The alert met the procedure's conditions for clearing." },
      { id: 'hold', label: 'Hold the card and contact the customer', investigative: true, outcome: 'The card is held until the customer answers. It is night in Lisbon, and their hotel payment fails at check-out.' },
    ],
    correctActionId: 'clear',
    advice: {
      correct: {
        actionId: 'clear',
        explanation: "The spending matches the customer's travel notice for Portugal, and both payments used chip and PIN. The procedure says to clear.",
      },
      incorrect: {
        actionId: 'block',
        explanation: 'Two payments in a new country within a day of a Singapore purchase match the impossible-travel pattern, a common sign of card fraud.',
        reasoningError: "Applies the impossible-travel pattern without checking the timeline. Twenty hours is enough to fly to Lisbon, and the customer's travel notice covers these dates.",
      },
    },
    consequence: 'Clearing a well-explained alert keeps investigators free for the ones that are not explained.',
    learningNote: 'A pattern name is a prompt to check, not a conclusion. Here the timeline and the travel notice answer the question.',
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
      { label: 'Customer history', value: '1 previous refund in 3 years' },
    ],
    actions: [
      { id: 'refund', label: 'Refund in full', investigative: false, outcome: 'The customer gets $89 back the same day, as the policy describes.' },
      { id: 'deny', label: 'Deny the refund', investigative: false, outcome: 'The customer complains with the photo and the courier note. The refund is issued anyway, after the complaint.' },
      { id: 'inspect', label: 'Ask for the item back for inspection', investigative: true, outcome: 'The customer has to pack and post a broken blender the policy says they can keep. The refund arrives two weeks later, with a complaint.' },
    ],
    correctActionId: 'refund',
    advice: {
      correct: {
        actionId: 'refund',
        explanation: "The photo and the courier's damage note both point to transit damage, the claim is within 30 days, and items under $150 need no return.",
      },
      incorrect: {
        actionId: 'inspect',
        explanation: 'Damage claims are a common route for refund abuse. Inspecting the item before refunding protects the company from a false claim.',
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
      { label: 'Policy', value: 'Annual renewals are refundable within 14 days. After that, cancelling stops the next renewal and no refund is given.' },
      { label: 'Agent authority', value: "Goodwill refunds above $50 need a manager's approval" },
      { label: 'Renewal reminder', value: 'Sent 7 days before renewal. The email log shows it was opened.' },
      { label: 'Use since renewal', value: '18 sign-ins' },
      { label: 'Customer since', value: '4 years ago' },
    ],
    actions: [
      { id: 'refund', label: 'Refund the $240', investigative: false, outcome: 'Finance flags a $240 refund issued without manager approval. The customer gets a confusing follow-up email about it.' },
      { id: 'decline', label: 'Decline the refund and cancel future renewal', investigative: false, outcome: 'The customer is disappointed but gets a clear answer: no charge next year, and access continues until the paid term ends.' },
      { id: 'ask', label: 'Ask why they missed the reminder', investigative: true, outcome: 'The customer says they were busy. Nothing in the reply changes the policy, and the answer took two more days.' },
    ],
    correctActionId: 'decline',
    advice: {
      correct: {
        actionId: 'decline',
        explanation: 'The renewal was 45 days ago, outside the 14-day window. The reminder was opened and the account has been used 18 times, so policy is to decline and stop the next renewal.',
      },
      incorrect: {
        actionId: 'refund',
        explanation: 'Four years of tenure makes this a valuable customer. A goodwill refund protects the relationship and costs less than losing them.',
        reasoningError: "Replaces the stated policy with a retention argument, and exceeds the agent's authority: goodwill refunds above $50 need a manager, and $240 is well over that.",
      },
    },
    consequence: "Declining clearly and cancelling the next renewal respects both the policy and the customer's wish to stop paying.",
    learningNote: 'A persuasive business argument does not grant authority the policy withholds. Check who is allowed to make the exception.',
    difficulty: 2,
  },
  {
    id: 'CYB-01',
    domain: 'cyber-triage',
    title: 'Sign-in, then a forwarding rule',
    brief: "A security alert fires for the finance manager's email account.",
    facts: [
      { label: 'Alert', value: 'Sign-in from a country the user has never signed in from, at 03:10 local time' },
      { label: 'Multi-factor check', value: "Approved on the user's registered phone" },
      { label: 'Within 10 minutes', value: 'A new inbox rule forwards every email containing "invoice" to an external address' },
      { label: 'Playbook', value: 'Escalate immediately when a sign-in is followed by a rule that forwards mail to an external address.' },
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
        explanation: 'An unusual sign-in followed within 10 minutes by an external forwarding rule for invoices is exactly the combination the playbook says to escalate.',
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
    title: 'Tuesday night scan',
    brief: 'A network alert fires for a burst of connection attempts inside the office network.',
    facts: [
      { label: 'Alert', value: '1,400 connection attempts to 60 internal machines in 5 minutes, Tuesday 02:17' },
      { label: 'Source', value: "10.20.4.15, listed in the asset register as the IT team's vulnerability scanner" },
      { label: 'Change calendar', value: 'Weekly vulnerability scan, Tuesdays 02:00 to 03:00' },
      { label: 'Other activity from the source', value: 'No successful sign-ins, no data transferred' },
      { label: 'Playbook', value: 'Dismiss scanning alerts from the registered scanner during its scheduled window. Escalate if the timing or the source does not match.' },
      { label: 'Responder load', value: '9 escalations this month turned out to be false alarms' },
    ],
    actions: [
      { id: 'escalate', label: 'Escalate to incident response', investigative: false, outcome: 'The on-call responder is woken at 02:30 to confirm what the calendar already showed. False alarm number ten this month.' },
      { id: 'monitor', label: 'Monitor the source for 24 hours', investigative: true, outcome: 'An analyst spends part of tomorrow watching a scanner do its scheduled job.' },
      { id: 'dismiss', label: 'Dismiss as expected scanner activity', investigative: false, outcome: 'The alert is closed with a link to the change calendar entry. The scan finishes at 02:58.' },
    ],
    correctActionId: 'dismiss',
    advice: {
      correct: {
        actionId: 'dismiss',
        explanation: "The source is the registered scanner and the alert falls inside its scheduled Tuesday window, which the playbook says to dismiss.",
      },
      incorrect: {
        actionId: 'escalate',
        explanation: 'Rapid connection attempts across many machines is the signature of network reconnaissance, often the first stage of an attack. Escalating is the safe choice.',
        reasoningError: "Matches the traffic to a known attack pattern without checking the source or the time. Both match the registered scanner's scheduled window.",
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
      { label: 'Next vessel', value: 'Departs 18 October, arrives 3 November. The carrier has confirmed this in writing.' },
      { label: 'Air freight', value: '$7,500 extra. Arrives 20 October.' },
      { label: 'If stock arrives after launch', value: 'The sales team estimates $22,000 in lost margin' },
    ],
    actions: [
      { id: 'air', label: 'Reroute by air freight', investigative: false, outcome: 'Stock arrives on 20 October, in time for launch. The $7,500 premium is well below the margin at risk.' },
      { id: 'wait', label: 'Wait for the next vessel', investigative: false, outcome: 'Stock arrives on 3 November, two days after launch. The promotion misses its opening weekend.' },
      { id: 'carrier', label: 'Investigate options with the carrier', investigative: true, outcome: 'The carrier repeats the confirmed schedule. Two days later, the cheapest air slot before launch has gone and the price rises.' },
    ],
    correctActionId: 'air',
    advice: {
      correct: {
        actionId: 'air',
        explanation: 'The next vessel arrives 3 November, after the 1 November launch. Air freight costs $7,500 and protects an estimated $22,000 in margin.',
      },
      incorrect: {
        actionId: 'wait',
        explanation: 'The next vessel arrives in the same week as the launch, and waiting avoids a $7,500 air freight premium on a shipment that is already booked.',
        reasoningError: "Treats 'the same week' as on time. The launch is 1 November and the vessel arrives 3 November, so the stock is late and about $22,000 of margin is put at risk to save $7,500.",
      },
    },
    consequence: 'Paying $7,500 to protect about $22,000 in launch margin is the cheaper outcome once the dates are compared exactly.',
    learningNote: 'Compare dates exactly and costs side by side. Loose phrases like "same week" can hide the one fact that matters.',
    difficulty: 2,
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
      { label: "Driver's note", value: '"Logger battery swapped at depot."' },
      {
        label: 'Receiving rule',
        value: 'Accept only with a complete record, or a gap covered by a verified backup reading. Hold and investigate an incomplete record. Reject if any reading is above 6°C.',
      },
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
        explanation: "The record has a 3-hour gap, and a driver's note is not a verified reading. The depot log can cover the gap within 2 hours, which is what the rule asks for.",
      },
      incorrect: {
        actionId: 'accept',
        explanation: 'Readings before and after the gap are both 4°C, well inside the 2°C to 6°C range, and the driver explained the gap. The load stayed cold.',
        reasoningError: "Fills in the missing three hours from the readings either side. The rule needs a verified backup reading, and a driver's note is not one; the depot log can provide it within 2 hours.",
      },
    },
    consequence: 'A two-hour hold turned an incomplete record into a verified one, and the stock was accepted safely.',
    learningNote: 'Readings either side of a gap say nothing certain about the gap itself. When verification is quick, get it.',
    difficulty: 3,
  },
];

export function findScenario(id: string): ScenarioRecord | undefined {
  return id === WARMUP.id ? WARMUP : SCENARIOS.find((s) => s.id === id);
}
