using { RequestService } from './request-service';

annotate RequestService.Requests with @flow.status: status actions {
  submit 
    @from: [#Draft, #ClarificationRequired] 
    @to: #Submitted;

  assign 
    @from: #Submitted 
    @to: #InProcess;

  approve
    @from: #InProcess
    @to: #Approved;

  rejectRequest 
    @from: #InProcess 
    @to: #Rejected;
    
  requestClarification 
    @from: #InProcess
    @to: #ClarificationRequired;
};
