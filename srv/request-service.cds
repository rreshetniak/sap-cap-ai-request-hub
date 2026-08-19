using com.portfolio.requesthub as db from '../db/schema';

@requires: [
  'Admin',
  'Requester',
  'Processor'
]
service RequestService {

  type BusinessPartnerDetails {
    id          : String(10);
    category    : String(1);
    displayName : String(81);
  }

  type AiSummarySuggestion {
    summary     : LargeString;
    provider    : String(40);
    generatedAt : Timestamp;
  }

  @restrict: [
    {
      grant: [
        'READ',
        'submit',
        'generateAiSummary',
        'acceptAiSummary'
      ],
      to   : 'Requester',
      where: (createdBy = $user)
    },
    {
      grant: 'READ',
      to   : 'Processor',
      where: (assignedProcessorId = $user)
    },
    {
      grant: 'assign',
      to   : 'Processor'
    },
    {
      grant: [
        'approve',
        'rejectRequest',
        'requestClarification'
      ],
      to   : 'Processor',
      where: (assignedProcessorId = $user)
    },
    {
      grant: '*',
      to   : 'Admin'
    }
  ]

  entity Requests as projection on db.Requests
    actions {
      @requires: [
        'Requester',
        'Admin'
      ]
      action   generateAiSummary()                                              returns AiSummarySuggestion;

      @requires: [
        'Requester',
        'Admin'
      ]
      action   acceptAiSummary(summary: LargeString not null)                   returns Requests;

      @requires: [
        'Requester',
        'Admin'
      ]
      action   submit()                                                         returns Requests;

      @requires: [
        'Processor',
        'Admin'
      ]
      action   assign(processorId: String(255) not null)                        returns Requests;

      @requires: [
        'Processor',
        'Admin'
      ]
      action   approve(approvalComment: String(500))                            returns Requests;

      @requires: [
        'Processor',
        'Admin'
      ]
      action   rejectRequest(rejectionReason: String(500) not null)             returns Requests;

      @requires: [
        'Processor',
        'Admin'
      ]
      action   requestClarification(clarificationComment: String(500) not null) returns Requests;

      @requires: 'Admin'
      function getBusinessPartnerDetails()                                      returns BusinessPartnerDetails;
    }
}
