import {pack} from './core.mjs';
export async function decisionExample(missing = false) {
  const rows = [
    ['SOURCE','Source: fictional support policy',[], 'Synthetic policy: Refund duplicate charges only after checking the payment ledger. No real customer or payment data is included.'],
    ['PROMPT','Prompt: evaluate a refund request',['SOURCE'],'Synthetic prompt: A customer reports two charges. Summarize the policy and recommend the next step.'],
    ['MODEL','Model: simulated run',['PROMPT'],'Synthetic model metadata: demo-model, version example-1. This is a hand-authored illustration, not a recorded model execution.'],
    ['OUTPUT','Output: suggested refund',['MODEL'],'Synthetic output: Issue a refund for the reported duplicate charge. This recommendation has not established that a duplicate exists.'],
    ['EVIDENCE','Evidence: fictional ledger check',['SOURCE'],'Synthetic ledger: two settled entries share an order ID; a reviewer checked that neither was reversed. This is illustrative evidence, not payment verification.'],
    ['DECISION','Human decision: approve after review',['OUTPUT','EVIDENCE'],'Synthetic reviewer decision: approve one refund after checking the ledger. If the ledger evidence is missing, the basis for this approval cannot be inspected.'],
    ['AUDIT','Audit packet: inspect the decision',['DECISION'],'Synthetic review packet. Follow DECISION to OUTPUT and EVIDENCE. A complete packet does not establish truth or certify compliance.']
  ];
  return pack(rows.filter(([id])=>!missing || id!=='EVIDENCE').map(([id,title,parents,content])=>({id,title,parents,content,visibility:'public'})),rows.map(([id])=>id));
}
