using com.portfolio.requesthub as db from '../db/schema';

@require: ['Admin', 'Requester', 'Processor']
service RequestService {
  entity Requests as projection on db.Requests actions {
    @requires: ['Requester', 'Admn']
    action submit(
    ) returns Requests;

    @requires: ['Processor', 'Admn']
    action assign(
      processorId: String(255) not null
    ) returns Requests;

    @requires: ['Processor', 'Admn']
    action approve(
      approvalComment: String(500)
    ) returns Requests;

    @requires: ['Processor', 'Admin']
    action rejectRequest(
      rejectionReason: String(500) not null
    ) returns Requests;

    @requires: ['Processor', 'Admin']
    action requestClarification(
      clarificationComment: String(500) not null
    )returns Requests;

  }
}