using com.portfolio.requesthub as db from '../db/schema';

@path: '/processor'
service ProcessorService {
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
