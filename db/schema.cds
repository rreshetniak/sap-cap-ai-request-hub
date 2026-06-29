namespace com.portfolio.requesthub;

using {
  cuid,
  managed
} from '@sap/cds/common';

@cds.autoexpose
entity RequestTypes {
  key code        : String(50);
      name        : String(100);
      description : String(255);
}

@cds.autoexpose
entity RequestPriorities {
  key code        : String(20);
      name        : String(100);
      description : String(255);
}

@cds.autoexpose
entity RequestStatuses {
  key code        : String(30);
      name        : String(100);
      description : String(255);
}

entity RequestComments : cuid, managed {
  request     : Association to Requests;
  commentType : String(30);
  text        : LargeString;
}

entity RequestHistory : cuid, managed {
  request        : Association to Requests;
  eventType      : String(30);
  previousStatus : Association to RequestStatuses;
  newStatus      : Association to RequestStatuses;
  comment        : LargeString;
}

entity ApprovalSteps : cuid, managed {
  request         : Association to Requests;
  stepNo          : Integer;
  approverId      : String(255);
  decision        : String(30);
  decisionComment : LargeString;
  decidedAt       : Timestamp;
}

entity Requests : cuid, managed {
  @mandatory
  @mandatory.message: 'A request title is required.'
  title            : String(255);

  description      : LargeString;
  businessPartnerId : String(20);

  requestType      : Association to RequestTypes;
  priority         : Association to RequestPriorities;
  status           : Association to RequestStatuses;

  comments         : Composition of many RequestComments
                       on comments.request = $self;

  history          : Composition of many RequestHistory
                       on history.request = $self;

  approvalSteps    : Composition of many ApprovalSteps
                       on approvalSteps.request = $self;

  aiSummary        : LargeString;
}
