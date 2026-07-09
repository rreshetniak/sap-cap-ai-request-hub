using com.portfolio.requesthub as db from '../db/schema';

@path: '/processor'
@requires: ['Processor', 'Admin']
service ProcessorService {
  @restrict: [
    {grant: 'READ', to: 'Processor', where: (assignedProcessorId = $user)},
    {grant: 'READ', to: 'Admin'}
  ]
  entity Requests as projection on db.Requests {
    ID,
    createdAt,
    createdBy,
    modifiedAt,
    modifiedBy,
    title,
    description,
    businessPartnerId,
    requestType,
    priority,
    status,
    aiSummary,
    comments,
    history,
    approvalSteps,
    assignedProcessorId
  };
}
