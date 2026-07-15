using { RequestService } from './request-service';

annotate RequestService.Requests with @flow.status: status actions {
  submit 
    @title: 'Submit'
    @from: [#Draft, #ClarificationRequired] 
    @to: #Submitted;

  assign 
    @title: 'Assign'
    @from: #Submitted 
    @to: #InProcess;

  approve
    @title: 'In Progress'
    @from: #InProcess
    @to: #Approved;

  rejectRequest 
    @title: 'Reject Request'
    @from: #InProcess 
    @to: #Rejected;
    
  requestClarification 
    @title: 'Clar. Required'
    @from: #InProcess
    @to: #ClarificationRequired;
};
