using com.portfolio.requesthub as db from '../db/schema';

@path: '/requester'
service RequesterService {
  entity Requests as projection on db.Requests {
    ID,
    createdAt,
    title,
    description,
    businessPartnerId,
    requestType,
    priority,
    status,
    aiSummary,
    comments
  };
}
