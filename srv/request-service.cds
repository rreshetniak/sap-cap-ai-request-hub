using com.portfolio.requesthub as db from '../db/schema';

service RequestService {
  entity Requests as projection on db.Requests actions {
    action submit(

    ) returns Requests;

    action assign(
      processorId: String(255) not null
    ) returns Requests;

    action approve(
      approvalComment: String(500)
    ) returns Requests;

    action rejectRequest(
      rejectionReason: String(500) not null
    ) returns Requests;

    action requestClarification(
      clarificationComment: String(500) not null
    )returns Requests;

  }
}