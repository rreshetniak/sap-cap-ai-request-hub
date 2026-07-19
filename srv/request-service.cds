using com.portfolio.requesthub as db from '../db/schema';

@requires: ['Admin', 'Requester', 'Processor']
service RequestService {

  type BusinessPartnerDetails {
    id:           String(10);
    category:     String(1);
    displayName:  String(81);
  }

  entity Requests as projection on db.Requests actions {
    @requires: ['Requester', 'Admin']
    action submit(
    ) returns Requests;

    @requires: ['Processor', 'Admin']
    action assign(
      processorId: String(255) not null
    ) returns Requests;

    @requires: ['Processor', 'Admin']
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

    @requires: 'Admin'
    function getBusinessPartnerDetails()
      returns BusinessPartnerDetails;
  }
}