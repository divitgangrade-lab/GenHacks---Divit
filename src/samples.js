// Synthetic letters. No real patient data: every line here was written for this
// demo, and the site says so.

export const SAMPLES = [
  {
    id: 'clean',
    name: 'Clean letter',
    note: 'Well formatted, still written for clinicians.',
    text: `DISCHARGE INSTRUCTIONS
General Surgery
Date of discharge: 2026-11-20

Medications:
Amoxicillin 500 mg PO TID x 7 days
Acetaminophen 500 mg PO Q6H PRN pain
Warfarin 5 mg PO daily x 30 days

Follow-up:
Surgical clinic appointment on 2026-12-02 at 10:30 with Dr. Chen.

Activity:
Do not lift anything heavier than 10 pounds for 2 weeks.
No driving while taking pain medicine.
Avoid alcohol for 7 days.

When to call:
If you have a fever above 38.5 or chills, call the surgical clinic.
If you have chest pain or trouble breathing, call 911.
If your incision is red, warm, or leaking pus, call us.`,
  },
  {
    id: 'messy',
    name: 'Abbreviation soup',
    note: 'The kind of letter that actually leaves the building.',
    text: `DC SUMMARY — 2026-11-18

1. Amox 500mg PO TID x7d
2. APAP 500 mg q6h prn
3. Warfarin 5mg OD
4. Hold warfarin 5 days before your colonoscopy and call the anticoagulation clinic to restart it afterwards.
5. NPO after midnight before the procedure.
6. Diet as tolerated. H2O ad lib.

FU surgical clinic 12/2/2026 10:30 Dr Chen.
No driving while on narcotics. Avoid ETOH x 7d.
Return to ER if fever > 38.5, or if you develop chest pain or dyspnea.
Rest when you feel tired.`,
  },
  {
    id: 'tricky',
    name: 'Unusual instruction',
    note: 'Contains a line the parser deliberately refuses to guess at.',
    text: `Discharge instructions — Cardiology
Discharge date: 2026-11-19

Medications:
Metoprolol 25 mg PO BID
Atorvastatin 40 mg PO QHS

Follow-up:
Cardiology clinic on December 9, 2026 at 09:00.

Activity:
Do not drive for 48 hours after your procedure.
Avoid lifting more than 5 kg for 1 week.

When to call:
If you feel dizzy or your heart is racing, call the cardiology clinic.
If you have chest pain, call 911.

Other:
Please weigh yourself every morning and write the number down.
When your drain output is under 30 ml per day for two days, call the nurse line.`,
  },
]

export const DEFAULT_SAMPLE = SAMPLES[0].text
